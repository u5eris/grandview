# Chứng chỉ CA của MySQL trên cloud

Tải chứng chỉ CA từ trang dịch vụ MySQL trên Aiven (nút **CA certificate → Download**)
và lưu vào thư mục này với tên `ca.pem`.

Đây là chứng chỉ công khai, đưa lên GitHub được. Render đọc nó qua biến `DB_SSL_CA=certs/ca.pem`.
Không đặt mật khẩu hay file `.env` vào thư mục này.
