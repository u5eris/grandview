-- 006: cấu trúc phòng và bộ ảnh cho từng hạng phòng.
-- Chạy trên cơ sở dữ liệu đã có; cài mới thì schema.sql đã bao gồm các cột này.
-- Có thể chạy lại nhiều lần: cột nào đã có thì bỏ qua.
USE hotel_management;

DROP PROCEDURE IF EXISTS migrate_room_type_details;
DELIMITER $$
CREATE PROCEDURE migrate_room_type_details()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = DATABASE() AND table_name = 'room_types' AND column_name = 'area_sqm') THEN
        ALTER TABLE room_types ADD COLUMN area_sqm SMALLINT UNSIGNED NULL AFTER image_url;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = DATABASE() AND table_name = 'room_types' AND column_name = 'bed_type') THEN
        ALTER TABLE room_types ADD COLUMN bed_type VARCHAR(80) NULL AFTER area_sqm;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = DATABASE() AND table_name = 'room_types' AND column_name = 'view_name') THEN
        ALTER TABLE room_types ADD COLUMN view_name VARCHAR(80) NULL AFTER bed_type;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = DATABASE() AND table_name = 'room_types' AND column_name = 'layout_summary') THEN
        ALTER TABLE room_types ADD COLUMN layout_summary VARCHAR(255) NULL AFTER view_name;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = DATABASE() AND table_name = 'room_types' AND column_name = 'amenities') THEN
        ALTER TABLE room_types ADD COLUMN amenities VARCHAR(600) NULL AFTER layout_summary;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = DATABASE() AND table_name = 'room_types' AND column_name = 'gallery_json') THEN
        ALTER TABLE room_types ADD COLUMN gallery_json TEXT NULL AFTER amenities;
    END IF;
END$$
DELIMITER ;

CALL migrate_room_type_details();
DROP PROCEDURE IF EXISTS migrate_room_type_details;

-- Dữ liệu mẫu: chạy `python -m app.seed` để điền cấu trúc và ảnh.
SELECT 'Room type details migration completed.' AS result;
