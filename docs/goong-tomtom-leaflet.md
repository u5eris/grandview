# Tích hợp bản đồ và chỉ đường Goong + TomTom + Leaflet

## 1. Kiến trúc

- **Goong Geocoding REST API**: chuyển tên điểm tham quan thành tọa độ địa lý.
- **TomTom Routing API v1**: tính tuyến đường từ vị trí tham chiếu của Grandview đến điểm tham quan; trả về chiều dài, thời gian dự kiến, độ trễ giao thông và danh sách điểm hình học tuyến.
- **Leaflet 1.9.4**: hiển thị tile bản đồ, marker và vẽ tuyến bằng `L.polyline`.
- **OpenStreetMap Standard tiles**: nguồn tile nền đang dùng trong bản demo, có attribution trên bản đồ.

API key chỉ được lưu ở backend trong `.env`; frontend không nhận hoặc chứa key.

## 2. Cấu hình `.env`

Sao chép `.env.example` thành `.env` nếu chưa có. Giữ nguyên các biến cơ sở dữ liệu/JWT hiện tại, sau đó thêm hoặc cập nhật:

```env
GOONG_API_KEY=YOUR_GOONG_REST_API_KEY
TOMTOM_API_KEY=YOUR_TOMTOM_API_KEY

GRANDVIEW_HOTEL_LAT=11.925504
GRANDVIEW_HOTEL_LNG=108.448336
GRANDVIEW_HOTEL_LABEL=Grandview Hotel - khu vực đường 3 Tháng 4, Đà Lạt
```

- `GOONG_API_KEY` phải là REST API key có quyền Geocoding, không phải Map Tiles key.
- `TOMTOM_API_KEY` phải có quyền Routing API.
- Hai tọa độ Grandview hiện là điểm ghim tham chiếu của bất động sản khu vực đường 3 Tháng 4, không phải tọa độ cổng vào đã được xác minh. Thay chúng khi nhóm chốt điểm đón khách chính xác.
- Không commit file `.env`, không đưa key vào HTML/JavaScript và không gửi key lên GitHub.

## 3. Luồng xử lý

1. Khách nhấp trực tiếp vào marker trên bản đồ, tên điểm trong chú giải/danh sách hoặc điểm trong lịch trình.
2. Trang tự gửi tên địa điểm và phương tiện đến `POST /api/tourism/directions`; không cần nút “Tính đường”.
3. Backend bổ sung ngữ cảnh Đà Lạt vào tên địa điểm rồi gọi Goong `/v2/geocode`.
4. Backend lấy `geometry.location` từ kết quả Goong và gọi TomTom `/routing/1/calculateRoute`.
5. Backend chỉ trả dữ liệu cần thiết về frontend: tọa độ tuyến, khoảng cách, thời gian, độ trễ giao thông và các đoạn traffic.
6. Frontend vẽ tuyến và marker bằng Leaflet.

Để tránh tính phí không cần thiết, không gọi Goong cho toàn bộ 17 địa điểm khi tải trang. Chỉ geocode khi khách yêu cầu tính đường. Các marker trước khi tính tuyến dùng tọa độ biên tập sẵn trong dữ liệu điểm tham quan; sau khi tính tuyến, marker đích sử dụng tọa độ Goong trả về.

## 4. API nội bộ

### Lấy vị trí khách sạn

```http
GET /api/tourism/hotel-location
```

### Tính đường đến điểm tham quan

```http
POST /api/tourism/directions
Content-Type: application/json
```

Body ví dụ:

```json
{
  "destination_name": "Hồ Xuân Hương",
  "travel_mode": "car"
}
```

`travel_mode` chấp nhận `car` hoặc `motorcycle`.

Phản hồi chính gồm:
- `distance_km`, `duration_minutes`, `traffic_delay_minutes`
- `points`: mảng tọa độ `[latitude, longitude]` để Leaflet vẽ
- `traffic_sections`: các đoạn giao thông TomTom đánh dấu
- `destination`: tọa độ và địa chỉ Goong đã định vị

## 5. Chạy và kiểm tra

Khởi động FastAPI theo README hiện tại, sau đó thử:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/tourism/hotel-location
```

```powershell
$body = @{
  destination_name = "Hồ Xuân Hương"
  travel_mode = "car"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8000/api/tourism/directions `
  -ContentType "application/json" `
  -Body $body
```

Sau đó mở trang `http://127.0.0.1:8000/kham-pha.html`, nhấp marker Hồ Xuân Hương (hoặc tên điểm trong chú giải/danh sách). Website tự gọi Goong và TomTom, hiển thị thông số rồi vẽ tuyến trên Leaflet. Đổi phương tiện trong bộ chọn phía dưới bản đồ để tính lại tuyến. Giữ `Ctrl` và lăn chuột để zoom; cuộn chuột không giữ Ctrl vẫn cuộn trang bình thường.

## 6. Ghi chú

- Mã nguồn tham khảo `test_bando.html` gọi thẳng API từ trình duyệt và chứa API key trong JavaScript. Bản Grandview không sao chép cách đặt key này; các request Goong/TomTom đều đi qua backend.
- Nếu các key từng xuất hiện trong file HTML đã được gửi/chia sẻ, hãy thu hồi hoặc tạo key mới, đặt giới hạn dịch vụ phù hợp và chỉ dùng key mới ở `.env`.
- Leaflet là thư viện hiển thị bản đồ, không tự tính tuyến. Tuyến được TomTom tính và Leaflet chỉ vẽ kết quả.
- Bản đồ tắt nút zoom +/- và chỉ thực hiện zoom bánh xe khi người dùng giữ `Ctrl`; thao tác cuộn không giữ `Ctrl` được để trình duyệt cuộn trang bình thường.
- Khi nhấp một điểm tham quan, hệ thống tự gọi tuyến. Nếu đang có request cũ, phản hồi đến muộn bị bỏ qua để không ghi đè tuyến vừa chọn.
- OSM Standard tile server là dịch vụ công cộng với chính sách sử dụng riêng, không phải hạ tầng tile có SLA cho lưu lượng production. Bản demo/đồ án nên ghi attribution; khi triển khai công khai với lượng truy cập lớn, chọn nhà cung cấp tile phù hợp hoặc tự host.
- Bản tích hợp hiển thị tuyến, khoảng cách, thời gian và dữ liệu giao thông. Nó chưa triển khai turn-by-turn guidance/đọc chỉ dẫn bằng giọng nói.
