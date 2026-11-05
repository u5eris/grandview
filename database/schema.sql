CREATE DATABASE IF NOT EXISTS hotel_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hotel_management;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    employee_code VARCHAR(20) NULL,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    phone VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'receptionist', 'admin') NOT NULL DEFAULT 'customer',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_employee_code (employee_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS room_types (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    base_price DECIMAL(12, 2) NOT NULL,
    max_guests TINYINT UNSIGNED NOT NULL DEFAULT 2,
    image_url VARCHAR(500) NULL,
    area_sqm SMALLINT UNSIGNED NULL,
    bed_type VARCHAR(80) NULL,
    view_name VARCHAR(80) NULL,
    layout_summary VARCHAR(255) NULL,
    amenities VARCHAR(600) NULL,
    gallery_json TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    UNIQUE KEY uq_room_types_name (name),
    CONSTRAINT chk_room_types_price CHECK (base_price >= 0),
    CONSTRAINT chk_room_types_guests CHECK (max_guests >= 1)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    room_number VARCHAR(20) NOT NULL,
    room_type_id BIGINT UNSIGNED NOT NULL,
    floor TINYINT UNSIGNED NULL,
    -- Chỉ lưu trạng thái vật lý: available / cleaning / maintenance.
    -- "Đã đặt trước" và "Đang có khách" được tính từ bảng bookings (xem app/room_status.py).
    -- Giá trị 'occupied' giữ lại trong ENUM để tương thích dữ liệu cũ.
    operational_status ENUM('available', 'occupied', 'cleaning', 'maintenance') NOT NULL DEFAULT 'available',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_rooms_number (room_number),
    KEY idx_rooms_type (room_type_id),
    CONSTRAINT fk_rooms_room_type FOREIGN KEY (room_type_id) REFERENCES room_types(id)
) ENGINE=InnoDB;

-- Public booking contacts do not need a login account.
-- A customer row is created for each new booking contact; phone/email are not unique.
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(190) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_customers_phone (phone)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    booking_code VARCHAR(40) NOT NULL,
    -- user_id is retained as nullable for historical bookings created by old customer accounts.
    user_id BIGINT UNSIGNED NULL,
    customer_id BIGINT UNSIGNED NULL,
    room_id BIGINT UNSIGNED NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests TINYINT UNSIGNED NOT NULL DEFAULT 1,
    total_price DECIMAL(12, 2) NOT NULL,
    note VARCHAR(1000) NULL,
    status ENUM('pending', 'confirmed', 'rejected', 'cancelled', 'checked_in', 'checked_out') NOT NULL DEFAULT 'pending',
    reviewed_by BIGINT UNSIGNED NULL,
    reviewed_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_bookings_code (booking_code),
    KEY idx_bookings_room_dates_status (room_id, check_in, check_out, status),
    KEY idx_bookings_user_created (user_id, created_at),
    KEY idx_bookings_customer_created (customer_id, created_at),
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_bookings_room FOREIGN KEY (room_id) REFERENCES rooms(id),
    CONSTRAINT fk_bookings_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id),
    CONSTRAINT chk_bookings_dates CHECK (check_out > check_in),
    CONSTRAINT chk_bookings_guests CHECK (guests >= 1),
    CONSTRAINT chk_bookings_price CHECK (total_price >= 0)
) ENGINE=InnoDB;

-- Nhật ký thao tác nhân viên (đăng nhập, đổi trạng thái phòng, quản lý tài khoản).
-- Thao tác trên đơn đặt phòng nằm ở bảng booking_changes.
CREATE TABLE IF NOT EXISTS staff_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT UNSIGNED NOT NULL,
    action VARCHAR(40) NOT NULL,
    detail VARCHAR(1000) NOT NULL,
    target_user_id BIGINT UNSIGNED NULL,
    room_id BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_staff_log_staff (staff_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Room types and room rows are inserted by `python -m app.seed` after .env is configured.
