import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Code2,
  Layers,
  Key,
  Clock,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Radio,
  FileText,
  Terminal,
} from 'lucide-react';
import { AuthTokenInfo, ResponseLog } from '../types';
import { STATUS_CODES_MAP } from '../data/httpKnowledge';
import { TokenVisualizer } from './TokenVisualizer';

interface ServerResponsePanelProps {
  response: ResponseLog | null;
  tokenInfo: AuthTokenInfo | null;
  serverUrl: string;
  isLoading: boolean;
  onCopyToast?: (text: string, title: string) => void;
}

export const ServerResponsePanel: React.FC<ServerResponsePanelProps> = ({
  response,
  tokenInfo,
  serverUrl,
  isLoading,
  onCopyToast,
}) => {
  const [activeTab, setActiveTab] = React.useState<'body' | 'headers' | 'token' | 'raw'>('body');
  const [copied, setCopied] = React.useState<string | null>(null);

  // Switch to token tab automatically if token is detected
  React.useEffect(() => {
    if (tokenInfo && activeTab !== 'token') {
      setActiveTab('token');
    } else if (!tokenInfo && activeTab === 'token') {
      setActiveTab('body');
    }
  }, [tokenInfo]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    if (onCopyToast) {
      onCopyToast(text, `Đã sao chép ${label}`);
    }
    setTimeout(() => setCopied(null), 2000);
  };

  const statusExplanation =
    response && response.status > 0 ? STATUS_CODES_MAP[response.status] : null;

  const is2xx = response && response.status >= 200 && response.status < 300;
  const is4xx = response && response.status >= 400 && response.status < 500;
  const is5xx = response && response.status >= 500;
  const isNetError = response && (response.status === 0 || response.isError && !response.status);

  return (
    <div className="bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full min-h-[520px] transition-all duration-200">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Server Phản Hồi (HTTP Response)
              </h2>
              {response && (
                <span className="text-[11px] font-mono text-cyan-500 dark:text-cyan-400 font-semibold">
                  {response.durationMs}ms
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trạng thái HTTP, Headers và Dữ liệu Token nhận về
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        {response && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('body')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'body'
                  ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Response JSON
            </button>

            {tokenInfo && (
              <button
                type="button"
                onClick={() => setActiveTab('token')}
                className={`relative px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'token'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                    : 'text-purple-600 dark:text-purple-400 hover:bg-purple-500/10'
                }`}
              >
                <Key className="w-3 h-3" />
                <span>Token & IoT</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('headers')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'headers'
                  ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Headers ({Object.keys(response.headers).length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'raw'
                  ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Raw Wire
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-4 sm:p-5">
        {isLoading ? (
          /* Loading State: Cyber Scanning */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[320px]">
            <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <div className="absolute inset-2 rounded-xl border-2 border-emerald-500/20 border-b-emerald-400 animate-spin [animation-direction:reverse]" />
              <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">
              Đang chờ phản hồi từ Server qua Socket TCP...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Gói tin HTTP POST đang được máy chủ tiếp nhận, xác thực tài khoản và mã hóa sinh Token.
            </p>
          </div>
        ) : !response ? (
          /* Empty Ready State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[320px] rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
              <Server className="w-7 h-7 text-slate-400 dark:text-slate-500 stroke-1" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">
              Chưa Có Dữ Liệu Phản Hồi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
              Nhấn nút <strong className="text-cyan-600 dark:text-cyan-400 font-semibold">"Gửi HTTP POST Request"</strong> ở cột bên trái để bắt đầu phiên kiểm thử và quan sát dữ liệu trả về từ máy chủ.
            </p>
          </div>
        ) : (
          /* Response Displayed */
          <div className="flex-1 flex flex-col space-y-4">
            {/* Status Code Banner with Scale Bounce Micro-Animation */}
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 18, stiffness: 260 }}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                is2xx
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200 shadow-sm shadow-emerald-950/20'
                  : is4xx
                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-200 shadow-sm shadow-amber-950/20'
                  : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/40 text-rose-950 dark:text-rose-200 shadow-sm shadow-rose-950/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      is2xx
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                        : is4xx
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {is2xx ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : is4xx ? (
                      <AlertTriangle className="w-6 h-6" />
                    ) : (
                      <XCircle className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-extrabold font-mono tracking-tight">
                        {response.status > 0 ? `HTTP ${response.status}` : 'NETWORK FAILURE'}
                      </span>
                      <span className="text-xs sm:text-sm font-bold opacity-90">
                        {response.statusText}
                      </span>
                    </div>
                    {statusExplanation && (
                      <p className="text-xs opacity-80 mt-0.5 leading-snug">
                        {statusExplanation.meaning}
                      </p>
                    )}
                    {response.errorMessage && (
                      <p className="text-xs font-mono text-rose-600 dark:text-rose-400 mt-1">
                        {response.errorMessage}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 font-mono text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-white/60 dark:bg-slate-900/80 border border-current/20 font-bold">
                    ⏱ {response.durationMs} ms
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/60 dark:bg-slate-900/80 border border-current/20">
                    📦 {new TextEncoder().encode(response.bodyText || '').length} Bytes
                  </span>
                </div>
              </div>

              {/* IoT Context Alert within Status Banner */}
              {statusExplanation && (
                <div className="mt-2.5 pt-2.5 border-t border-current/15 text-[11px] leading-relaxed flex items-start gap-1.5 font-mono">
                  <span className="font-bold shrink-0 text-cyan-600 dark:text-cyan-300">
                    [ESP32 / IoT Context]:
                  </span>
                  <span>{statusExplanation.iotContext}</span>
                </div>
              )}
            </motion.div>

            {/* TAB CONTENT: RESPONSE JSON */}
            {activeTab === 'body' && (
              <div className="flex-1 flex flex-col min-h-0 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono">
                    {response.jsonBody ? 'JSON Payload Object' : 'Plaintext Body'}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(response.bodyText, 'Response Body')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer text-xs font-semibold"
                  >
                    {copied === 'Response Body' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied === 'Response Body' ? 'Đã sao chép' : 'Sao chép JSON'}</span>
                  </button>
                </div>

                <div className="relative flex-1 min-h-[260px] max-h-[460px] overflow-auto rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs font-mono text-emerald-400 selection:bg-cyan-500 selection:text-white">
                  <pre className="leading-relaxed">
                    <code>{response.bodyText || '// (Body trống)'}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* TAB CONTENT: TOKEN VISUALIZER */}
            {activeTab === 'token' && tokenInfo && (
              <div className="flex-1 overflow-y-auto">
                <TokenVisualizer tokenInfo={tokenInfo} serverUrl={serverUrl} />
              </div>
            )}

            {/* TAB CONTENT: RESPONSE HEADERS */}
            {activeTab === 'headers' && (
              <div className="flex-1 flex flex-col min-h-0 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Các Headers phản hồi từ Web Server:</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(response.headers, null, 2),
                        'Response Headers'
                      )
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer text-xs font-semibold"
                  >
                    {copied === 'Response Headers' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Sao chép Headers</span>
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs font-mono">
                  {Object.entries(response.headers).length === 0 ? (
                    <div className="p-4 text-center text-slate-500">
                      Trình duyệt giới hạn truy cập headers (CORS Restricted Headers).
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[360px] overflow-y-auto">
                      {Object.entries(response.headers).map(([key, val]) => (
                        <div key={key} className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-slate-50/50 dark:bg-slate-950/40">
                          <span className="text-cyan-700 dark:text-cyan-400 font-bold">{key}:</span>
                          <span className="text-slate-700 dark:text-slate-300 break-all">{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: RAW WIRE */}
            {activeTab === 'raw' && (
              <div className="flex-1 flex flex-col min-h-0 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono">Chuỗi byte phản hồi thô trên kết nối TCP:</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `HTTP/1.1 ${response.status} ${response.statusText}\n${Object.entries(response.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${response.bodyText}`,
                        'Raw Wire'
                      )
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer text-xs font-semibold"
                  >
                    {copied === 'Raw Wire' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Sao chép Raw</span>
                  </button>
                </div>

                <div className="relative flex-1 min-h-[260px] max-h-[460px] overflow-auto rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs font-mono text-slate-300">
                  <pre className="leading-relaxed">
                    <code>
                      <span className="text-cyan-400 font-bold">{`HTTP/1.1 ${response.status} ${response.statusText}\r\n`}</span>
                      {Object.entries(response.headers).map(([k, v]) => (
                        <span key={k} className="text-slate-400">{`${k}: ${v}\r\n`}</span>
                      ))}
                      <span className="text-slate-600">{`\r\n`}</span>
                      <span className="text-emerald-400">{response.bodyText}</span>
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
