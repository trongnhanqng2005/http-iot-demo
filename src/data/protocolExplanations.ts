export interface ProtocolItemExplanation {
  title: string;
  role: string;
  iotContext: string;
  securityNote?: string;
}

export const PROTOCOL_TOOLTIPS: Record<string, ProtocolItemExplanation> = {
  POST: {
    title: 'Phương thức HTTP POST',
    role: 'Gửi dữ liệu lên máy chủ để xử lý (ví dụ thông tin đăng nhập, đo đạc cảm biến mới).',
    iotContext: 'POST đặt dữ liệu vào phần Body thay vì URL, giúp bảo mật mật khẩu thiết bị và hỗ trợ gửi payload JSON kích thước lớn.',
    securityNote: 'Luôn kết hợp với HTTPS để nội dung Body không bị kẻ xấu đọc lén trên Wi-Fi.',
  },
  GET: {
    title: 'Phương thức HTTP GET',
    role: 'Truy vấn/Đọc dữ liệu từ máy chủ mà không làm thay đổi trạng thái hệ thống.',
    iotContext: 'ESP32 dùng GET để kiểm tra cập nhật firmware OTA (Over-The-Air) hoặc đọc trạng thái công tắc từ Cloud.',
  },
  PUT: {
    title: 'Phương thức HTTP PUT',
    role: 'Cập nhật hoặc thay thế toàn bộ trạng thái tài nguyên đã có trên máy chủ.',
    iotContext: 'Dùng để đồng bộ toàn bộ cấu hình thiết bị (Device Shadow / Digital Twin) lên máy chủ AWS IoT / ThingsBoard.',
  },
  'Content-Type': {
    title: 'Header: Content-Type',
    role: 'Thông báo cho server biết định dạng dữ liệu trong phần Request Body.',
    iotContext: 'Thường là "application/json". Nếu quên header này, server sẽ không parse được JSON và trả về lỗi 400 Bad Request.',
  },
  Authorization: {
    title: 'Header: Authorization',
    role: 'Mang thông tin chứng thực danh tính (thường là "Bearer <token>").',
    iotContext: 'Sau khi đăng nhập xong, thiết bị IoT không gửi lại user/pass mà chỉ gửi header này để truy cập các API được bảo vệ.',
    securityNote: 'Token đóng vai trò như chìa khóa tạm thời. Giữ kín trong bộ nhớ RAM của vi điều khiển.',
  },
  'X-Device-Id': {
    title: 'Header: X-Device-Id (Custom Header)',
    role: 'Header tùy chỉnh giúp định danh phần cứng cụ thể (MAC address hoặc Serial Number).',
    iotContext: 'Giúp hệ thống phân tán nhận diện chính xác cảm biến nào trong mạng lưới hàng nghìn node đang gửi dữ liệu.',
  },
  JWT: {
    title: 'JSON Web Token (JWT)',
    role: 'Chuẩn xác thực không trạng thái (stateless), gồm 3 phần: Header, Payload, Signature.',
    iotContext: 'Server không cần lưu session vào database, chỉ cần giải mã và xác thực chữ ký (Signature) để biết thiết bị hợp lệ.',
    securityNote: 'Payload chỉ được mã hóa Base64Url chứ không mã hóa bí mật, không lưu mật khẩu trong Payload.',
  },
  TLS: {
    title: 'Mã hóa TLS/HTTPS',
    role: 'Bảo mật kênh truyền giữa vi điều khiển IoT và Cloud Server.',
    iotContext: 'ESP32 sử dụng thư viện WiFiClientSecure và Certificate X.509 để xác minh danh tính máy chủ và mã hóa đối xứng.',
  },
};
