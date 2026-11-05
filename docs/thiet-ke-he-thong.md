# Thiết kế hệ thống — Grandview Hotel

Tài liệu mô tả kiến trúc **hiện tại** của mã nguồn (FastAPI + MySQL + trang tĩnh song ngữ), các quyết định thiết kế kèm đánh đổi, và những gì cần xem lại khi hệ thống lớn lên. Số liệu tải là ước tính cho một khách sạn 10 phòng, ghi rõ giả định.

---

## 1. Yêu cầu

### 1.1. Chức năng

| Vai | Chức năng |
| --- | --- |
| Khách (không tài khoản) | Xem hạng phòng, mặt bằng, mô hình 3D; tìm phòng trống theo ngày và số khách; đặt phòng bằng họ tên và số điện thoại; tra cứu đơn bằng số điện thoại; dùng website bằng tiếng Việt hoặc tiếng Anh |
| Khách đang lưu trú | Vào dịch vụ phòng bằng số điện thoại hoặc mã đặt phòng; gọi ăn uống, xe, dọn phòng, spa; hủy yêu cầu chưa được tiếp nhận |
| Lễ tân | Xác nhận hoặc từ chối đơn; nhận khách, trả phòng, xuất hóa đơn; sửa đơn, đổi phòng, gia hạn; nhận và tất toán cọc; thêm khách tại quầy; cập nhật trạng thái buồng phòng; xử lý yêu cầu dịch vụ |
| Quản trị viên | Mọi việc của lễ tân, cộng trang tổng quan (công suất phòng, doanh thu đã hoàn tất) |

### 1.2. Phi chức năng

| Yêu cầu | Mục tiêu | Ghi chú |
| --- | --- | --- |
| Không đặt trùng phòng | Tuyệt đối | Khóa dòng bằng `SELECT … FOR UPDATE` trong một transaction |
| Độ trễ API | Dưới 300 ms cho thao tác thường | Truy vấn đơn giản trên vài nghìn dòng |
| Sẵn sàng | Giờ hành chính, một máy chủ | Đồ án; chưa cần dự phòng |
| Ngôn ngữ | Toàn bộ trang khách có tiếng Việt và tiếng Anh | Trang quản lý chỉ tiếng Việt |
| Truy cập | Dùng được trên điện thoại, bàn phím, trình đọc màn hình | Hộp thoại trả tiêu điểm, nhãn `aria-*` theo ngôn ngữ |
| Bảo mật | Không lộ số phòng trước khi nhận phòng; nhân viên đăng nhập bằng JWT | Khách không có mật khẩu (xem mục 6) |

### 1.3. Ràng buộc

- Nhóm sinh viên, công nghệ đã chọn: Python, FastAPI, MySQL 8, HTML/CSS/JavaScript thuần, không dùng framework frontend.
- Chạy trên Windows bằng một tiến trình `uvicorn`.
- Không có ngân sách cho dịch vụ SMS, email hay cổng thanh toán.

## 2. Kiến trúc tổng thể

```
                  Trình duyệt khách (VI / EN)                Trình duyệt lễ tân, quản trị
   ┌───────────────────────────────────────────────┐        ┌──────────────────────────┐
   │ index.html  dich-vu.html  kham-pha.html        │        │ management.html          │
   │ i18n.js (từ điển, đổi ngôn ngữ, dịch lỗi)       │        │ management.js            │
   │ script.js   js/room-3d.js (tải khi cần)         │        │ JWT trong sessionStorage │
   └───────┬───────────────────────┬────────────────┘        └────────────┬─────────────┘
           │ HTTPS, JSON            │ three.js (jsDelivr, khi bấm Xem 3D)  │
           ▼                        ▼                                      ▼
   ┌─────────────────────────────────────────────────────────────────────────────────────┐
   │ FastAPI (app/main.py) — một tiến trình uvicorn                                      │
   │  ├─ /api/*            REST JSON                                                     │
   │  ├─ StaticFiles "/"   frontend/ (HTML, CSS, JS, images/*.svg, models/*.glb)          │
   │  ├─ Bộ nhớ trong tiến trình: giới hạn thử số điện thoại, bộ đệm thời tiết 1 giờ       │
   │  └─ Khởi động: tự tạo bảng và cột còn thiếu (migration 002 đến 005)                  │
   └───────────────┬────────────────────────────────────────────────┬────────────────────┘
                   │ mysql-connector, mỗi request một kết nối        │ HTTPS, tối đa 1 lần/giờ/khu vực
                   ▼                                                  ▼
          ┌──────────────────┐                               ┌──────────────────┐
          │ MySQL 8          │                               │ Open-Meteo       │
          │ hotel_management │                               │ (dự báo thời tiết)│
          └──────────────────┘                               └──────────────────┘
```

**Ranh giới:** một ứng dụng duy nhất phục vụ cả API và trang tĩnh trên cùng nguồn gốc (origin), nên không cần cấu hình CORS và cookie, token dùng chung đường dẫn.

## 3. Luồng dữ liệu chính

### 3.1. Khách đặt phòng

```
Khách          script.js                 FastAPI                          MySQL
 │ chọn ngày ─▶ GET /api/room-availability ─▶ đếm phòng trống theo hạng ─▶ SELECT … NOT EXISTS(bookings chồng ngày)
 │ ◀─ thẻ "Còn N phòng" ◀────────────────────┘
 │ điền tên, SĐT ─▶ POST /api/bookings {room_type_id, …}
 │                              START TRANSACTION
 │                              find_free_room: SELECT phòng của hạng … FOR UPDATE
 │                              kiểm tra chồng ngày … FOR UPDATE
 │                              INSERT customers, INSERT bookings (pending)
 │                              COMMIT
 │ ◀─ mã GV-<32 ký tự hex>, hạng phòng, tiền dự kiến (không có số phòng)
```

Hai khách bấm đặt cùng lúc cho phòng cuối cùng: transaction thứ hai chờ khóa dòng, sau đó không còn phòng trống và nhận lỗi 409 "vừa hết phòng".

### 3.2. Trả phòng và xuất hóa đơn

Trong một transaction: hủy yêu cầu dịch vụ còn `pending`, chuyển `in_progress` thành `completed`, tính hóa đơn (tiền phòng cộng dịch vụ trừ cọc), chuyển cọc sang `applied`, lưu bản hóa đơn dạng JSON vào `invoices`, đổi phòng sang `cleaning`. Hóa đơn đã lưu không tính lại, nên sửa giá dịch vụ sau này không đổi hóa đơn cũ.

### 3.3. Đổi ngôn ngữ

```
?lang=en  ─┐
localStorage gv_lang ─┼─▶ i18n.js chọn ngôn ngữ ─▶ apply(): data-i18n, data-i18n-html, data-i18n-attr
mặc định vi ─┘                                   └─▶ phát sự kiện gv:langchange
                                                        ├─ script.js vẽ lại thẻ phòng, hộp thoại, kết quả tra cứu
                                                        └─ room-3d.js đổi chữ trên thanh góc nhìn
```

Máy chủ luôn trả dữ liệu và thông báo lỗi bằng tiếng Việt. `i18n.js` dịch ở trình duyệt bằng ba bảng: tên và mô tả hạng phòng (khóa là tên tiếng Việt), danh mục dịch vụ (khóa là `id`), và lỗi (khớp theo đoạn đầu câu).

## 4. Mô hình dữ liệu

```
users (nhân viên)                room_types                         rooms
 id PK                             id PK, name UNIQUE                 id PK, room_number UNIQUE
 email UNIQUE, role                base_price, max_guests             room_type_id FK ─▶ room_types
 password_hash (argon2)            area_sqm, bed_type, view_name,     operational_status
                                   layout_summary, amenities,           (available | occupied |
                                   gallery_json, image_url               cleaning | maintenance)

customers                        bookings
 id PK                             id PK, booking_code UNIQUE (GV-…)
 full_name, phone, email NULL      customer_id FK ─▶ customers   user_id FK NULL (đơn cũ)
                                   room_id FK ─▶ rooms           reviewed_by FK ─▶ users
                                   check_in, check_out, guests, total_price, note
                                   status (pending | confirmed | rejected | cancelled | checked_in | checked_out)
                                   INDEX (room_id, check_in, check_out, status)

service_requests                 invoices                         booking_deposits        booking_changes
 booking_id, room_id, category    booking_id UNIQUE                booking_id PK           booking_id, action,
 items_json (giá chốt lúc gọi)    invoice_number UNIQUE            amount, method, status  detail, staff_id
 status (pending | in_progress    room/service/total_amount        (paid | applied |
   | completed | cancelled)       data_json (bản chụp hóa đơn)      refunded | forfeited)
```

**Quyết định đáng chú ý**

- `customers` không gộp theo số điện thoại: mỗi đơn tạo một dòng khách mới. Đơn giản, không phải xử lý trùng tên hay sai số, nhưng không có lịch sử khách quen.
- Giá dịch vụ lưu kèm từng yêu cầu trong `items_json`, nên đổi bảng giá trong `SERVICE_CATALOG` không ảnh hưởng đơn cũ.
- Bốn bảng sau (`service_requests`, `invoices`, `booking_deposits`, `booking_changes`) dùng `INT` và **không có khóa ngoại**, trong khi `bookings.id` là `BIGINT UNSIGNED`. Hiện chạy đúng vì số đơn nhỏ, nhưng database không tự chặn dữ liệu mồ côi (xem mục 8).

## 5. Thiết kế API

REST, JSON, tiếng Việt trong thông báo lỗi; mã lỗi theo ý nghĩa: 400 dữ liệu sai, 401 chưa đăng nhập hoặc hết phiên, 403 không đủ quyền hoặc chưa đến lúc (ví dụ chưa nhận phòng), 404 không có, 409 xung đột trạng thái hoặc hết phòng, 429 thử quá nhiều lần, 503 mất kết nối database.

| Nhóm | Xác thực | Endpoint tiêu biểu |
| --- | --- | --- |
| Công khai | Không | `GET /api/room-types`, `GET /api/room-availability`, `POST /api/bookings`, `POST /api/bookings/lookup-by-phone`, `GET /api/services/catalog`, `GET /api/weather` |
| Khách đang ở | Token khách 24 giờ (`typ: guest`) | `POST /api/guest/service-session` cấp token; `GET/POST /api/guest/service-requests` |
| Nhân viên | JWT 120 phút, vai `receptionist` hoặc `admin` | `/api/bookings/*`, `/api/staff/*`, `/api/service-requests/*` |
| Quản trị | JWT, vai `admin` | `GET /api/dashboard/summary` |

Quy tắc chuyển trạng thái đơn nằm ở máy chủ (`allowed_next`), nên giao diện không thể bỏ bước, ví dụ không thể trả phòng cho đơn chưa nhận khách.

## 6. Bảo mật

| Mối đe dọa | Biện pháp hiện có | Hạn chế |
| --- | --- | --- |
| Đoán mã đặt phòng | Mã 128 bit ngẫu nhiên | Không |
| Dò số điện thoại để xem đơn hoặc gọi dịch vụ | 10 lần thử mỗi 10 phút cho mỗi IP | Ai biết số điện thoại của khách vẫn vào được; giới hạn nằm trong bộ nhớ, mất khi khởi động lại |
| Sửa giá từ trình duyệt | Giá dịch vụ và giá phòng tính ở máy chủ | Không |
| Token khách dùng như token nhân viên | `sub` có tiền tố `guest:` và `typ: guest`; `require_roles` đọc bảng `users` | Không |
| Lộ số phòng trước khi đến | API khách không trả `room_number` khi chưa nhận phòng; `/api/room-types` không trả số lượng phòng | Không |
| Lộ khóa | `.env` nằm trong `.gitignore` | Cần đổi khóa nếu `.env` đã bị chia sẻ |

## 7. Tải và độ tin cậy

**Ước tính** (giả định 10 phòng, 2.000 lượt xem trang mỗi ngày, 20 đơn mỗi ngày, 50 yêu cầu dịch vụ mỗi ngày):

- Khoảng 10.000 request API mỗi ngày, đỉnh vài request mỗi giây. Một tiến trình uvicorn và một MySQL thừa sức.
- Database tăng vài nghìn dòng mỗi năm; không cần phân vùng hay lưu trữ riêng.
- Tài nguyên tĩnh lớn nhất là mô hình 3D (khoảng 150 đến 380 KB mỗi file) và three.js (khoảng 600 KB, từ CDN, chỉ tải khi khách bấm "Xem 3D").

**Điểm lỗi đơn:** máy chủ ứng dụng và MySQL đều chỉ có một bản. Khi MySQL dừng, API trả 503 và trang chủ hiện danh sách phòng mẫu. Khi Open-Meteo lỗi, API trả bản thời tiết cũ (tối đa 24 giờ) kèm cờ `stale`.

**Theo dõi tối thiểu nên có:** `GET /api/health` mỗi phút; nhật ký uvicorn; sao lưu `mysqldump` hằng ngày.

## 8. Đánh đổi

| Quyết định | Được | Mất | Khi nào xem lại |
| --- | --- | --- | --- |
| Khách không có tài khoản, nhận diện bằng số điện thoại | Đặt nhanh, ít bước, hợp khách quốc tế ngại tạo tài khoản | Ai biết số điện thoại là xem được đơn và gọi dịch vụ | Trước khi dùng thật: thêm OTP qua SMS hoặc email |
| Dịch ở trình duyệt, máy chủ chỉ tiếng Việt | Không đổi API hay database; thêm ngôn ngữ chỉ sửa `i18n.js` | Hạng phòng hoặc món mới phải thêm bản dịch bằng tay; lỗi chưa có trong bảng hiện câu chung chung | Khi có ngôn ngữ thứ ba hoặc nhân viên tự sửa nội dung: chuyển bản dịch vào database |
| Một tiến trình, trạng thái trong bộ nhớ | Không cần Redis; dễ chạy trên máy sinh viên | Chạy nhiều tiến trình thì giới hạn thử và bộ đệm thời tiết không chia sẻ | Khi chạy nhiều tiến trình hoặc nhiều máy |
| Mỗi request mở một kết nối MySQL | Mã đơn giản, không rò kết nối | Tốn vài mili giây mỗi request | Khi tải tăng: dùng pool của `mysql-connector` |
| Tự tạo bảng khi khởi động | Máy cũ chạy được ngay sau khi chép mã | Cần quyền `ALTER`; khó biết database đang ở phiên bản nào | Khi có nhiều môi trường: dùng công cụ migration có bảng ghi phiên bản |
| Mô hình 3D dựng sẵn thành file `.glb` | Trình xem nhẹ, không cần dịch vụ ngoài | Đổi mặt bằng phải dựng lại file | Khi đổi bố trí phòng thường xuyên |
| three.js từ CDN | Không tăng dung lượng mã nguồn | Mất mạng hoặc CDN lỗi thì không có 3D (trang báo lỗi rõ ràng) | Khi triển khai nơi mạng hạn chế: chép three.js vào `frontend/js/` |

## 9. Những gì cần xem lại khi hệ thống lớn lên

1. **OTP cho tra cứu và dịch vụ phòng**, hoặc ít nhất yêu cầu thêm mã đặt phòng khi gọi dịch vụ có tính tiền.
2. **Khóa ngoại và kiểu dữ liệu**: đổi `booking_id`, `room_id` trong bốn bảng phụ sang `BIGINT UNSIGNED` và thêm khóa ngoại tới `bookings`, `rooms`.
3. **Tìm theo số điện thoại**: hiện lọc trong Python trên toàn bộ đơn. Khi có hàng chục nghìn đơn, lưu thêm cột số điện thoại đã chuẩn hóa có chỉ mục.
4. **Trạng thái chia sẻ**: chuyển giới hạn thử và bộ đệm thời tiết sang Redis hoặc bảng MySQL khi chạy nhiều tiến trình.
5. **Bản dịch trong database** cho hạng phòng và dịch vụ, để quản trị viên tự sửa mà không cần lập trình viên.
6. **Mã lỗi máy đọc được**: trả kèm `code` (ví dụ `ROOM_SOLD_OUT`) thay vì để trình duyệt khớp câu tiếng Việt.
7. **Thông báo cho lễ tân**: hiện trang quản lý hỏi số yêu cầu mới mỗi 60 giây; khi nhiều yêu cầu, chuyển sang Server-Sent Events.
8. **Gửi xác nhận** qua email hoặc tin nhắn sau khi đặt (dùng hàng đợi để không làm chậm request đặt phòng).
