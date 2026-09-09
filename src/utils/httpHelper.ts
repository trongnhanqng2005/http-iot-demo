import { AuthTokenInfo, HeaderPair, HttpMethod } from '../types';

/**
 * Format headers into a standard Record<string, string>
 */
export function headersArrayToRecord(headers: HeaderPair[]): Record<string, string> {
  const record: Record<string, string> = {};
  for (const h of headers) {
    if (h.enabled && h.key.trim()) {
      record[h.key.trim()] = h.value.trim();
    }
  }
  return record;
}

/**
 * Generate raw HTTP wire format representation as seen on raw TCP sockets (C/ESP32)
 */
export function generateRawHttpWire(
  method: HttpMethod,
  urlStr: string,
  headers: Record<string, string>,
  body: string
): string {
  try {
    const parsedUrl = new URL(urlStr);
    const pathAndQuery = (parsedUrl.pathname || '/') + (parsedUrl.search || '');
    const host = parsedUrl.host;

    const lines: string[] = [];
    lines.push(`${method} ${pathAndQuery} HTTP/1.1`);
    lines.push(`Host: ${host}`);

    let hasContentType = false;
    let hasContentLength = false;

    for (const [k, v] of Object.entries(headers)) {
      if (k.toLowerCase() === 'host') continue;
      if (k.toLowerCase() === 'content-type') hasContentType = true;
      if (k.toLowerCase() === 'content-length') hasContentLength = true;
      lines.push(`${k}: ${v}`);
    }

    if (!hasContentType && body) {
      lines.push(`Content-Type: application/json`);
    }

    if (body) {
      const byteLength = new TextEncoder().encode(body).length;
      if (!hasContentLength) {
        lines.push(`Content-Length: ${byteLength}`);
      }
    }

    // Typical for IoT to specify Connection: close
    if (!Object.keys(headers).some(k => k.toLowerCase() === 'connection')) {
      lines.push(`Connection: close`);
    }

    return lines.join('\r\n') + '\r\n\r\n' + (body || '');
  } catch {
    return `${method} ${urlStr} HTTP/1.1\r\n\r\n${body || ''}`;
  }
}

/**
 * Mask password values in JSON string for secure visual presentation
 */
export function maskJsonPasswords(jsonString: string): string {
  try {
    const obj = JSON.parse(jsonString);
    const maskRecursively = (target: any): any => {
      if (typeof target !== 'object' || target === null) return target;
      if (Array.isArray(target)) return target.map(maskRecursively);
      const copy = { ...target };
      for (const k of Object.keys(copy)) {
        if (
          k.toLowerCase().includes('pass') ||
          k.toLowerCase().includes('secret') ||
          k.toLowerCase().includes('key')
        ) {
          if (typeof copy[k] === 'string' && copy[k].length > 0) {
            copy[k] = '••••••••';
          }
        } else if (typeof copy[k] === 'object') {
          copy[k] = maskRecursively(copy[k]);
        }
      }
      return copy;
    };
    return JSON.stringify(maskRecursively(obj), null, 2);
  } catch {
    return jsonString.replace(/"(password|pass|secret)":\s*"([^"]+)"/gi, '"$1": "••••••••"');
  }
}

/**
 * Safely parse base64url string (used in JWT)
 */
function base64UrlDecode(str: string): string {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return '';
  }
}

/**
 * Extract token and inspect if it's a JWT
 */
export function inspectToken(data: any): AuthTokenInfo | null {
  if (!data || typeof data !== 'object') return null;

  // Common token keys
  const tokenKeys = [
    'accessToken',
    'access_token',
    'token',
    'jwt',
    'id_token',
    'idToken',
    'authToken',
    'sessionToken',
    'key',
  ];

  let foundKey = '';
  let tokenValue = '';

  for (const k of tokenKeys) {
    if (typeof data[k] === 'string' && data[k].length > 10) {
      foundKey = k;
      tokenValue = data[k];
      break;
    }
  }

  // Nested in data.token, etc.
  if (!tokenValue && data.data && typeof data.data === 'object') {
    for (const k of tokenKeys) {
      if (typeof data.data[k] === 'string' && data.data[k].length > 10) {
        foundKey = `data.${k}`;
        tokenValue = data.data[k];
        break;
      }
    }
  }

  if (!tokenValue) return null;

  // Check if JWT: 3 parts separated by dots
  const parts = tokenValue.split('.');
  if (parts.length === 3) {
    try {
      const headerJson = JSON.parse(base64UrlDecode(parts[0]));
      const payloadJson = JSON.parse(base64UrlDecode(parts[1]));

      let isExpired = false;
      let expiresAtFormatted = '';
      if (payloadJson.exp && typeof payloadJson.exp === 'number') {
        const expDate = new Date(payloadJson.exp * 1000);
        isExpired = expDate.getTime() < Date.now();
        expiresAtFormatted = expDate.toLocaleString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
          hour12: false,
        });
      }

      return {
        token: tokenValue,
        tokenType: 'JWT',
        extractedFromKey: foundKey,
        decodedJwt: {
          header: headerJson,
          payload: payloadJson,
          signature: parts[2],
          isExpired,
          expiresAtFormatted,
        },
      };
    } catch {
      // Not valid JWT JSON, treat as session token
    }
  }

  return {
    token: tokenValue,
    tokenType: 'SESSION',
    extractedFromKey: foundKey,
  };
}

/**
 * Generate code snippets for Arduino ESP32, ESP-IDF, MicroPython, and cURL
 */
export function generateCodeSnippets(
  method: HttpMethod,
  urlStr: string,
  headers: Record<string, string>,
  body: string
) {
  const curlHeaders = Object.entries(headers)
    .map(([k, v]) => `  -H "${k}: ${v}" \\`)
    .join('\n');

  const curl = `curl -X ${method} "${urlStr}" \\\n${curlHeaders}\n  -d '${body.replace(/'/g, "'\\''")}'`;

  const esp32Arduino = `#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "${urlStr}";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected!");

  // Thực hiện HTTP Request
  sendLoginRequest();
}

void sendLoginRequest() {
  HTTPClient http;
  http.setTimeout(5000); // 5s timeout quan trọng cho IoT
  http.begin(serverUrl);
  
  // Headers
${Object.entries(headers)
  .map(([k, v]) => `  http.addHeader("${k}", "${v}");`)
  .join('\n')}

  // Payload Body
  String requestBody = ${JSON.stringify(body)};

  Serial.println("[HTTP] Đang gửi POST request...");
  int httpResponseCode = http.POST(requestBody);

  if (httpResponseCode > 0) {
    Serial.printf("[HTTP] Status code: %d\\n", httpResponseCode);
    String response = http.getString();
    Serial.println("[HTTP] Phản hồi từ Server:");
    Serial.println(response);

    // Trích xuất Token (sử dụng thư viện ArduinoJson nếu cần)
  } else {
    Serial.printf("[HTTP] Lỗi kết nối: %s\\n", http.errorToString(httpResponseCode).c_str());
  }
  http.end(); // Giải phóng socket và RAM
}

void loop() {
  // Lặp lại hoặc vào chế độ Deep Sleep để tiết kiệm pin
}
`;

  const microPython = `import urequests
import ujson
import time

url = "${urlStr}"
headers = ${JSON.stringify(headers, null, 2)}
payload = ${JSON.stringify(body)}

try:
    print("Đang gửi HTTP ${method} tới:", url)
    response = urequests.request(
        "${method}",
        url,
        headers=headers,
        data=payload,
        timeout=5 # Timeout tránh treo vi điều khiển
    )
    
    print("Status Code:", response.status_code)
    data = response.json()
    print("Response JSON:", data)
    
    # Lấy token lưu vào RAM
    # token = data.get("accessToken") or data.get("token")
    
    response.close() # Đóng kết nối giải phóng socket
except Exception as e:
    print("Lỗi kết nối mạng hoặc timeout:", e)
`;

  const fetchJs = `// Gọi bằng Fetch API trong JavaScript / Node.js
async function sendRequest() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const response = await fetch("${urlStr}", {
      method: "${method}",
      headers: ${JSON.stringify(headers, null, 2)},
      body: ${JSON.stringify(body)},
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log("Status Code:", response.status, response.statusText);

    const data = await response.json();
    console.log("Response Body:", data);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error("Yêu cầu bị Timeout sau 5 giây!");
    } else {
      console.error("Lỗi mạng:", error.message);
    }
  }
}
`;

  return {
    curl,
    esp32Arduino,
    microPython,
    fetchJs,
  };
}
