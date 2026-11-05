from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse
import os

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
# Trên máy local đọc file .env; trên Render dùng Environment Variables (load_dotenv không ghi đè).
load_dotenv(PROJECT_ROOT / ".env")

LOCAL_HOSTS = ("127.0.0.1", "localhost", "::1")
DEFAULT_SSL_CA = PROJECT_ROOT / "certs" / "ca.pem"

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "hotel_management")
DB_USER = os.getenv("DB_USER", "hotel_app")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

# Đường dẫn chứng chỉ CA của MySQL trên cloud, tính từ thư mục dự án.
# Để trống: nếu database không nằm trên máy này và có file certs/ca.pem thì tự dùng file đó.
DB_SSL_CA = os.getenv("DB_SSL_CA", "").strip()

# Múi giờ cho phiên MySQL, để CURRENT_TIMESTAMP khớp giờ Việt Nam
# (máy chủ cloud thường chạy giờ UTC).
DB_TIME_ZONE = os.getenv("DB_TIME_ZONE", "+07:00").strip()


def apply_database_url(url: str) -> None:
    """Lấy host, port, user, mật khẩu từ một chuỗi kết nối, ví dụ Service URI của Aiven:

        mysql://avnadmin:mat-khau@ten-dich-vu.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED

    Tên database trong chuỗi (thường là defaultdb) bị bỏ qua; dự án luôn dùng DB_NAME.
    """
    global DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
    parsed = urlparse(url.strip())
    if parsed.scheme not in ("mysql", "mysql+mysqlconnector", "mysql+pymysql") or not parsed.hostname:
        raise ValueError("Chuỗi kết nối phải có dạng mysql://user:mat-khau@host:port/...")
    DB_HOST = parsed.hostname
    DB_PORT = parsed.port or 3306
    if parsed.username:
        DB_USER = unquote(parsed.username)
    if parsed.password is not None:
        DB_PASSWORD = unquote(parsed.password)
    ssl_ca = parse_qs(parsed.query).get("ssl-ca")
    if ssl_ca:
        global DB_SSL_CA
        DB_SSL_CA = ssl_ca[0]


# Trên Render chỉ cần đặt DATABASE_URL (dán Service URI của Aiven); giá trị này ghi đè các biến DB_* ở trên.
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
if DATABASE_URL:
    apply_database_url(DATABASE_URL)

# Địa chỉ website, dùng cho canonical, robots.txt, sitemap.xml.
# Để trống thì lấy theo địa chỉ khách đang truy cập (đúng với cả Render và tên miền riêng).
SITE_URL = os.getenv("SITE_URL", "").strip()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "120"))
JWT_ALGORITHM = "HS256"

if not JWT_SECRET_KEY:
    # The app can still start for health checks, but login will fail closed.
    JWT_SECRET_KEY = ""
