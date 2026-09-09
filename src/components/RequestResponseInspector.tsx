import React from 'react';
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Code2,
  FileText,
  HelpCircle,
  AlertCircle,
  Layers,
  Sparkles,
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
  const [requestTab, setRequestTab] = React.useState<'formatted' | 'raw' | 'headers'>('formatted');
  const [responseTab, setResponseTab] = React.useState<'body' | 'headers' | 'raw'>('body');
  const [maskPassword, setMaskPassword] = React.useState<boolean>(true);
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const statusExplanation = response && response.status > 0 ? STATUS_CODES_MAP[response.status] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* ================= LEFT COLUMN: REQUEST INSPECTOR ================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg shadow-black/20 flex flex-col">
        {/* Header bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide">
              1. HTTP Request (Gói Tin Gửi Đi)
            </h3>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              id="tab-req-formatted"
              type="button"
              onClick={() => setRequestTab('formatted')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                requestTab === 'formatted'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Body (JSON)
            </button>
            <button
              id="tab-req-headers"
              type="button"
              onClick={() => setRequestTab('headers')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                requestTab === 'headers'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Headers
            </button>
            <button
              id="tab-req-raw"
              type="button"
              onClick={() => setRequestTab('raw')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                requestTab === 'raw'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Định dạng thô byte gửi qua Socket TCP"
            >
              Raw Wire HTTP
            </button>
          </div>
        </div>

        {/* Request Content */}
        <div className="p-4 flex-1 flex flex-col">
          {request ? (
            <div className="space-y-3 flex-1 flex flex-col">
              {/* Method & URL Banner */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    {request.method}
                  </span>
                  <span className="text-slate-300 truncate">{request.url}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(`${request.method} ${request.url}`, 'req-url')}
                  className="text-slate-400 hover:text-slate-200 p-1 shrink-0"
                  title="Copy URL"
                >
                  {copiedSection === 'req-url' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Tab 1: Formatted Body */}
              {requestTab === 'formatted' && (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-semibold">Nội dung JSON Body:</span>
                    <div className="flex items-center gap-2">
                      <button
                        id="btn-toggle-mask-password"
                        type="button"
                        onClick={() => setMaskPassword(!maskPassword)}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        {maskPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{maskPassword ? 'Đang ẩn password' : 'Hiện password thật'}</span>
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            maskPassword ? request.maskedBody : request.body,
                            'req-body'
                          )
                        }
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 ml-2"
                      >
                        {copiedSection === 'req-body' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 relative bg-slate-950 rounded-lg border border-slate-800 p-3 font-mono text-xs text-emerald-300 overflow-x-auto min-h-[160px]">
                    <pre className="whitespace-pre">
                      {maskPassword ? request.maskedBody : request.body}
                    </pre>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    💡 <strong>Ý nghĩa IoT:</strong> Cấu trúc JSON này được vi điều khiển (ESP32) đóng gói và gửi thẳng vào luồng dữ liệu TCP socket của máy chủ.
                  </p>
                </div>
              )}

              {/* Tab 2: Headers Table */}
              {requestTab === 'headers' && (
                <div className="flex-1 flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold">Các Headers được gửi:</span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(request.headers, null, 2),
                          'req-headers'
                        )
                      }
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      {copiedSection === 'req-headers' ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy JSON Headers</span>
                    </button>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden flex-1">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-800">
                        <tr>
                          <th className="p-2.5 font-semibold">Tên Header (Key)</th>
                          <th className="p-2.5 font-semibold">Giá trị (Value)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {Object.entries(request.headers).map(([k, v]) => (
                          <tr key={k} className="hover:bg-slate-900/40">
                            <td className="p-2.5 text-cyan-300 font-semibold">{k}</td>
                            <td className="p-2.5 text-slate-300 break-all">{v}</td>
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
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Chuỗi byte truyền qua Socket C / Arduino:</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(request.rawHttpWire, 'req-raw')}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      {copiedSection === 'req-raw' ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy Raw</span>
                    </button>
                  </div>

                  <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 p-3 font-mono text-xs text-amber-200 overflow-x-auto min-h-[160px]">
                    <pre className="whitespace-pre leading-relaxed">{request.rawHttpWire}</pre>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    💡 Chuẩn HTTP 1.1 yêu cầu phân cách mỗi dòng header bằng ký tự CRLF (<code className="text-amber-300">\r\n</code>), và 2 lần CRLF trước khi bắt đầu Body.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 border border-dashed border-slate-800 rounded-lg">
              <FileText className="w-8 h-8 mb-2 opacity-50 text-slate-400" />
              <p className="text-xs font-medium">Chưa có HTTP Request nào được gửi.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Nhấn nút "Đăng Nhập" ở trên để kích hoạt vòng đời HTTP.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT COLUMN: RESPONSE INSPECTOR ================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg shadow-black/20 flex flex-col">
        {/* Header bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide">
              2. HTTP Response (Phản Hồi Máy Chủ)
            </h3>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              id="tab-res-body"
              type="button"
              onClick={() => setResponseTab('body')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                responseTab === 'body'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Response Body
            </button>
            <button
              id="tab-res-headers"
              type="button"
              onClick={() => setResponseTab('headers')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                responseTab === 'headers'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : 'text-slate-400 hover:text-slate-200'
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
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-300">Đang chờ máy chủ phản hồi...</p>
              <p className="text-[11px] text-slate-500 mt-1">Đang xử lý bắt tay và chứng thực</p>
            </div>
          ) : response ? (
            <div className="space-y-3 flex-1 flex flex-col">
              {/* Status Code Banner */}
              <div
                className={`p-3 rounded-lg border flex flex-col gap-2 ${
                  response.status >= 200 && response.status < 300
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : response.status >= 400 && response.status < 500
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base sm:text-lg font-bold">
                      {response.status > 0 ? `HTTP ${response.status}` : 'Mạng Thất Bại'}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black/30">
                      {response.statusText || (response.isError ? 'Connection Error' : 'Unknown')}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-300">{response.durationMs} ms</span>
                </div>

                {/* Educational status explanation */}
                {statusExplanation ? (
                  <div className="text-xs text-slate-300 border-t border-slate-700/50 pt-2 space-y-1">
                    <p>
                      <strong>Ý nghĩa HTTP:</strong> {statusExplanation.meaning}
                    </p>
                    <p className="text-cyan-200">
                      <strong>Ứng dụng IoT:</strong> {statusExplanation.iotContext}
                    </p>
                  </div>
                ) : response.isError ? (
                  <div className="text-xs text-rose-300 border-t border-rose-800/40 pt-2 space-y-1">
                    <p className="flex items-center gap-1.5 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{response.errorMessage || 'Lỗi mạng không thể kết nối tới server.'}</span>
                    </p>
                    {response.errorType === 'TIMEOUT' && (
                      <p className="text-[11px] text-slate-300">
                        Request đã vượt quá ngưỡng timeout cài đặt. Trên vi điều khiển IoT, điều này ngăn thiết bị bị đóng băng tiến trình.
                      </p>
                    )}
                    {response.errorType === 'CORS_ERROR' && (
                      <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-800/50 mt-1">
                        <strong>Lưu ý cho Lập trình viên IoT:</strong> Trình duyệt web có cơ chế bảo mật CORS, nếu server của bạn chưa bật header <code className="bg-slate-900 px-1 py-0.5 rounded font-mono">Access-Control-Allow-Origin: *</code> thì trình duyệt sẽ chặn hiển thị response. Tuy nhiên, <strong>trên vi điều khiển thật (ESP32, STM32, Arduino) hoàn toàn KHÔNG có CORS</strong> vì thiết bị kết nối socket TCP trực tiếp, do đó code trên ESP32 sẽ gọi bình thường!
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Tab 1: Response Body */}
              {responseTab === 'body' && (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-semibold">Nội dung Phản hồi (Response Body):</span>
                    <button
                      onClick={() => copyToClipboard(response.bodyText, 'res-body')}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      {copiedSection === 'res-body' ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy Body</span>
                    </button>
                  </div>

                  <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 p-3 font-mono text-xs text-cyan-200 overflow-x-auto min-h-[160px]">
                    <pre className="whitespace-pre">
                      {response.bodyText || '<Phản hồi không có nội dung body>'}
                    </pre>
                  </div>
                </div>
              )}

              {/* Tab 2: Response Headers */}
              {responseTab === 'headers' && (
                <div className="flex-1 flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold">Headers từ máy chủ:</span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(response.headers, null, 2),
                          'res-headers'
                        )
                      }
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      {copiedSection === 'res-headers' ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy Headers</span>
                    </button>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden flex-1">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-800">
                        <tr>
                          <th className="p-2.5 font-semibold">Tên Header (Key)</th>
                          <th className="p-2.5 font-semibold">Giá trị (Value)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {Object.entries(response.headers).length > 0 ? (
                          Object.entries(response.headers).map(([k, v]) => (
                            <tr key={k} className="hover:bg-slate-900/40">
                              <td className="p-2.5 text-cyan-300 font-semibold">{k}</td>
                              <td className="p-2.5 text-slate-300 break-all">{v}</td>
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
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 border border-dashed border-slate-800 rounded-lg">
              <Layers className="w-8 h-8 mb-2 opacity-50 text-slate-400" />
              <p className="text-xs font-medium">Chưa có phản hồi từ máy chủ.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Kết quả Status Code, Headers và Body sẽ hiển thị tại đây sau khi gửi request.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
