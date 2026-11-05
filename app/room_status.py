"""Xác định trạng thái phòng theo dữ liệu đơn đặt phòng và thời gian thực tế.

Cột rooms.operational_status chỉ lưu trạng thái vật lý do nhân viên đánh dấu:
    available (Trống), cleaning (Chờ dọn), maintenance (Bảo trì).
Hai trạng thái còn lại KHÔNG ghi cứng vào bảng rooms mà được tính từ bảng bookings:
    reserved (Đã đặt trước)  : có đơn đã xác nhận (confirmed) phủ ngày đang xét.
    occupied (Đang có khách) : có đơn đang lưu trú (checked_in) phủ ngày đang xét.
Nhờ vậy lịch phòng luôn khớp với đơn: hủy đơn, sửa ngày, đổi phòng... đều tự cập nhật.

Thứ tự ưu tiên cho NGÀY HÔM NAY (cũng là trạng thái hiển thị trên sơ đồ phòng):
    Đang có khách > Bảo trì > Chờ dọn > Đã đặt trước > Trống
Cho NGÀY TƯƠNG LAI: Đang có khách (khách đang ở kéo dài) > Đã đặt trước > Bảo trì > Trống
Cho NGÀY QUÁ KHỨ: chỉ dựa vào đơn (đã lưu trú / đã đặt) > Trống
"""
from datetime import date, timedelta
from typing import Any, Iterable

ROOM_STATUSES = ("available", "reserved", "occupied", "cleaning", "maintenance")
MANUAL_ROOM_STATUSES = ("available", "cleaning", "maintenance")
DERIVED_ROOM_STATUSES = ("reserved", "occupied")
CALENDAR_BOOKING_STATUSES = ("pending", "confirmed", "checked_in", "checked_out")

ROOM_STATUS_LABELS = {
    "available": "Trống",
    "reserved": "Đã đặt trước",
    "occupied": "Đang có khách",
    "cleaning": "Chờ dọn",
    "maintenance": "Bảo trì",
}

CALENDAR_BOOKING_SQL = """SELECT b.id, b.booking_code, b.room_id, b.status, b.check_in, b.check_out, b.guests,
                  COALESCE(c.full_name, u.full_name, 'Khách hàng') AS customer_name,
                  COALESCE(c.phone, '') AS customer_phone,
                  COALESCE(c.email, u.email) AS customer_email
           FROM bookings b
           LEFT JOIN customers c ON c.id = b.customer_id
           LEFT JOIN users u ON u.id = b.user_id"""


def occupied_until(booking: dict[str, Any], today: date) -> date:
    """Ngày (không tính) mà khách thôi chiếm phòng.

    - Đang lưu trú: ít nhất tới hết hôm nay, kể cả khi đã quá ngày trả phòng mà chưa check-out.
    - Đã trả phòng: không chiếm phòng từ hôm nay trở đi (khách có thể đã trả sớm).
    """
    check_out = booking["check_out"]
    if booking["status"] == "checked_in":
        return max(check_out, today + timedelta(days=1))
    if booking["status"] == "checked_out":
        return min(check_out, today)
    return check_out


def day_status(stored_status: str, bookings: Iterable[dict[str, Any]], day: date, today: date) -> str:
    """Trạng thái một phòng trong một ngày cụ thể."""
    bookings = list(bookings)
    in_house = any(
        b["status"] in ("checked_in", "checked_out") and b["check_in"] <= day < occupied_until(b, today)
        for b in bookings
    )
    reserved = any(
        b["status"] == "confirmed" and b["check_in"] <= day < b["check_out"]
        for b in bookings
    )
    if day == today:
        if in_house:
            return "occupied"
        if stored_status in ("maintenance", "cleaning"):
            return stored_status
        if reserved:
            return "reserved"
        return "available"
    if in_house:
        return "occupied"
    if reserved:
        return "reserved"
    if day > today and stored_status == "maintenance":
        return "maintenance"
    return "available"


def load_room_bookings(
    cursor,
    room_ids: list[int] | None,
    start: date,
    end: date,
    today: date,
) -> dict[int, list[dict[str, Any]]]:
    """Đơn (chờ xác nhận, đã xác nhận, đang ở, đã trả) giao với khoảng [start, end), nhóm theo phòng."""
    if room_ids is not None and not room_ids:
        return {}
    sql = (
        CALENDAR_BOOKING_SQL
        + " WHERE b.status IN ('pending', 'confirmed', 'checked_in', 'checked_out')"
          " AND b.check_in < %s AND (b.check_out > %s OR b.status = 'checked_in')"
    )
    params: list[Any] = [end, start]
    if room_ids is not None:
        sql += " AND b.room_id IN (" + ", ".join(["%s"] * len(room_ids)) + ")"
        params.extend(room_ids)
    sql += " ORDER BY b.check_in ASC, b.id ASC"
    cursor.execute(sql, tuple(params))
    grouped: dict[int, list[dict[str, Any]]] = {}
    for row in cursor.fetchall():
        row["display_end"] = occupied_until(row, today) if row["status"] == "checked_in" else row["check_out"]
        grouped.setdefault(int(row["room_id"]), []).append(row)
    return grouped


def attach_live_status(cursor, rooms: list[dict[str, Any]], today: date | None = None) -> list[dict[str, Any]]:
    """Gắn trạng thái hôm nay (đã tính theo đơn) vào danh sách phòng.

    Mỗi phòng nhận thêm:
      stored_status       : trạng thái vật lý lưu trong DB
      operational_status  : trạng thái hiển thị (5 trạng thái)
      status_is_automatic : True nếu trạng thái do đơn đặt phòng quyết định
      reserved_*          : thông tin đơn đã đặt trước cho hôm nay (nếu có)
    """
    today = today or date.today()
    ids = [int(room["id"]) for room in rooms]
    bookings = load_room_bookings(cursor, ids, today, today + timedelta(days=1), today)
    for room in rooms:
        stored = room.get("stored_status") or room.get("operational_status") or "available"
        if stored not in MANUAL_ROOM_STATUSES:
            stored = "available"  # giá trị cũ "occupied" ghi cứng: bỏ qua, tính lại theo đơn
        room_bookings = bookings.get(int(room["id"]), [])
        status = day_status(stored, room_bookings, today, today)
        room["stored_status"] = stored
        room["operational_status"] = status
        room["status_is_automatic"] = status in DERIVED_ROOM_STATUSES
        reserved = next(
            (b for b in room_bookings
             if b["status"] == "confirmed" and b["check_in"] <= today < b["check_out"]),
            None,
        )
        room["reserved_booking_id"] = reserved["id"] if reserved else None
        room["reserved_booking_code"] = reserved["booking_code"] if reserved else None
        room["reserved_guest_name"] = reserved["customer_name"] if reserved else None
        room["reserved_guest_phone"] = reserved["customer_phone"] if reserved else None
        room["reserved_check_in"] = reserved["check_in"] if reserved else None
        room["reserved_check_out"] = reserved["check_out"] if reserved else None
    return rooms
