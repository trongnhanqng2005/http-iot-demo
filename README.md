# HTTP & IoT Auth Lab

> Ứng dụng tương tác trực quan hóa giao thức HTTP/HTTPS, vòng đời Request/Response và quy trình xác thực Token/JWT qua ví dụ đăng nhập máy chủ thật dành cho lập trình viên IoT.

![Screenshot](docs/screenshot.png)

---

## 🎯 Mục Tiêu & Đối Tượng Sử Dụng

- **Mục tiêu:** Giúp người học làm chủ các khái niệm giao thức tầng ứng dụng HTTP/HTTPS, cách đóng gói bản tin (Headers, Payload, Status Code) và cơ chế xác thực Bearer Token trước khi trực tiếp lập trình socket hoặc thư viện HTTP trên vi điều khiển.
- **Đối tượng:**
  - Sinh viên, kỹ sư mới bắt đầu học lập trình IoT (ESP32, ESP8266, STM32, Raspberry Pi, MicroPython).
  - Lập trình viên nhúng muốn hiểu sâu luồng truyền tải dữ liệu mạng và quy trình bắt tay bảo mật TLS.
  - Giảng viên và người hướng dẫn cần một công cụ trực quan để giảng dạy giao thức mạng trong hệ thống nhúng.

---

## 🚀 Danh Sách Tính Năng Chính (Theo Code Thực Tế)

Dự án được xây dựng với các tính năng thực tế, kết nối mạng trực tiếp tới máy chủ thật:

1. **Màn hình Đăng nhập & Cấu hình Máy Chủ Thật:**
   - Hỗ trợ nhập URL Endpoint máy chủ tùy ý hoặc chọn nhanh 4 cấu hình mẫu (Preset):
     - **DummyJSON Auth API**: Trả về Access Token chuẩn JWT thật (hạn 60 phút).
     - **Reqres Auth API**: Trả về Session Token chuỗi truyền thống.
     - **HTTPBin Echo**: Phân tích việc máy chủ tiếp nhận và phản hồi lại chính xác Headers/Body từ thiết bị.
     - **Tùy chỉnh Endpoint riêng**: Kiểm thử trực tiếp với Backend API hoặc WebServer trên thiết bị IoT cục bộ.
   - Nhập thông tin đăng nhập (Username, Password) kèm tính năng ẩn/hiện mật khẩu và nút điền nhanh tài khoản mẫu.
   - Quản lý linh hoạt danh sách HTTP Request Headers (`Content-Type`, `User-Agent`, `X-Device-ID`...).
   - Tùy chỉnh thời gian chờ **Request Timeout** (1s - 15s) và nút **Hủy yêu cầu (Abort Request)** mô phỏng cơ chế ngắt mạng trên vi điều khiển.

2. **Mô Phỏng Trực Quan Vòng Đời HTTP (HTTP Lifecycle Pipeline):**
   - Hoạt họa 5 giai đoạn liên tục theo thời gian thực:
     1. *Thiết bị IoT Client*
     2. *Bắt tay TCP & Mã hóa TLS (HTTPS)*
     3. *Gửi Headers & Body JSON*
     4. *Máy chủ xác thực tiếp nhận & xử lý*
     5. *Trả lời Response, Mã trạng thái & Token*
   - Đo đạc chính xác **Thời gian phản hồi thực tế (Latency tính bằng mili-giây)** và kích thước dữ liệu tải trọng (Payload bytes).

3. **Bảng Soi Kỹ Thuật (Request & Response Inspector):**
   - **Phía Gửi (Request):**
     - Hiển thị Method (`POST`), URL máy chủ đầy đủ.
     - Danh sách đầy đủ các Headers gửi đi.
     - JSON Body kèm tính năng che mờ mật khẩu an toàn khi trình chiếu.
     - **Raw HTTP Wire Format**: Tái hiện chính xác chuỗi byte thô trên socket TCP (`POST /path HTTP/1.1\r\nHost: ...\r\n\r\n{...}`) – kiến thức mấu chốt khi lập trình socket C/C++ trên vi điều khiển.
   - **Phía Nhận (Response):**
     - Huy hiệu Mã trạng thái HTTP phân loại trực quan (200 OK, 401 Unauthorized, 404 Not Found, 500 Error...).
     - Phần giải thích chi tiết ý nghĩa chuẩn HTTP và ý nghĩa trong bối cảnh hệ thống IoT cho từng mã lỗi.
     - Danh sách Response Headers từ máy chủ và Response Body JSON được định dạng đẹp mắt.

4. **Trực Quan Hóa Token & Bộ Giả Lập Gửi Dữ Liệu Cảm Biến (Bearer Auth):**
   - Tự động phát hiện và trích xuất chuỗi Token từ phản hồi của máy chủ.
   - **JWT Inspector**: Tự động bóc tách 3 phần của JWT (*Header*, *Payload Claims* gồm `sub`, `username`, `exp`, *Signature*) kèm đồng hồ đếm hạn sử dụng.
   - **Mô phỏng Gửi Dữ liệu Cảm biến (Telemetry):** Cho phép điều chỉnh giá trị nhiệt độ, độ ẩm và bấm tạo ngay gói tin HTTP Telemetry thực tế có gắn kèm `Authorization: Bearer <token>` mà không cần truyền lại mật khẩu gốc.

5. **Trung Tâm Kiến Thức Giao Thức IoT (Knowledge Hub):**
   - **HTTP vs HTTPS trong IoT**: Phân tích nguy cơ lộ mật khẩu dạng bản rõ (Sniffing) và thách thức về bộ nhớ RAM/bộ đệm TLS Handshake trên chip ESP8266/ESP32.
   - **Ý nghĩa các HTTP Method**: Bảng phân loại GET, POST, PUT, PATCH, DELETE trong hệ thống nhúng (đọc cấu hình, gửi dữ liệu cảm biến, cập nhật OTA).
   - **Vai trò của Headers**: `Content-Type`, `Content-Length`, `Authorization`, và sự khác biệt giữa `Connection: close` và `keep-alive` trên vi điều khiển.
   - **Xử lý Lỗi Mạng & Timeout**: Hướng dẫn cơ chế ngắt kết nối, kỹ thuật thử lại trễ dần (Exponential Backoff), và giải thích vì sao vi điều khiển IoT không bị rào cản CORS của trình duyệt web.

6. **Trình Sinh Mã Nguồn Sẵn Sàng Nạp Vào Vi Điều Khiển (Ready to Flash):**
   - Tự động xuất mã nguồn kết nối trực tiếp đến endpoint đang kiểm thử cho:
     - **ESP32 (Arduino C++ `HTTPClient.h`)**
     - **MicroPython (`urequests`)**
     - **cURL Terminal**
     - **Fetch API (JavaScript / Node.js)**

7. **Chế Độ Giao Diện Sáng / Tối (Light Mode / Dark Mode):**
   - Hỗ trợ chuyển đổi mượt mà giữa Dark Mode và Light Mode đạt chuẩn tương phản WCAG AA.
   - Tự động nhận diện thiết lập của hệ thống (`prefers-color-scheme`) và ghi nhớ lựa chọn qua `localStorage`.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 6](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation:** [Motion](https://motion.dev/)
- **Iconography:** [Lucide React](https://lucide.dev/)
- **Font chữ:** *Plus Jakarta Sans* (tiêu đề & văn bản) và *Fira Code* (mã nguồn & dữ liệu byte)

---

## 💻 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local)

### Yêu Cầu Môi Trường
- [Node.js](https://nodejs.org/) phiên bản 18 trở lên (khuyến nghị phiên bản LTS).
- Trình quản lý gói `npm` (hoặc `yarn`, `pnpm`, `bun`).

### Các Bước Thực Hiện

1. **Clone hoặc tải mã nguồn dự án về máy tính:**
   ```bash
   git clone <repository-url>
   cd http-iot-auth-lab
   ```

2. **Cài đặt các thư viện phụ thuộc (Dependencies):**
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường:**
   Tạo file `.env` từ file mẫu `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Nội dung trong `.env`:*
   - `GEMINI_API_KEY`: Khóa API của Google Gemini (nếu sử dụng tính năng mở rộng AI).
   - `APP_URL`: URL triển khai ứng dụng (mặc định môi trường dev chạy tại `http://localhost:3000`).

4. **Khởi chạy máy chủ phát triển (Development Server):**
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại cổng **3000** với địa chỉ `http://localhost:3000` (được cấu hình bind vào `0.0.0.0:3000`).

5. **Kiểm tra cú pháp (Lint):**
   ```bash
   npm run lint
   ```

6. **Biên dịch mã nguồn cho môi trường Production (Build):**
   ```bash
   npm run build
   ```
   Thư mục đóng gói đầu ra sẽ nằm tại `dist/`.

7. **Xem trước bản dựng sản xuất (Preview):**
   ```bash
   npm run preview
   ```

---

## 📄 Giấy Phép (License)

Chưa xác định (Dự án hiện chưa đính kèm file LICENSE chính thức. Mã nguồn phục vụ mục đích học tập và nghiên cứu giao thức mạng IoT).
