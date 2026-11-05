-- Migration 005: tài khoản nhân viên (mã NV, số điện thoại), nhật ký thao tác,
-- và bỏ trạng thái phòng "occupied" ghi cứng (nay tính theo đơn đặt phòng).
-- Có thể chạy lại nhiều lần. Backend cũng tự thực hiện các bước này khi khởi động.
USE hotel_management;

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

DROP PROCEDURE IF EXISTS migrate_005_staff;
DELIMITER $$
CREATE PROCEDURE migrate_005_staff()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'employee_code'
    ) THEN
        ALTER TABLE users ADD COLUMN employee_code VARCHAR(20) NULL AFTER id;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'phone'
    ) THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER email;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'uq_users_employee_code'
    ) THEN
        CREATE UNIQUE INDEX uq_users_employee_code ON users (employee_code);
    END IF;

    -- Cấp mã cho nhân viên cũ chưa có mã: QT = quản trị, LT = lễ tân.
    UPDATE users
       SET employee_code = CONCAT(IF(role = 'admin', 'QT', 'LT'), LPAD(id, 3, '0'))
     WHERE employee_code IS NULL AND role IN ('admin', 'receptionist');

    -- "Đang có khách" nay được tính từ đơn checked_in.
    UPDATE rooms SET operational_status = 'available' WHERE operational_status = 'occupied';
END$$
DELIMITER ;

CALL migrate_005_staff();
DROP PROCEDURE IF EXISTS migrate_005_staff;

SELECT 'Migration 005 completed.' AS result;
