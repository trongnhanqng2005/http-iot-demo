export interface StatusExplanation {
  code: number;
  text: string;
  category: 'success' | 'redirect' | 'client_error' | 'server_error' | 'informational';
  meaning: string;
  iotContext: string;
}

export const STATUS_CODES_MAP: Record<number, StatusExplanation> = {
  200: {
    code: 200,
    text: 'OK',
    category: 'success',
    meaning: 'Yêu cầu thành công. Máy chủ đã xử lý và trả về dữ liệu kết quả.',
    iotContext: 'Đăng nhập thành công, thiết bị IoT nhận token và lưu vào RAM/Flash để gửi telemetry tiếp theo.',
  },
  201: {
    code: 201,
    text: 'Created',
    category: 'success',
    meaning: 'Tài nguyên mới đã được tạo thành công trên máy chủ.',
    iotContext: 'Thường gặp khi thiết bị đăng ký mới (Register device) hoặc gửi bản ghi cảm biến mới lên database.',
  },
  204: {
    code: 204,
    text: 'No Content',
    category: 'success',
    meaning: 'Yêu cầu thành công nhưng máy chủ không trả về nội dung trong body.',
    iotContext: 'Rất tiết kiệm băng thông cho IoT khi chỉ cần biết server đã nhận lệnh (Heartbeat / Ping).',
  },
  301: {
    code: 301,
    text: 'Moved Permanently',
    category: 'redirect',
    meaning: 'Tài nguyên đã được chuyển vĩnh viễn sang URL mới trong header "Location".',
    iotContext: 'Thiết bị IoT cần cấu hình theo dõi chuyển hướng (follow redirect) để không bị mất kết nối.',
  },
  400: {
    code: 400,
    text: 'Bad Request',
    category: 'client_error',
    meaning: 'Máy chủ không hiểu được yêu cầu (cú pháp JSON sai, thiếu trường dữ liệu bắt buộc).',
    iotContext: 'Kiểm tra xem chuỗi JSON tạo bằng Arduino/C có bị thiếu dấu ngoặc nhọn hoặc lỗi escape string không.',
  },
  401: {
    code: 401,
    text: 'Unauthorized',
    category: 'client_error',
    meaning: 'Xác thực thất bại: Sai tên đăng nhập/mật khẩu, hoặc Token hết hạn/không hợp lệ.',
    iotContext: 'Thiết bị IoT cần thực hiện lại quy trình đăng nhập để lấy token mới (hoặc dùng Refresh Token).',
  },
  403: {
    code: 403,
    text: 'Forbidden',
    category: 'client_error',
    meaning: 'Máy chủ hiểu bạn là ai, nhưng tài khoản/thiết bị này không có quyền truy cập tài nguyên.',
    iotContext: 'Ví dụ: Thiết bị cảm biến gửi lệnh xóa dữ liệu admin hoặc truy cập topic không được cấp phép.',
  },
  404: {
    code: 404,
    text: 'Not Found',
    category: 'client_error',
    meaning: 'URL endpoint không tồn tại trên máy chủ.',
    iotContext: 'Sai đường dẫn API (ví dụ gõ nhầm /api/v1/logi thay vì /api/v1/login). Cần kiểm tra lại cấu hình URL.',
  },
  408: {
    code: 408,
    text: 'Request Timeout',
    category: 'client_error',
    meaning: 'Máy chủ đã đợi quá lâu mà không nhận được toàn bộ request từ máy khách.',
    iotContext: 'Mạng GSM/2G/4G của thiết bị IoT chập chờn, dữ liệu truyền đi quá chậm khiến server ngắt kết nối.',
  },
  429: {
    code: 429,
    text: 'Too Many Requests',
    category: 'client_error',
    meaning: 'Gửi quá nhiều yêu cầu trong một khoảng thời gian (Rate Limiting).',
    iotContext: 'Cần tăng chu kỳ gửi dữ liệu (ví dụ từ 500ms lên 5000ms) để không bị máy chủ chặn IP.',
  },
  500: {
    code: 500,
    text: 'Internal Server Error',
    category: 'server_error',
    meaning: 'Máy chủ gặp sự cố ngoài ý muốn khi xử lý (crash code, lỗi cơ sở dữ liệu backend).',
    iotContext: 'Lỗi từ phía backend server. Thiết bị nên thử lại sau một khoảng thời gian (Exponential Backoff).',
  },
  502: {
    code: 502,
    text: 'Bad Gateway',
    category: 'server_error',
    meaning: 'Máy chủ Proxy/Nginx nhận phản hồi không hợp lệ từ máy chủ ứng dụng phía sau.',
    iotContext: 'Backend API service có thể đang khởi động lại hoặc bị quá tải.',
  },
  503: {
    code: 503,
    text: 'Service Unavailable',
    category: 'server_error',
    meaning: 'Máy chủ hiện đang bảo trì hoặc quá tải tạm thời.',
    iotContext: 'Thiết bị nên chờ vài chục giây rồi thực hiện gửi lại (Retry mechanism).',
  },
  504: {
    code: 504,
    text: 'Gateway Timeout',
    category: 'server_error',
    meaning: 'Máy chủ Gateway/Reverse Proxy hết thời gian chờ đợi máy chủ backend xử lý.',
    iotContext: 'Server backend phản hồi quá chậm. Xem xét giảm kích thước payload hoặc kiểm tra tải server.',
  },
};

export const HTTP_KNOWLEDGE_TOPICS = [
  {
    id: 'http-vs-https',
    title: 'HTTP vs HTTPS trong Thế giới IoT',
    badge: 'Bảo mật & Hiệu năng',
    summary: 'Sự khác biệt cốt lõi giữa giao thức truyền thông bản rõ và mã hóa TLS.',
    content: `
### 1. HTTP (HyperText Transfer Protocol)
- **Cơ chế:** Gửi dữ liệu ở dạng văn bản thuần (plaintext) qua cổng mặc định **80**.
- **Nguy cơ:** Bất kỳ ai trên đường truyền (Router Wi-Fi công cộng, nhà mạng, tin tặc dùng Wireshark) đều đọc được tên đăng nhập, mật khẩu, và dữ liệu cảm biến (Man-in-the-Middle Attack).
- **Ưu điểm cho IoT giá rẻ:** Cực kỳ nhẹ, chiếm rất ít RAM và không đòi hỏi xử lý toán học mã hóa phức tạp. Thích hợp cho vi điều khiển 8-bit hoặc mạng cục bộ (Local LAN) khép kín.

### 2. HTTPS (HTTP Secure = HTTP + TLS/SSL)
- **Cơ chế:** Toàn bộ bản tin HTTP được mã hóa bằng lớp TLS (Transport Layer Security) qua cổng mặc định **443**.
- **An toàn tuyệt đối:** Dữ liệu được mã hóa hai đầu (End-to-End Encryption). Ngay cả khi bị bắt gói tin, kẻ tấn công chỉ thấy chuỗi byte ngẫu nhiên.
- **Thách thức đối với Vi điều khiển IoT (ESP8266, ESP32, STM32):**
  - **RAM tiêu tốn:** Bắt tay TLS (TLS Handshake) cần bộ đệm giải mã từ **16KB đến 40KB RAM**. Vi điều khiển RAM nhỏ (như ESP8266 chỉ có ~40KB heap trống) có thể bị tràn bộ nhớ nếu không cấu hình TLS buffer nhỏ lại.
  - **Chứng chỉ gốc (Root CA Certificate):** Thiết bị IoT cần lưu trữ chứng chỉ CA của Server để xác minh Server thật, tránh bị giả mạo. Cần đồng bộ thời gian thực (qua NTP) để kiểm tra chứng chỉ còn hạn hay không.
  - **Độ trễ (Latency):** TLS Handshake tốn thêm 2-3 lượt gửi nhận (Round-Trip Time) trước khi gửi được dữ liệu thực sự.
    `,
  },
  {
    id: 'http-methods',
    title: 'Ý nghĩa các HTTP Method trong Thiết bị IoT',
    badge: 'Phương thức',
    summary: 'Khi nào thiết bị nên dùng GET, POST, PUT, DELETE?',
    content: `
Mỗi HTTP Method đại diện cho một hành vi (Action) mà máy khách muốn thực hiện trên máy chủ:

| Method | Ý nghĩa HTTP | Ứng dụng thực tế trong IoT | Có Body? | Idempotent? |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | Đọc dữ liệu từ Server | Đọc cấu hình thiết bị, kiểm tra bản cập nhật Firmware (OTA), lấy thời gian server. | Không | Có (Đọc nhiều lần không đổi trạng thái) |
| **POST** | Gửi dữ liệu mới hoặc thực thi hành động | **Đăng nhập (Login)**, gửi gói tin đo đạc cảm biến (Telemetry: nhiệt độ, độ ẩm, GPS), gửi cảnh báo khẩn cấp (Alert). | Có (JSON/Binary) | Không (Gửi 2 lần tạo 2 bản ghi) |
| **PUT** | Cập nhật toàn bộ tài nguyên | Cập nhật toàn bộ thông số cài đặt của cảm biến (ngưỡng nhiệt, chu kỳ đo, tên thiết bị). | Có | Có (Gửi lại dữ liệu tương tự cho cùng kết quả) |
| **PATCH** | Cập nhật một phần tài nguyên | Chỉ cập nhật trạng thái Relay (ON/OFF) mà không cần gửi lại toàn bộ cấu hình. | Có | Không |
| **DELETE** | Xóa tài nguyên | Xóa nhật ký sự kiện cũ trên server, hủy kích hoạt thiết bị khỏi tài khoản. | Thường không | Có |
    `,
  },
  {
    id: 'http-headers',
    title: 'Vai trò của HTTP Headers trong Request & Response',
    badge: 'Đầu mục Header',
    summary: 'Headers là thông tin metadata điều khiển cách máy khách và máy chủ giao tiếp.',
    content: `
HTTP Header được gửi dưới dạng các cặp \`Key: Value\` phân cách bằng dấu xuống dòng \`\\r\\n\`.

### Các Header Request cốt lõi cho IoT:
- **\`Content-Type: application/json\`**: Báo cho server biết body gửi kèm là chuỗi JSON. Nếu thiếu, server có thể không parse được body và trả về lỗi 400 hoặc 415 (Unsupported Media Type).
- **\`Content-Length: <số bytes>\`**: Rất quan trọng khi lập trình Socket C/C++ trên vi điều khiển. Server dựa vào độ dài này để biết cần đọc bao nhiêu byte thì hết request trước khi đóng kết nối.
- **\`Authorization: Bearer <token>\`**: Chứa token xác thực nhận được sau khi đăng nhập. Thiết bị IoT bắt buộc phải đính kèm header này trong mọi request gửi cảm biến sau đó.
- **\`Connection: close\` vs \`keep-alive\`**:
  - \`keep-alive\`: Giữ socket mở để gửi tiếp các request sau mà không cần bắt tay TCP lại.
  - \`close\`: Đóng kết nối ngay khi nhận xong phản hồi. Vi điều khiển RAM hạn chế thường ưu tiên \`close\` để giải phóng socket và RAM ngay lập tức.
- **\`User-Agent\`**: Định danh phần mềm của thiết bị (ví dụ: \`ESP32-SensorClient/2.1\`).

### Các Header Response quan trọng từ Server:
- **\`Set-Cookie\`**: Yêu cầu client lưu cookie phiên (thường dùng trên trình duyệt web, ít dùng trên vi điều khiển do phức tạp).
- **\`Content-Type\`**: Định dạng server trả về (thường là \`application/json; charset=utf-8\`).
- **\`Date\`**: Thời gian chuẩn UTC của server (thiết bị IoT có thể dùng để đồng bộ đồng hồ nếu chưa có NTP!).
    `,
  },
  {
    id: 'network-errors-timeouts',
    title: 'Xử lý Lỗi Mạng & Timeout trên Thiết bị IoT',
    badge: 'Chống lỗi & Khả năng chịu lỗi',
    summary: 'Kỹ thuật giữ kết nối bền vững khi tín hiệu Wi-Fi, 4G, NB-IoT chập chờn.',
    content: `
Môi trường IoT thực tế (đồng ruộng, nhà máy, ngoài trời) thường xuyên bị mất kết nối mạng. Nếu không xử lý đúng, vi điều khiển có thể bị treo (hang/freeze) dẫn đến Watchdog Timer khởi động lại thiết bị liên tục.

### 1. Luôn đặt Timeout cho kết nối (Socket & Request Timeout)
- Không bao giờ để HTTP Client chờ đợi vô tận.
- Vi điều khiển (ESP32/Arduino) luôn phải đặt \`http.setTimeout(5000);\` (5 giây).
- Trong JavaScript/React: Sử dụng \`AbortController\` kết hợp \`setTimeout\` để tự động ngắt kết nối nếu server không phản hồi kịp thời.

### 2. Chiến lược Thử lại với độ trễ tăng dần (Exponential Backoff & Jitter)
- Khi request thất bại, **không thử lại ngay lập tức** (vì sẽ làm nghẽn thêm đường truyền hoặc gây quá tải cho server khi vừa phục hồi).
- Công thức thử lại:
  - Lần 1: Chờ 2 giây
  - Lần 2: Chờ 4 giây
  - Lần 3: Chờ 8 giây + ngẫu nhiên (Jitter) ± 1 giây.

### 3. Bộ nhớ đệm cục bộ (Offline Local Queue / Flash Buffer)
- Nếu gửi dữ liệu cảm biến thất bại do mất mạng:
  - Lưu bản tin vào thẻ nhớ microSD, SPIFFS/LittleFS trên Flash của ESP32.
  - Khi có mạng trở lại, gửi dữ liệu đệm lên server theo thứ tự thời gian.

### 4. Lưu ý về CORS (Cross-Origin Resource Sharing)
- **Trên Trình duyệt Web:** Trình duyệt áp dụng chính sách bảo mật CORS, nếu server không có header \`Access-Control-Allow-Origin\`, trình duyệt sẽ chặn phản hồi.
- **Trên Vi điều khiển IoT:** Không có trình duyệt! Vi điều khiển giao tiếp trực tiếp qua TCP Socket nên **hoàn toàn KHÔNG bị hạn chế bởi CORS**.
    `,
  },
];
