# Grandview Hotel — FastAPI + MySQL

Website và hệ thống quản lý khách sạn Grandview. Frontend HTML/CSS/JavaScript nằm trong `frontend/` và được FastAPI phục vụ trực tiếp. Backend kết nối MySQL bằng `mysql-connector-python` (không dùng SQLAlchemy).

## 1. Chức năng

**Khách (không cần tài khoản)**
- Xem các hạng phòng, cấu trúc phòng, mặt bằng và mô hình 3D.
- Tìm phòng trống theo ngày và số khách, đặt phòng bằng họ tên và số điện thoại (email không bắt buộc).
- Tra cứu đơn bằng số điện thoại: mã đặt phòng, trạng thái, tiền phòng, tiền dịch vụ, tiền cọc.
- Khi đã nhận phòng: gọi đồ ăn, đặt xe, dọn phòng, spa trên trang `dich-vu.html`.
- Trang Khám phá Đà Lạt với dự báo thời tiết (`kham-pha.html`).
- Các trang khách có hai ngôn ngữ, Việt và Anh, đổi bằng nút VI / EN hoặc `?lang=en` trên đường dẫn.

**Lễ tân và quản trị viên** (`management.html`)
- Sơ đồ phòng với 5 trạng thái: Trống, Đã đặt trước, Đang có khách, Chờ dọn, Bảo trì. Nhân viên chỉ đặt tay Trống / Chờ dọn / Bảo trì; Đã đặt trước và Đang có khách tự tính theo đơn (`app/room_status.py`).
- Thêm khách tại quầy (khách đến thẳng, nhận phòng ngay hôm nay).
- Lịch phòng theo ngày.
- Xác nhận, từ chối, nhận khách, trả phòng; sửa đơn, đổi phòng, gia hạn; nhận cọc; hủy đơn có xử lý cọc.
- Tiếp nhận yêu cầu dịch vụ phòng; xuất hóa đơn khi trả phòng.
- Lịch sử đơn có tìm kiếm và lọc.
- Quản trị viên: Dashboard phân tích theo 7/30/90 ngày (xem `ADMIN_DASHBOARD_UPDATE.md`), quản lý tài khoản nhân viên (mã nhân viên, khóa/mở, đặt lại mật khẩu, nhật ký thao tác).

Chưa có: thanh toán trực tuyến, gửi email/SMS, OTP.

## 2. Yêu cầu

- Python 3.10 trở lên.
- MySQL 8.x.

## 3. Cài đặt lần đầu (database mới)

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

1. Chạy `database/schema.sql` trong MySQL Workbench (hoặc dòng lệnh `mysql`) để tạo database `hotel_management`.
2. Sao chép `.env.example` thành `.env`, điền tài khoản MySQL và một `JWT_SECRET_KEY` ngẫu nhiên dài. Không đưa `.env` lên GitHub hay gửi cho người khác.
3. Nạp dữ liệu mẫu: `python -m app.seed`
4. Chạy máy chủ: `python -m uvicorn app.main:app --reload`
5. Mở <http://127.0.0.1:8000>.

Khi khởi động, máy chủ tự tạo các bảng dịch vụ, hóa đơn, tiền cọc, nhật ký đơn và các cột cấu trúc phòng nếu còn thiếu (cần quyền `CREATE`, `ALTER`).

Tài khoản demo do `app.seed` tạo (chỉ dùng trên máy local, đổi mật khẩu trước khi trình diễn chung):

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Quản trị viên (QT001) | `admin@grandview.com` | `Admin12345!` |
| Lễ tân (LT001) | `reception@grandview.com` | `Reception123!` |

Tạo tài khoản MySQL riêng cho ứng dụng (khuyến nghị):

```sql
CREATE USER IF NOT EXISTS 'hotel_app'@'localhost' IDENTIFIED BY 'change_this_password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX ON hotel_management.* TO 'hotel_app'@'localhost';
FLUSH PRIVILEGES;
```

## 4. Cập nhật máy đã có dữ liệu

Không chạy lại `schema.sql`. Sao lưu database, rồi chạy lần lượt các file trong `database/migrations/` mà máy bạn chưa chạy:

| File | Nội dung |
| --- | --- |
| `001_guest_checkout.sql` | Đặt phòng không cần tài khoản |
| `002_service_requests.sql` | Yêu cầu dịch vụ phòng |
| `003_invoices.sql` | Hóa đơn |
| `004_deposits_changes.sql` | Tiền cọc, nhật ký thay đổi đơn |
| `005_staff_accounts_room_calendar.sql` | Mã nhân viên, nhật ký thao tác, trạng thái phòng tính theo đơn |
| `006_room_type_details.sql` | Cấu trúc phòng, ảnh và mặt bằng cho từng hạng phòng |

Các file 005 và 006 chạy lại được nhiều lần. Sau đó chạy `python -m app.seed` để điền mô tả cấu trúc phòng. Xem thêm `HOP_NHAT.md`, `CAP_NHAT.md` và `ADMIN_DASHBOARD_UPDATE.md`.

## 5. API

Mở <http://127.0.0.1:8000/docs> để thử. Các nhóm chính:

| Nhóm | Endpoint |
| --- | --- |
| Hệ thống | `GET /api/health`, `GET /api/weather` |
| Đăng nhập nhân viên | `POST /api/auth/login`, `GET /api/auth/me` |
| Khách xem và đặt phòng | `GET /api/room-types`, `GET /api/room-availability`, `POST /api/bookings`, `POST /api/bookings/lookup`, `POST /api/bookings/lookup-by-phone` |
| Dịch vụ phòng (khách) | `GET /api/services/catalog`, `POST /api/guest/service-session`, `GET /api/guest/me`, `GET/POST /api/guest/service-requests`, `POST /api/guest/service-requests/{id}/cancel` |
| Lễ tân: đơn | `GET /api/bookings/pending`, `/active`, `/history`, `GET/PATCH /api/bookings/{id}`, `PATCH /api/bookings/{id}/status`, `GET /api/bookings/{id}/room-options`, `POST /api/bookings/{id}/cancel`, `POST /api/bookings/{id}/deposit`, `GET /api/bookings/{id}/invoice-preview`, `GET /api/bookings/{id}/invoice` |
| Lễ tân: phòng | `GET /api/rooms`, `GET /api/staff/rooms`, `GET /api/staff/rooms/{id}/detail`, `PATCH /api/rooms/{id}/operational-status`, `POST /api/staff/walk-ins`, `GET /api/staff/room-calendar` |
| Lễ tân: dịch vụ | `GET /api/service-requests`, `PATCH /api/service-requests/{id}/status` |
| Quản trị | `GET /api/dashboard/summary`, `GET /api/dashboard/analytics?days=7\|30\|90` |
| Tài khoản nhân viên | `GET/POST /api/staff/accounts`, `GET/PATCH /api/staff/accounts/{id}`, `PATCH /api/staff/accounts/{id}/status`, `POST /api/staff/accounts/{id}/reset-password`, `GET /api/staff/accounts/{id}/activity` |

Ví dụ `POST /api/bookings` (không cần đăng nhập):

```json
{
  "room_type_id": 1,
  "check_in": "2026-12-01",
  "check_out": "2026-12-03",
  "guests": 2,
  "customer_name": "Nguyễn Văn A",
  "customer_phone": "0901234567",
  "customer_email": null,
  "note": "Phòng yên tĩnh"
}
```

## 6. Tài nguyên tĩnh

| Thư mục | Nội dung |
| --- | --- |
| `frontend/images/` | Ảnh minh họa phòng (`phong-*.svg`), mặt bằng (`so-do-*.svg`), ảnh tiện ích (`tien-ich-*.svg`) |
| `frontend/models/` | Mô hình 3D từng hạng phòng (`phong-*.glb`) |
| `frontend/js/room-3d.js` | Trình xem 3D, tải thư viện three.js từ jsDelivr khi khách bấm "Xem 3D" |

Khi thay ảnh hoặc mô hình, tăng số phiên bản `?v=` trong đường dẫn để trình duyệt không dùng bản cũ.

## 7. Song ngữ

`frontend/i18n.js` chứa từ điển chung và bản dịch hạng phòng, danh mục dịch vụ, thông báo lỗi. Mỗi trang thêm từ điển riêng bằng `GV_I18N.add({...})`. Máy chủ vẫn trả tiếng Việt; trình duyệt dịch khi hiển thị. Khi thêm hạng phòng, món dịch vụ hoặc thông báo lỗi mới, nhớ thêm bản tiếng Anh vào `i18n.js`, nếu không trang tiếng Anh sẽ hiện tiếng Việt.

## 8. Tài liệu

- `docs/thiet-ke-he-thong.md`: kiến trúc, luồng dữ liệu, mô hình dữ liệu, API, bảo mật, đánh đổi và việc cần xem lại.
- `docs/nghien-cuu-nguoi-dung.md`: kế hoạch nghiên cứu người dùng, kịch bản phỏng vấn và kiểm thử, khảo sát song ngữ, cách tổng hợp.

## 9. Lưu ý thiết kế

- Đơn `pending`, `confirmed`, `checked_in` đều giữ phòng, nên không thể đặt trùng ngày.
- Khách đặt theo hạng phòng; số phòng được xếp tự động và chỉ hiện cho khách khi đã nhận phòng.
- Tiền phòng = giá một đêm × số đêm, chưa gồm thuế và phụ thu.
- Token nhân viên lưu trong `sessionStorage`; khi triển khai thật cần HTTPS và rà soát bảo mật.
- Tra cứu đơn và vào dịch vụ phòng chỉ cần số điện thoại, có giới hạn 10 lần thử mỗi 10 phút cho mỗi IP. Người biết số điện thoại của khách có thể xem đơn và gọi dịch vụ tính vào phòng đó; nên bổ sung OTP trước khi dùng thật.

## 10. Triển khai lên Render

Xem hướng dẫn đầy đủ trong `HUONG_DAN_TRIEN_KHAI.md`. Tóm tắt:

1. Tạo MySQL gói Free trên Aiven, sao chép **Service URI** và tải **CA certificate**.
2. Chạy `python -m app.setup_db` trên máy: dán Service URI, kéo thả `ca.pem`, đặt mật khẩu nhân viên. Lệnh này tạo database, bảng và dữ liệu mẫu.
3. Push lên GitHub (có `certs/ca.pem`, không có `.env`).
4. Trên Render: **New → Blueprint**, chọn repo, dán Service URI vào `DATABASE_URL`.

Không cần sửa code: địa chỉ website trong trang chủ, `robots.txt` và `sitemap.xml` được máy chủ tự điền theo địa chỉ thật; `certs/ca.pem` được tự dùng khi database không nằm trên máy.


## Bản đồ và chỉ đường tham quan

Tính năng bản đồ dùng Goong Geocoding, TomTom Routing và Leaflet. Xem hướng dẫn cấu hình API key trong [`docs/goong-tomtom-leaflet.md`](docs/goong-tomtom-leaflet.md). API key phải được đặt trong `.env` ở backend, không đặt trong frontend.
