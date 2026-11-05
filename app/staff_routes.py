"""API bổ sung cho trang vận hành.

Phần A — Lịch quản lý phòng: GET /api/staff/room-calendar
Phần C — Quản lý tài khoản nhân viên (chỉ Admin): /api/staff/accounts...
Kèm nhật ký thao tác nhân viên (chỉ Admin xem).
"""
from datetime import date, timedelta
from typing import Any, Literal
import re

from fastapi import APIRouter, Depends, HTTPException, Query, status
from mysql.connector import MySQLConnection
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.db import get_db
from app.room_status import (
    MANUAL_ROOM_STATUSES,
    ROOM_STATUS_LABELS,
    day_status,
    load_room_bookings,
)
from app.security import hash_password, require_roles

router = APIRouter()

# ==========================================================
# Bảng phụ và cột mới (tự tạo khi khởi động, tương đương migration 005)
# ==========================================================
STAFF_LOG_TABLE_SQL = """CREATE TABLE IF NOT EXISTS staff_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT UNSIGNED NOT NULL,
    action VARCHAR(40) NOT NULL,
    detail VARCHAR(1000) NOT NULL,
    target_user_id BIGINT UNSIGNED NULL,
    room_id BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_staff_log_staff (staff_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"""


def _column_exists(cursor, table: str, column: str) -> bool:
    cursor.execute(
        """SELECT 1 FROM information_schema.columns
           WHERE table_schema = DATABASE() AND table_name = %s AND column_name = %s""",
        (table, column),
    )
    return cursor.fetchone() is not None


def _index_exists(cursor, table: str, index: str) -> bool:
    cursor.execute(
        """SELECT 1 FROM information_schema.statistics
           WHERE table_schema = DATABASE() AND table_name = %s AND index_name = %s""",
        (table, index),
    )
    return cursor.fetchone() is not None


def ensure_staff_schema(connection) -> None:
    """Thêm mã nhân viên, số điện thoại cho users; tạo bảng nhật ký; bỏ trạng thái phòng ghi cứng."""
    cursor = connection.cursor()
    try:
        cursor.execute(STAFF_LOG_TABLE_SQL)
        if not _column_exists(cursor, "users", "employee_code"):
            cursor.execute("ALTER TABLE users ADD COLUMN employee_code VARCHAR(20) NULL AFTER id")
        if not _column_exists(cursor, "users", "phone"):
            cursor.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER email")
        if not _index_exists(cursor, "users", "uq_users_employee_code"):
            cursor.execute("CREATE UNIQUE INDEX uq_users_employee_code ON users (employee_code)")

        # Cấp mã cho tài khoản nhân viên cũ chưa có mã (QT = quản trị, LT = lễ tân).
        cursor.execute(
            "SELECT id, role FROM users WHERE employee_code IS NULL AND role IN ('admin', 'receptionist')"
        )
        for user_id, role in cursor.fetchall():
            prefix = "QT" if role == "admin" else "LT"
            for attempt in range(0, 50):
                code = f"{prefix}{int(user_id) + attempt:03d}"
                cursor.execute("SELECT 1 FROM users WHERE employee_code = %s", (code,))
                if cursor.fetchone() is None:
                    cursor.execute("UPDATE users SET employee_code = %s WHERE id = %s", (code, user_id))
                    break

        # Phần B: "Đang có khách" giờ được tính từ đơn checked_in, không ghi cứng vào bảng rooms.
        cursor.execute("UPDATE rooms SET operational_status = 'available' WHERE operational_status = 'occupied'")
        connection.commit()
    finally:
        cursor.close()


def log_staff_activity(cursor, staff_id: int, action: str, detail: str,
                       target_user_id: int | None = None, room_id: int | None = None) -> None:
    cursor.execute(
        """INSERT INTO staff_activity_logs (staff_id, action, detail, target_user_id, room_id)
           VALUES (%s, %s, %s, %s, %s)""",
        (staff_id, action, detail[:1000], target_user_id, room_id),
    )


# ==========================================================
# Phần A — Lịch quản lý phòng
# ==========================================================
@router.get("/api/staff/room-calendar")
def room_calendar(
    start: date,
    days: int = Query(default=7, ge=1, le=62),
    floor: int | None = Query(default=None, ge=0, le=255),
    room_type_id: int | None = Query(default=None, gt=0),
    connection: MySQLConnection = Depends(get_db),
    _staff: dict[str, Any] = Depends(require_roles("receptionist", "admin")),
):
    """Lịch phòng theo ngày / tuần / tháng: trạng thái từng phòng theo từng ngày và các đơn trong khoảng đó."""
    end = start + timedelta(days=days)
    today = date.today()
    dates = [start + timedelta(days=i) for i in range(days)]
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT DISTINCT r.floor FROM rooms r
               JOIN room_types rt ON rt.id = r.room_type_id
               WHERE r.is_active = TRUE AND rt.is_active = TRUE AND r.floor IS NOT NULL
               ORDER BY r.floor"""
        )
        floors = [row["floor"] for row in cursor.fetchall()]
        cursor.execute(
            """SELECT rt.id, rt.name FROM room_types rt
               WHERE rt.is_active = TRUE AND EXISTS (
                   SELECT 1 FROM rooms r WHERE r.room_type_id = rt.id AND r.is_active = TRUE)
               ORDER BY rt.base_price, rt.id"""
        )
        room_types = cursor.fetchall()

        conditions = ["r.is_active = TRUE", "rt.is_active = TRUE"]
        params: list[Any] = []
        if floor is not None:
            conditions.append("r.floor = %s")
            params.append(floor)
        if room_type_id:
            conditions.append("rt.id = %s")
            params.append(room_type_id)
        cursor.execute(
            """SELECT r.id, r.room_number, r.floor, r.operational_status AS stored_status,
                      rt.id AS room_type_id, rt.name AS room_type, rt.max_guests
               FROM rooms r JOIN room_types rt ON rt.id = r.room_type_id
               WHERE """ + " AND ".join(conditions) + """
               ORDER BY rt.base_price, rt.id, r.floor, r.room_number""",
            tuple(params),
        )
        rooms = cursor.fetchall()

        # Lấy rộng thêm hôm nay để tính trạng thái hiện tại cho cột phòng.
        window_start = min(start, today)
        window_end = max(end, today + timedelta(days=1))
        grouped = load_room_bookings(cursor, [int(r["id"]) for r in rooms], window_start, window_end, today)

        bookings_out: list[dict[str, Any]] = []
        for room in rooms:
            stored = room["stored_status"] if room["stored_status"] in MANUAL_ROOM_STATUSES else "available"
            room["stored_status"] = stored
            room_bookings = grouped.get(int(room["id"]), [])
            room["current_status"] = day_status(stored, room_bookings, today, today)
            room["days"] = [day_status(stored, room_bookings, d, today) for d in dates]
            for booking in room_bookings:
                if booking["check_in"] < end and booking["display_end"] > start:
                    bookings_out.append(booking)

        bookings_out.sort(key=lambda b: (b["room_id"], b["check_in"], b["id"]))
        return {
            "start": start,
            "end": end,
            "today": today,
            "dates": dates,
            "floors": floors,
            "room_types": room_types,
            "status_labels": ROOM_STATUS_LABELS,
            "rooms": rooms,
            "bookings": bookings_out,
        }
    finally:
        cursor.close()


# ==========================================================
# Phần C — Quản lý tài khoản nhân viên (chỉ Admin)
# ==========================================================
EMPLOYEE_CODE_PATTERN = re.compile(r"^[A-Z0-9][A-Z0-9_-]{1,19}$")


def _normalize_code(value: str) -> str:
    normalized = value.strip().upper()
    if not EMPLOYEE_CODE_PATTERN.fullmatch(normalized):
        raise ValueError("Mã nhân viên gồm 2–20 ký tự chữ, số, dấu - hoặc _ (ví dụ LT004).")
    return normalized


def _normalize_name(value: str) -> str:
    normalized = " ".join(value.split())
    if len(normalized) < 2:
        raise ValueError("Vui lòng nhập họ tên hợp lệ.")
    return normalized


def _normalize_phone(value: str) -> str:
    normalized = value.strip()
    if not re.fullmatch(r"[0-9+().\-\s]{8,20}", normalized):
        raise ValueError("Số điện thoại chỉ được chứa chữ số và ký tự + ( ) . - .")
    if not 8 <= sum(ch.isdigit() for ch in normalized) <= 15:
        raise ValueError("Số điện thoại phải có từ 8 đến 15 chữ số.")
    return normalized


def _check_password(value: str) -> str:
    if len(value) < 8:
        raise ValueError("Mật khẩu phải có ít nhất 8 ký tự.")
    if not re.search(r"[A-Za-z]", value) or not re.search(r"\d", value):
        raise ValueError("Mật khẩu phải có cả chữ và số.")
    return value


class StaffInfoInput(BaseModel):
    employee_code: str = Field(min_length=2, max_length=20)
    full_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=8, max_length=20)
    email: EmailStr

    @field_validator("employee_code")
    @classmethod
    def v_code(cls, value: str) -> str:
        return _normalize_code(value)

    @field_validator("full_name")
    @classmethod
    def v_name(cls, value: str) -> str:
        return _normalize_name(value)

    @field_validator("phone")
    @classmethod
    def v_phone(cls, value: str) -> str:
        return _normalize_phone(value)

    @field_validator("email", mode="before")
    @classmethod
    def v_email(cls, value):
        return value.strip().lower() if isinstance(value, str) else value


class StaffCreateInput(StaffInfoInput):
    password: str = Field(min_length=8, max_length=128)
    is_active: bool = True

    @field_validator("password")
    @classmethod
    def v_password(cls, value: str) -> str:
        return _check_password(value)


class StaffStatusInput(BaseModel):
    is_active: bool


class StaffPasswordInput(BaseModel):
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def v_password(cls, value: str) -> str:
        return _check_password(value)


STAFF_SELECT_SQL = """SELECT u.id, u.employee_code, u.full_name, u.phone, u.email, u.role, u.is_active, u.created_at,
                     (SELECT MAX(a.created_at) FROM staff_activity_logs a
                      WHERE a.staff_id = u.id AND a.action = 'login') AS last_login_at
              FROM users u"""


def _staff_out(row: dict[str, Any]) -> dict[str, Any]:
    row["is_active"] = bool(row["is_active"])
    for key in ("created_at", "last_login_at"):
        if row.get(key) and not isinstance(row[key], str):
            row[key] = row[key].isoformat(sep=" ", timespec="minutes")
    return row


def _load_staff(cursor, user_id: int) -> dict[str, Any]:
    cursor.execute(STAFF_SELECT_SQL + " WHERE u.id = %s AND u.role IN ('admin', 'receptionist')", (user_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản nhân viên.")
    return _staff_out(row)


def _ensure_unique(cursor, email: str, code: str, exclude_id: int | None = None) -> None:
    cursor.execute("SELECT id FROM users WHERE email = %s AND id <> %s LIMIT 1", (email, exclude_id or 0))
    if cursor.fetchone():
        raise HTTPException(status_code=409, detail="Email đăng nhập này đã được dùng cho tài khoản khác.")
    cursor.execute("SELECT id FROM users WHERE employee_code = %s AND id <> %s LIMIT 1", (code, exclude_id or 0))
    if cursor.fetchone():
        raise HTTPException(status_code=409, detail="Mã nhân viên này đã tồn tại.")


@router.get("/api/staff/accounts")
def list_staff_accounts(
    q: str | None = Query(default=None, max_length=100),
    account_status: Literal["active", "locked"] | None = Query(default=None, alias="status"),
    role: Literal["admin", "receptionist"] | None = None,
    connection: MySQLConnection = Depends(get_db),
    _admin: dict[str, Any] = Depends(require_roles("admin")),
):
    conditions = ["u.role IN ('admin', 'receptionist')"]
    params: list[Any] = []
    if q and q.strip():
        keyword = f"%{q.strip()}%"
        conditions.append("(u.full_name LIKE %s OR u.email LIKE %s OR u.phone LIKE %s OR u.employee_code LIKE %s)")
        params.extend([keyword] * 4)
    if account_status:
        conditions.append("u.is_active = %s")
        params.append(account_status == "active")
    if role:
        conditions.append("u.role = %s")
        params.append(role)
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(
            STAFF_SELECT_SQL + " WHERE " + " AND ".join(conditions)
            + " ORDER BY u.role = 'admin' DESC, u.is_active DESC, u.employee_code, u.id",
            tuple(params),
        )
        return [_staff_out(row) for row in cursor.fetchall()]
    finally:
        cursor.close()


@router.get("/api/staff/accounts/{user_id}")
def staff_account_detail(
    user_id: int,
    connection: MySQLConnection = Depends(get_db),
    _admin: dict[str, Any] = Depends(require_roles("admin")),
):
    cursor = connection.cursor(dictionary=True)
    try:
        return _load_staff(cursor, user_id)
    finally:
        cursor.close()


@router.post("/api/staff/accounts", status_code=status.HTTP_201_CREATED)
def create_staff_account(
    payload: StaffCreateInput,
    connection: MySQLConnection = Depends(get_db),
    admin: dict[str, Any] = Depends(require_roles("admin")),
):
    """Admin tạo tài khoản Lễ tân. Vai trò luôn là receptionist; ngày tạo do hệ thống ghi."""
    cursor = connection.cursor(dictionary=True)
    try:
        connection.rollback()
        connection.start_transaction()
        _ensure_unique(cursor, payload.email, payload.employee_code)
        cursor.execute(
            """INSERT INTO users (employee_code, full_name, email, phone, password_hash, role, is_active)
               VALUES (%s, %s, %s, %s, %s, 'receptionist', %s)""",
            (payload.employee_code, payload.full_name, payload.email, payload.phone,
             hash_password(payload.password), payload.is_active),
        )
        new_id = cursor.lastrowid
        log_staff_activity(
            cursor, admin["id"], "account_create",
            f"Tạo tài khoản lễ tân {payload.employee_code} – {payload.full_name}"
            + ("" if payload.is_active else " (đang khóa)"),
            target_user_id=new_id,
        )
        connection.commit()
        return _load_staff(cursor, new_id)
    except Exception:
        connection.rollback()
        raise
    finally:
        cursor.close()


@router.patch("/api/staff/accounts/{user_id}")
def update_staff_account(
    user_id: int,
    payload: StaffInfoInput,
    connection: MySQLConnection = Depends(get_db),
    admin: dict[str, Any] = Depends(require_roles("admin")),
):
    """Sửa thông tin nhân viên. Không đổi vai trò qua API này."""
    cursor = connection.cursor(dictionary=True)
    try:
        connection.rollback()
        connection.start_transaction()
        before = _load_staff(cursor, user_id)
        _ensure_unique(cursor, payload.email, payload.employee_code, exclude_id=user_id)
        cursor.execute(
            "UPDATE users SET employee_code = %s, full_name = %s, phone = %s, email = %s WHERE id = %s",
            (payload.employee_code, payload.full_name, payload.phone, payload.email, user_id),
        )
        labels = {"employee_code": "mã NV", "full_name": "họ tên", "phone": "SĐT", "email": "email"}
        changes = [
            f"{label}: {before.get(key) or '—'} → {getattr(payload, key)}"
            for key, label in labels.items() if (before.get(key) or "") != getattr(payload, key)
        ]
        if changes:
            log_staff_activity(
                cursor, admin["id"], "account_update",
                f"Sửa tài khoản {payload.employee_code}: " + "; ".join(changes),
                target_user_id=user_id,
            )
        connection.commit()
        return _load_staff(cursor, user_id)
    except Exception:
        connection.rollback()
        raise
    finally:
        cursor.close()


def _editable_receptionist(target: dict[str, Any], admin: dict[str, Any]) -> None:
    if target["id"] == admin["id"]:
        raise HTTPException(status_code=409, detail="Không thể tự khóa hoặc đặt lại mật khẩu tài khoản đang đăng nhập.")
    if target["role"] != "receptionist":
        raise HTTPException(status_code=403, detail="Chỉ khóa hoặc đặt lại mật khẩu cho tài khoản Lễ tân.")


@router.patch("/api/staff/accounts/{user_id}/status")
def set_staff_account_status(
    user_id: int,
    payload: StaffStatusInput,
    connection: MySQLConnection = Depends(get_db),
    admin: dict[str, Any] = Depends(require_roles("admin")),
):
    """Khóa / mở khóa. Tài khoản bị khóa bị đăng xuất ngay ở yêu cầu kế tiếp."""
    cursor = connection.cursor(dictionary=True)
    try:
        connection.rollback()
        connection.start_transaction()
        target = _load_staff(cursor, user_id)
        _editable_receptionist(target, admin)
        if target["is_active"] != payload.is_active:
            cursor.execute("UPDATE users SET is_active = %s WHERE id = %s", (payload.is_active, user_id))
            log_staff_activity(
                cursor, admin["id"], "account_unlock" if payload.is_active else "account_lock",
                f"{'Mở khóa' if payload.is_active else 'Khóa'} tài khoản {target['employee_code']} – {target['full_name']}",
                target_user_id=user_id,
            )
        connection.commit()
        return _load_staff(cursor, user_id)
    except Exception:
        connection.rollback()
        raise
    finally:
        cursor.close()


@router.post("/api/staff/accounts/{user_id}/reset-password")
def reset_staff_password(
    user_id: int,
    payload: StaffPasswordInput,
    connection: MySQLConnection = Depends(get_db),
    admin: dict[str, Any] = Depends(require_roles("admin")),
):
    cursor = connection.cursor(dictionary=True)
    try:
        connection.rollback()
        connection.start_transaction()
        target = _load_staff(cursor, user_id)
        _editable_receptionist(target, admin)
        cursor.execute("UPDATE users SET password_hash = %s WHERE id = %s", (hash_password(payload.password), user_id))
        log_staff_activity(
            cursor, admin["id"], "account_password",
            f"Đặt lại mật khẩu cho {target['employee_code']} – {target['full_name']}",
            target_user_id=user_id,
        )
        connection.commit()
        return {"ok": True}
    except Exception:
        connection.rollback()
        raise
    finally:
        cursor.close()


@router.get("/api/staff/accounts/{user_id}/activity")
def staff_activity(
    user_id: int,
    limit: int = Query(default=100, ge=1, le=500),
    connection: MySQLConnection = Depends(get_db),
    _admin: dict[str, Any] = Depends(require_roles("admin")),
):
    """Lịch sử thao tác của một nhân viên: xử lý đơn, đổi trạng thái phòng, quản lý tài khoản, đăng nhập."""
    cursor = connection.cursor(dictionary=True)
    try:
        _load_staff(cursor, user_id)
        cursor.execute(
            """SELECT * FROM (
                   SELECT ch.created_at, ch.action, ch.detail, b.booking_code AS booking_code,
                          r.room_number AS room_number
                   FROM booking_changes ch
                   LEFT JOIN bookings b ON b.id = ch.booking_id
                   LEFT JOIN rooms r ON r.id = b.room_id
                   WHERE ch.staff_id = %s
                   UNION ALL
                   SELECT a.created_at, a.action, a.detail, NULL AS booking_code, r.room_number AS room_number
                   FROM staff_activity_logs a
                   LEFT JOIN rooms r ON r.id = a.room_id
                   WHERE a.staff_id = %s
               ) x
               ORDER BY created_at DESC
               LIMIT %s""",
            (user_id, user_id, limit),
        )
        rows = cursor.fetchall()
        for row in rows:
            if row.get("created_at") and not isinstance(row["created_at"], str):
                row["created_at"] = row["created_at"].isoformat(sep=" ", timespec="minutes")
        return rows
    finally:
        cursor.close()
