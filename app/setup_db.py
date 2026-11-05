"""Tạo database Grandview trên MySQL cloud (Aiven) bằng hỏi đáp, không cần sửa file nào.

Chạy từ thư mục gốc dự án (đã cài requirements.txt):

    python -m app.setup_db

Script sẽ hỏi:
  1. Service URI của Aiven (mysql://avnadmin:...@....aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED)
  2. File CA certificate vừa tải từ Aiven (kéo thả file vào cửa sổ dòng lệnh); script chép vào certs/ca.pem
  3. Mật khẩu cho tài khoản quản trị và lễ tân

Rồi tự: kiểm tra kết nối SSL, tạo database và tất cả các bảng, nạp hạng phòng, phòng, tài khoản nhân viên.
Chạy lại nhiều lần vẫn an toàn: bảng đã có thì bỏ qua, tài khoản đã có thì giữ nguyên mật khẩu.
File .env trên máy KHÔNG bị thay đổi.

Có thể truyền sẵn Service URI để khỏi dán:  python -m app.setup_db "mysql://..."
"""
from getpass import getpass
from pathlib import Path
import os
import shutil
import sys

import mysql.connector

from app import config
from app.db import connection_options

SCHEMA_FILE = config.PROJECT_ROOT / "database" / "schema.sql"
MIN_PASSWORD_LENGTH = 8


def ask_uri() -> str:
    if len(sys.argv) > 1:
        return sys.argv[1]
    print("Bước 1/3. Trên trang Aiven, mở dịch vụ MySQL > Overview, bấm sao chép Service URI.")
    while True:
        uri = input("Dán Service URI rồi bấm Enter: ").strip().strip('"').strip("'")
        try:
            config.apply_database_url(uri)
            return uri
        except ValueError as exc:
            print(f"  {exc}")


def ask_ca() -> None:
    target = config.DEFAULT_SSL_CA
    print("\nBước 2/3. Chứng chỉ CA (nút 'CA certificate' > Download trên trang Aiven).")
    if target.is_file():
        print(f"  Đã có {target.relative_to(config.PROJECT_ROOT)}, dùng file này.")
    else:
        while True:
            raw = input("Kéo thả file ca.pem vào đây (hoặc gõ đường dẫn) rồi bấm Enter: ")
            raw = raw.strip()
            if raw.startswith("& "):  # PowerShell thêm "& " khi kéo thả file
                raw = raw[2:].strip()
            path = Path(raw.strip('"').strip("'")).expanduser()
            if path.is_file() and "BEGIN CERTIFICATE" in path.read_text(encoding="utf-8", errors="ignore"):
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(path, target)
                print(f"  Đã chép vào {target.relative_to(config.PROJECT_ROOT)}.")
                break
            print("  Không đọc được file chứng chỉ ở đường dẫn này. Thử lại.")
    config.DB_SSL_CA = str(target)


def ask_password(label: str, env_key: str) -> None:
    while True:
        first = getpass(f"Mật khẩu {label} (không hiện khi gõ, ít nhất {MIN_PASSWORD_LENGTH} ký tự): ")
        if len(first) < MIN_PASSWORD_LENGTH:
            print(f"  Mật khẩu cần ít nhất {MIN_PASSWORD_LENGTH} ký tự.")
            continue
        if first in ("Admin12345!", "Reception123!"):
            print("  Đây là mật khẩu demo công khai trong README. Hãy chọn mật khẩu khác.")
            continue
        if getpass("  Nhập lại để xác nhận: ") != first:
            print("  Hai lần nhập không khớp.")
            continue
        os.environ[env_key] = first
        return


def read_statements() -> list[str]:
    """Tách schema.sql thành từng câu lệnh; bỏ dòng chú thích '--'."""
    lines = [
        line for line in SCHEMA_FILE.read_text(encoding="utf-8").splitlines()
        if not line.strip().startswith("--")
    ]
    sql = "\n".join(lines)
    if config.DB_NAME != "hotel_management":
        sql = sql.replace("hotel_management", config.DB_NAME)
    return [part.strip() for part in sql.split(";") if part.strip()]


def create_schema() -> bool:
    print(f"\nĐang kết nối {config.DB_USER}@{config.DB_HOST}:{config.DB_PORT} ...")
    try:
        connection = mysql.connector.connect(**connection_options(include_database=False))
    except mysql.connector.Error as exc:
        print(f"[LỖI] Không kết nối được: {exc}")
        print("Kiểm tra: dịch vụ Aiven đang Running, Service URI dán đủ, máy có mạng.")
        return False

    cursor = connection.cursor()
    try:
        cursor.execute("SELECT VERSION()")
        print(f"Đã kết nối (SSL). MySQL {cursor.fetchone()[0]}")
        statements = read_statements()
        for statement in statements:
            cursor.execute(statement)
        connection.commit()
        print(f"Đã chạy {SCHEMA_FILE.name}.")
        return True
    except mysql.connector.Error as exc:
        connection.rollback()
        print(f"[LỖI] Tạo bảng thất bại: {exc}")
        return False
    finally:
        cursor.close()
        connection.close()


def main() -> int:
    print("=== Tạo database Grandview trên Aiven ===\n")
    ask_uri()
    config.DB_NAME = os.getenv("DB_NAME_CLOUD", "hotel_management")
    ask_ca()

    print("\nBước 3/3. Mật khẩu cho 2 tài khoản nhân viên (chỉ dùng khi tạo lần đầu).")
    print("Tài khoản quản trị: admin@grandview.com")
    ask_password("quản trị", "SEED_ADMIN_PASSWORD")
    print("Tài khoản lễ tân: reception@grandview.com")
    ask_password("lễ tân", "SEED_RECEPTION_PASSWORD")

    if not create_schema():
        return 1

    # Các bảng dịch vụ, hóa đơn, tiền cọc, nhật ký đơn (máy chủ cũng tự tạo khi khởi động).
    from app.main import ensure_extra_tables
    ensure_extra_tables()

    print("\nĐang nạp dữ liệu mẫu ...")
    from app import seed  # nạp sau khi đã đặt mật khẩu vào biến môi trường
    seed.ADMIN_PASSWORD = os.environ["SEED_ADMIN_PASSWORD"]
    seed.RECEPTION_PASSWORD = os.environ["SEED_RECEPTION_PASSWORD"]
    try:
        seed.main()
    except mysql.connector.Error as exc:
        print(f"[LỖI] Nạp dữ liệu mẫu thất bại: {exc}")
        return 1

    connection = mysql.connector.connect(**connection_options())
    cursor = connection.cursor()
    cursor.execute(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = %s ORDER BY table_name",
        (config.DB_NAME,),
    )
    tables = [row[0] for row in cursor.fetchall()]
    cursor.execute("SELECT COUNT(*) FROM rooms")
    room_count = cursor.fetchone()[0]
    cursor.close()
    connection.close()

    print("\n=== HOÀN TẤT ===")
    print(f"Database '{config.DB_NAME}': {len(tables)} bảng, {room_count} phòng.")
    print("\nViệc tiếp theo:")
    print("  1. git add . && git commit -m \"Thêm chứng chỉ Aiven\" && git push")
    print("  2. Trên Render, khi được hỏi DATABASE_URL: dán đúng Service URI vừa dùng ở Bước 1.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\nĐã hủy.")
        sys.exit(1)
