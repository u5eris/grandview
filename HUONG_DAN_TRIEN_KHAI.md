# Hướng dẫn đưa Grandview lên Render

Website chạy trên **Render** (FastAPI), database đặt trên **Aiven** (MySQL), mã nguồn để trên **GitHub**. Cả ba đều có gói miễn phí. Bạn không cần sửa file code nào: mọi thông tin được nhập qua hỏi đáp hoặc trên trang web của các dịch vụ.

Tổng thời gian khoảng 30 đến 45 phút.

---

## Phần A. Chuẩn bị trên máy (làm một lần)

1. Cài **Python 3.10 trở lên** và **Git** (git-scm.com) nếu máy chưa có.
2. Giải nén `grandview-render.zip`, ví dụ vào `D:\grandview`.
3. Chép 14 file ảnh SVG từ dự án cũ vào `frontend/images/`. Danh sách nằm trong `frontend/images/CAN_CHEP_ANH_VAO_DAY.md`. Sau đó xóa file `.md` đó đi (không bắt buộc).
4. Mở PowerShell trong thư mục dự án và cài thư viện:
   ```powershell
   cd D:\grandview
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
   Nếu PowerShell báo lỗi không chạy được script, chạy lệnh `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` một lần rồi thử lại.

## Phần B. Tạo MySQL trên Aiven

1. Vào **console.aiven.io**, đăng ký bằng Google hoặc GitHub.
2. Bấm **Create service**, chọn **MySQL**, chọn gói **Free**, chọn vùng gần Việt Nam nhất trong danh sách có sẵn, đặt tên (ví dụ `grandview-db`), rồi bấm **Create**.
3. Chờ trạng thái chuyển từ *Rebuilding* sang **Running**, khoảng 3 đến 5 phút.
4. Ở trang **Overview** của dịch vụ:
   - Tìm dòng **Service URI**, bấm biểu tượng sao chép. Chuỗi có dạng `mysql://avnadmin:AVNS_...@grandview-db-xxx.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED`. Dán tạm vào Notepad.
   - Tìm dòng **CA certificate**, bấm **Download**. File `ca.pem` sẽ nằm trong thư mục Downloads.

Service URI chứa mật khẩu database. Không đưa nó lên GitHub hay gửi cho người khác.

## Phần C. Tạo database và dữ liệu (chạy từ máy bạn)

Trong PowerShell (đã kích hoạt `.venv` ở Phần A), chạy:

```powershell
python -m app.setup_db
```

Chương trình hỏi lần lượt:

1. **Service URI**: dán chuỗi ở Phần B (chuột phải để dán trong PowerShell), rồi bấm Enter.
2. **File ca.pem**: kéo file `ca.pem` từ Downloads thả vào cửa sổ PowerShell, rồi bấm Enter. Chương trình tự chép nó vào `certs/ca.pem`.
3. **Mật khẩu quản trị** và **mật khẩu lễ tân**: gõ mật khẩu mới, ít nhất 8 ký tự. Khi gõ, màn hình không hiện ký tự, đó là bình thường. Ghi lại hai mật khẩu này.

Khi thấy `=== HOÀN TẤT ===` cùng số bảng và số phòng là xong. File `.env` trên máy không bị thay đổi, nên bạn vẫn chạy local như cũ được.

Chạy lại lệnh này nhiều lần vẫn an toàn. Tài khoản đã tạo thì giữ nguyên mật khẩu cũ.

## Phần D. Đưa mã nguồn lên GitHub

1. Vào **github.com**, bấm **New repository**, đặt tên `grandview`. Chọn **Private** nếu không muốn công khai mã nguồn. **Không** tích *Add a README*. Bấm **Create repository**.
2. Trong PowerShell (thay `<tên-bạn>` bằng tên tài khoản GitHub):
   ```powershell
   git init
   git add .
   git status
   ```
   Kiểm tra trong danh sách: **có** `certs/ca.pem`, **không có** `.env` và `.venv`. File `.gitignore` đã chặn sẵn hai mục này.
   ```powershell
   git commit -m "Grandview hotel"
   git branch -M main
   git remote add origin https://github.com/<tên-bạn>/grandview.git
   git push -u origin main
   ```
   Lần đầu push, Git sẽ mở trình duyệt để bạn đăng nhập GitHub.

## Phần E. Tạo website trên Render

1. Vào **dashboard.render.com**, đăng ký bằng tài khoản GitHub.
2. Bấm **New +**, chọn **Blueprint**. Kết nối GitHub nếu được hỏi, rồi chọn repo `grandview`.
3. Render đọc file `render.yaml` và chỉ hỏi một giá trị: **DATABASE_URL**. Dán Service URI ở Phần B.
4. Bấm **Apply**. Render cài thư viện và khởi động, khoảng 3 đến 5 phút. Theo dõi ở tab **Logs**. Thấy dòng `Application startup complete` là xong.
5. Địa chỉ website nằm ở đầu trang dịch vụ, dạng `https://grandview-hotel.onrender.com`. Nếu tên này đã có người dùng, Render sẽ thêm vài ký tự; website vẫn chạy đúng vì đường dẫn trong trang, `robots.txt` và `sitemap.xml` được máy chủ tự điền theo địa chỉ thật.

**Nếu không dùng được Blueprint**, tạo thủ công: **New + → Web Service**, chọn repo, rồi điền:

| Mục | Giá trị |
| --- | --- |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT --proxy-headers --forwarded-allow-ips="*"` |
| Instance Type | Free |

Và trong **Environment Variables**:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | Service URI ở Phần B |
| `DB_NAME` | `hotel_management` |
| `JWT_SECRET_KEY` | bấm **Generate** |
| `JWT_EXPIRE_MINUTES` | `120` |
| `TZ` | `Asia/Ho_Chi_Minh` |
| `DB_TIME_ZONE` | `+07:00` |
| `PYTHON_VERSION` | `3.12.7` |

## Phần F. Kiểm tra

Thay `<địa-chỉ>` bằng địa chỉ Render của bạn:

1. `https://<địa-chỉ>/api/health` phải trả về `"database": "connected"`.
2. Trang chủ hiện các hạng phòng, ảnh và nút xem 3D.
3. Đặt thử một phòng, rồi tra cứu lại bằng số điện thoại.
4. Vào `https://<địa-chỉ>/management.html`, đăng nhập `admin@grandview.com` với mật khẩu đã đặt ở Phần C. Thấy đơn vừa đặt trong danh sách chờ.

## Phần G. Cập nhật website về sau

Sửa code trên máy, rồi:

```powershell
git add .
git commit -m "Mô tả thay đổi"
git push
```

Render tự nhận và deploy lại trong vài phút. Database trên Aiven giữ nguyên.

---

## Lỗi thường gặp

| Hiện tượng | Nguyên nhân và cách xử lý |
| --- | --- |
| `setup_db` báo không kết nối được | Dịch vụ Aiven chưa *Running*, hoặc Service URI dán thiếu. Sao chép lại bằng nút sao chép, không bôi đen tay. |
| `setup_db` báo lỗi chứng chỉ | File `ca.pem` không phải của dịch vụ này. Xóa `certs/ca.pem`, tải lại từ Aiven, chạy lại lệnh. |
| `/api/health` trả về 503 | Sai `DATABASE_URL` trên Render, hoặc chưa push `certs/ca.pem`. Kiểm tra ở Render → Environment, sửa rồi bấm **Manual Deploy**. |
| Logs có dòng `[CẢNH BÁO] Chưa tạo được bảng...` | Cùng nguyên nhân với dòng trên. |
| Trang chủ không có ảnh phòng | Chưa chép ảnh vào `frontend/images/` (Phần A bước 3). Chép vào rồi làm Phần G. |
| Đăng nhập báo sai mật khẩu | Tài khoản được tạo ở lần chạy `setup_db` đầu tiên; các lần sau không đổi mật khẩu. Dùng mật khẩu của lần đầu. |
| Trang tải rất lâu ở lần mở đầu | Gói Free của Render tắt máy chủ sau 15 phút không có ai truy cập. Lần mở sau chờ khoảng 30 đến 60 giây là bình thường. |
| Aiven báo dịch vụ bị tạm dừng | Gói Free tạm dừng khi lâu không dùng. Vào console Aiven bấm bật lại. |

## Lưu ý

- Trước buổi trình diễn, mở website vài phút trước để máy chủ kịp khởi động.
- Giới hạn "10 lần tra cứu mỗi 10 phút" tính theo IP từng khách và reset mỗi khi máy chủ khởi động lại.
- Trạng thái phòng tính theo giờ Việt Nam nhờ hai biến `TZ` và `DB_TIME_ZONE`. Đừng xóa chúng.
- Muốn dùng tên miền riêng: thêm tên miền ở Render → Settings → Custom Domains. Không cần sửa code.
