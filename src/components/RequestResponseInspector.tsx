import React from 'react';
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Code2,
  FileText,
  AlertCircle,
  Layers,
  Terminal,
} from 'lucide-react';
import { RequestLog, ResponseLog } from '../types';
import { STATUS_CODES_MAP } from '../data/httpKnowledge';

interface RequestResponseInspectorProps {
  request: RequestLog | null;
  response: ResponseLog | null;
  isLoading: boolean;
}

export const RequestResponseInspector: React.FC<RequestResponseInspectorProps> = ({
  request,
  response,
  isLoading,
}) => {
  const [requestTab, setRequestTab] = React.useState<'formatted' | 'raw' | 'headers' | 'curl'>('formatted');
  const [responseTab, setResponseTab] = React.useState<'body' | 'headers' | 'raw'>('body');
  const [maskPassword, setMaskPassword] = React.useState<boolean>(true);
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const statusExplanation = response && response.status > 0 ? STATUS_CODES_MAP[response.status] : null;

  // Generate cURL command from RequestLog
  const generateCurl = (req: RequestLog): string => {
    let curl = `curl -X ${req.method} "${req.url}" \\\n`;
    for (const [k, v] of Object.entries(req.headers)) {
      curl += `  -H "${k}: ${v}" \\\n`;
    }
    if (req.method !== 'GET' && req.body) {
      curl += `  -d '${req.body.replace(/'/g, `'\\''`)}'`;
    }
    return curl.trim();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* ================= LEFT COLUMN: REQUEST INSPECTOR ================= */}
      <div className="bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs flex flex-col transition-colors duration-200">
        {/* Header bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              1. HTTP Request (Gói Tin Gửi Đi)
            </h3>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <button
              id="tab-req-formatted"
              type="button"
              onClick={() => setRequestTab('formatted')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                requestTab === 'formatted'
                  ? 'bg-white dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-slate-200 dark:border-cyan-800/60 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Body JSON
            </button>
            <button
              id="tab-req-headers"
              type="button"
              onClick={() => setRequestTab('headers')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                requestTab === 'headers'
                  ? 'bg-white dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-slate-200 dark:border-cyan-800/60 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Headers
            </button>
            <button
              id="tab-req-raw"
              type="button"
              onClick={() => setRequestTab('raw')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                requestTab === 'raw'
                  ? 'bg-white dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-slate-200 dark:border-cyan-800/60 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Định dạng thô byte gửi qua Socket TCP"
            >
              Raw Wire
            </button>
            <button
              id="tab-req-curl"
              type="button"
              onClick={() => setRequestTab('curl')}
              className={`px-2 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1 ${
                requestTab === 'curl'
                  ? 'bg-white dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-slate-200 dark:border-cyan-800/60 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Lệnh cURL terminal tương đương"
            >
              <Terminal className="w-3 h-3" />
              <span>cURL</span>
            </button>
          </div>
        </div>

        {/* Request Content */}
        <div className="p-4 flex-1 flex flex-col">
          {request ? (
            <div className="space-y-3 flex-1 flex flex-col">
              {/* Method & URL Banner */}
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2 overflow-x-auto min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-500/30 shrink-0">
                    {request.method}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 truncate font-semibold">{request.url}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`${request.method} ${request.url}`, 'req-url')}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 shrink-0 cursor-pointer"
                  title="Sao chép URL"
                >
                  {copiedSection === 'req-url' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Tab 1: Formatted Body */}
              {requestTab === 'formatted' && (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Nội dung JSON Payload:</span>
                    <div className="flex items-center gap-2">
                      <button
                        id="btn-toggle-mask-password"
                        type="button"
                        onClick={() => setMaskPassword(!maskPassword)}
                        className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {maskPassword ? <EyeOff className="w-3 h-3 text-amber-500" /> : <Eye className="w-3 h-3 text-cyan-500" />}
                        <span>{maskPassword ? 'Đang ẩn mật khẩu' : 'Hiển thị mật khẩu'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            maskPassword ? request.maskedBody : request.body,
                            'req-body'
                          )
                        }
                        className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer ml-1"
                      >
                        {copiedSection === 'req-body' ? (
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 relative bg-slate-950 rounded-lg border border-slate-800 p-3 font-mono text-xs text-emerald-300 overflow-x-auto min-h-[160px]">
                    <pre className="whitespace-pre leading-relaxed">
                      {maskPassword ? request.maskedBody : request.body}
                    </pre>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    💡 <strong>Bản chất vi điều khiển:</strong> Payload JSON này được ESP32 / STM32 format thành mảng ký tự và ghi thẳng vào socket TCP thông qua hàm <code>client.print()</code>.
                  </p>
                </div>
              )}

              {/* Tab 2: Headers Table */}
              {requestTab === 'headers' && (
                <div className="flex-1 flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Các Headers được gửi:</span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(request.headers, null, 2),
                          'req-headers'
                        )
                      }
                      className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {copiedSection === 'req-headers' ? (
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy Headers JSON</span>
                    </button>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden flex-1">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-400 font-mono border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-2.5 font-semibold">Tên Header (Key)</th>
                          <th className="p-2.5 font-semibold">Giá trị (Value)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                        {Object.entries(request.headers).map(([k, v]) => (
                          <tr key={k} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                            <td className="p-2.5 text-cyan-700 dark:text-cyan-300 font-semibold">{k}</td>
                            <td className="p-2.5 text-slate-800 dark:text-slate-300 break-all">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Raw Wire HTTP */}
              {requestTab === 'raw' && (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span>Chuỗi byte truyền qua Socket C / Arduino:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(request.rawHttpWire, 'req-raw')}
                      className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {copiedSection === 'req-raw' ? (
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy Raw</span>
                    </button>
                  </div>

                  <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 p-3 font-mono text-xs text-amber-200 overflow-x-auto min-h-[160px]">
                    <div className="space-y-0.5">
                      {request.rawHttpWire.split('\n').map((line, idx) => (
                        <div key={idx} className="flex gap-3 hover:bg-slate-900/80 px-1 py-0.5 rounded">
                          <span className="select-none text-slate-600 text-[10px] w-5 text-right font-mono shrink-0">
                            {idx + 1}
                          </span>
                          <span className={idx === 0 ? 'text-cyan-300 font-bold' : line === '' ? 'text-slate-600 italic' : 'text-amber-100'}>
                            {line === '' ? '<CRLF: Hàng trống ngắt Headers>' : line}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    💡 Chuẩn HTTP/1.1 quy định mỗi dòng phân cách bằng ký tự CRLF (<code className="text-amber-600 dark:text-amber-300">\r\n</code>), và 2 lần CRLF liên tiếp để đánh dấu kết thúc Headers trước khi sang Body.
                  </p>
                </div>
              )}

              {/* Tab 4: cURL Terminal */}
              {requestTab === 'curl' && (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span>Lệnh cURL (Thử trên Linux / MacOS / Windows Terminal):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generateCurl(request), 'req-curl')}
                      className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {copiedSection === 'req-curl' ? (
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy cURL</span>
                    </button>
                  </div>

                  <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 p-3 font-mono text-xs text-cyan-300 overflow-x-auto min-h-[160px]">
                    <pre className="whitespace-pre leading-relaxed">{generateCurl(request)}</pre>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    💡 Bạn có thể dán trực tiếp câu lệnh này vào Terminal để kiểm tra phản hồi từ máy chủ độc lập với trình duyệt.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              <FileText className="w-8 h-8 mb-2 opacity-50 text-slate-400" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Chưa có HTTP Request nào được gửi.</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Nhấn nút "Đăng Nhập" ở form cấu hình để khởi tạo vòng đời request.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT COLUMN: RESPONSE INSPECTOR ================= */}
      <div className="bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs flex flex-col transition-colors duration-200">
        {/* Header bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              2. HTTP Response (Phản Hồi Máy Chủ)
            </h3>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <button
              id="tab-res-body"
              type="button"
              onClick={() => setResponseTab('body')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                responseTab === 'body'
                  ? 'bg-white dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-slate-200 dark:border-emerald-800/60 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Response Body
            </button>
            <button
              id="tab-res-headers"
              type="button"
              onClick={() => setResponseTab('headers')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                responseTab === 'headers'
                  ? 'bg-white dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-slate-200 dark:border-emerald-800/60 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Headers ({response ? Object.keys(response.headers).length : 0})
            </button>
          </div>
        </div>

        {/* Response Content */}
        <div className="p-4 flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Đang chờ máy chủ phản hồi...</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Đang tiến hành bắt tay và xử lý chứng thực</p>
            </div>
          ) : response ? (
            <div className="space-y-3 flex-1 flex flex-col">
              {/* Status Code Banner */}
              <div
                className={`p-3 rounded-lg border flex flex-col gap-2 ${
                  response.status >= 200 && response.status < 300
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-300'
                    : response.status >= 400 && response.status < 500
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/40 text-rose-950 dark:text-rose-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base sm:text-lg font-bold">
                      {response.status > 0 ? `HTTP ${response.status}` : 'Lỗi Mạng'}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-black/10 dark:bg-black/40">
                      {response.statusText || (response.isError ? 'Connection Error' : 'Unknown')}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold">{response.durationMs} ms</span>
                </div>

                {/* Educational status explanation */}
                {statusExplanation ? (
                  <div className="text-xs text-slate-800 dark:text-slate-200 border-t border-slate-200/80 dark:border-slate-700/50 pt-2 space-y-1">
                    <p>
                      <strong>Ý nghĩa HTTP:</strong> {statusExplanation.meaning}
                    </p>
                    <p className="text-cyan-900 dark:text-cyan-300">
                      <strong>Ứng dụng IoT:</strong> {statusExplanation.iotContext}
                    </p>
                  </div>
                ) : response.isError ? (
                  <div className="text-xs text-rose-900 dark:text-rose-300 border-t border-rose-200 dark:border-rose-800/40 pt-2 space-y-1">
                    <p className="flex items-center gap-1.5 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{response.errorMessage || 'Lỗi mạng không thể kết nối tới server.'}</span>
                    </p>
                    {response.errorType === 'TIMEOUT' && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        Request đã vượt quá ngưỡng timeout cài đặt. Trên vi điều khiển IoT, điều này ngăn thiết bị bị đóng băng tiến trình.
                      </p>
                    )}
                    {response.errorType === 'CORS_ERROR' && (
                      <div className="text-[11px] text-amber-900 dark:text-amber-200 bg-amber-100/70 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-300 dark:border-amber-800/50 mt-1 leading-relaxed">
                        <strong>Lưu ý cho Lập trình viên IoT:</strong> Trình duyệt web có cơ chế bảo mật CORS, nếu server của bạn chưa bật header <code className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-1 py-0.5 rounded font-mono">Access-Control-Allow-Origin: *</code> thì trình duyệt sẽ chặn hiển thị response. Tuy nhiên, <strong>trên vi điều khiển thật (ESP32, STM32, Arduino) hoàn toàn KHÔNG có CORS</strong> vì thiết bị kết nối socket TCP trực tiếp, do đó code trên ESP32 sẽ gọi bình thường!
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Tab 1: Response Body */}
              {responseTab === 'body' && (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Nội dung Phản hồi (Response Body):</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(response.bodyText, 'res-body')}
                      className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {copiedSection === 'res-body' ? (
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy Body</span>
                    </button>
                  </div>

                  <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 p-3 font-mono text-xs text-cyan-200 overflow-x-auto min-h-[160px]">
                    <pre className="whitespace-pre leading-relaxed">
                      {response.bodyText || '<Phản hồi không có nội dung body>'}
                    </pre>
                  </div>
                </div>
              )}

              {/* Tab 2: Response Headers */}
              {responseTab === 'headers' && (
                <div className="flex-1 flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Headers từ máy chủ:</span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(response.headers, null, 2),
                          'res-headers'
                        )
                      }
                      className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {copiedSection === 'res-headers' ? (
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy Headers</span>
                    </button>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden flex-1">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-400 font-mono border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-2.5 font-semibold">Tên Header (Key)</th>
                          <th className="p-2.5 font-semibold">Giá trị (Value)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                        {Object.entries(response.headers).length > 0 ? (
                          Object.entries(response.headers).map(([k, v]) => (
                            <tr key={k} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                              <td className="p-2.5 text-cyan-700 dark:text-cyan-300 font-semibold">{k}</td>
                              <td className="p-2.5 text-slate-800 dark:text-slate-300 break-all">{v}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="p-3 text-slate-500 text-center">
                              Không có header nào khả dụng (hoặc bị giới hạn bởi CORS expose-headers).
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              <Layers className="w-8 h-8 mb-2 opacity-50 text-slate-400" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Chưa có phản hồi từ máy chủ.</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Kết quả Status Code, Headers và Body sẽ hiển thị tại đây sau khi gửi request.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
