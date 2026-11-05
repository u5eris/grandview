from collections.abc import Generator
from pathlib import Path

import mysql.connector
from mysql.connector import MySQLConnection
from fastapi import HTTPException

from app import config


def _ssl_ca_path() -> str | None:
    """Đường dẫn tuyệt đối tới chứng chỉ CA, hoặc None nếu không kiểm tra chứng chỉ.

    - DB_SSL_CA có giá trị: dùng đúng file đó (báo lỗi nếu không có).
    - DB_SSL_CA trống, database ở máy khác và có certs/ca.pem: tự dùng certs/ca.pem.
    - Database trên máy này: không dùng chứng chỉ (MySQL local dùng chứng chỉ tự ký).
    """
    if not config.DB_SSL_CA:
        if config.DB_HOST in config.LOCAL_HOSTS or not config.DEFAULT_SSL_CA.is_file():
            return None
        return str(config.DEFAULT_SSL_CA)
    path = Path(config.DB_SSL_CA)
    if not path.is_absolute():
        path = config.PROJECT_ROOT / path
    if not path.is_file():
        raise mysql.connector.Error(msg=f"Không tìm thấy chứng chỉ CA tại {path}. Kiểm tra biến DB_SSL_CA.")
    return str(path)


def connection_options(include_database: bool = True) -> dict:
    """Tham số kết nối MySQL dùng chung cho máy chủ và các script."""
    options = {
        "host": config.DB_HOST,
        "port": config.DB_PORT,
        "user": config.DB_USER,
        "password": config.DB_PASSWORD,
        "connection_timeout": 15,
    }
    if include_database:
        options["database"] = config.DB_NAME
    if config.DB_TIME_ZONE:
        options["time_zone"] = config.DB_TIME_ZONE
    ssl_ca = _ssl_ca_path()
    if ssl_ca:
        options["ssl_ca"] = ssl_ca
        options["ssl_verify_cert"] = True
    elif config.DB_HOST not in config.LOCAL_HOSTS:
        # Database trên cloud nhưng chưa có chứng chỉ: vẫn mã hóa đường truyền, chỉ không kiểm tra CA.
        options["ssl_disabled"] = False
    return options


def connect_db() -> MySQLConnection:
    """Create a new MySQL connection for one request or task."""
    return mysql.connector.connect(autocommit=False, **connection_options())


def get_db() -> Generator[MySQLConnection, None, None]:
    connection = None
    try:
        connection = connect_db()
        yield connection
    except mysql.connector.Error as exc:
        if connection and connection.is_connected():
            connection.rollback()
        raise HTTPException(
            status_code=503,
            detail="Không thể kết nối cơ sở dữ liệu. Hãy kiểm tra MySQL và file .env.",
        ) from exc
    finally:
        if connection and connection.is_connected():
            connection.close()
