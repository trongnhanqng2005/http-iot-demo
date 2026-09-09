import React from 'react';
import {
  Key,
  Lock,
  Copy,
  Check,
  Send,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Info,
  Radio,
  RefreshCw,
} from 'lucide-react';
import { AuthTokenInfo } from '../types';

interface TokenVisualizerProps {
  tokenInfo: AuthTokenInfo;
  serverUrl: string;
}

export const TokenVisualizer: React.FC<TokenVisualizerProps> = ({
  tokenInfo,
  serverUrl,
}) => {
  const [copied, setCopied] = React.useState<boolean>(false);
  const [copiedAuthHeader, setCopiedAuthHeader] = React.useState<boolean>(false);

  // Interactive IoT Telemetry Test State
  const [telemetryTemp, setTelemetryTemp] = React.useState<number>(29.4);
  const [telemetryHum, setTelemetryHum] = React.useState<number>(68.2);
  const [telemetryStatus, setTelemetryStatus] = React.useState<'idle' | 'simulated'>('idle');
  const [simulatedLog, setSimulatedLog] = React.useState<string | null>(null);

  const copyToken = () => {
    navigator.clipboard.writeText(tokenInfo.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAuthHeader = () => {
    navigator.clipboard.writeText(`Authorization: Bearer ${tokenInfo.token}`);
    setCopiedAuthHeader(true);
    setTimeout(() => setCopiedAuthHeader(false), 2000);
  };

  const handleSimulateTelemetry = () => {
    let baseUrl = 'https://api.example.com';
    try {
      const u = new URL(serverUrl);
      baseUrl = u.origin;
    } catch {}

    const telemetryEndpoint = `${baseUrl}/api/v1/sensors/telemetry`;
    const telemetryBody = {
      deviceId: 'ESP32-NODE-TEMPHUM-01',
      timestamp: new Date().toISOString(),
      sensors: {
        temperature_celsius: telemetryTemp,
        humidity_percent: telemetryHum,
        battery_level: 95,
      },
    };

    const rawHttp = `POST /api/v1/sensors/telemetry HTTP/1.1\r\n` +
      `Host: ${baseUrl.replace(/^https?:\/\//, '')}\r\n` +
      `Authorization: Bearer ${tokenInfo.token.slice(0, 25)}...\r\n` +
      `Content-Type: application/json\r\n` +
      `Content-Length: ${new TextEncoder().encode(JSON.stringify(telemetryBody)).length}\r\n` +
      `Connection: close\r\n\r\n` +
      JSON.stringify(telemetryBody, null, 2);

    setSimulatedLog(rawHttp);
    setTelemetryStatus('simulated');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/40 rounded-xl p-4 sm:p-6 shadow-sm dark:shadow-xl dark:shadow-emerald-950/20 space-y-6 transition-colors duration-200">
      {/* Title & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Xác Thực Thành Công & Nhận Token
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                {tokenInfo.tokenType === 'JWT' ? 'JSON Web Token (JWT)' : 'Session Token'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Trích xuất từ trường: <code className="text-cyan-700 dark:text-cyan-300 font-mono">{tokenInfo.extractedFromKey}</code> ({tokenInfo.token.length} ký tự)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-copy-token"
            onClick={copyToken}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép Token' : 'Sao chép Token'}</span>
          </button>
        </div>
      </div>

      {/* Raw Token Box */}
      <div>
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
          Chuỗi Token nhận từ Máy chủ:
        </label>
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 break-all leading-relaxed max-h-24 overflow-y-auto select-all">
          {tokenInfo.token}
        </div>
      </div>

      {/* JWT Breakdown (if JWT) */}
      {tokenInfo.tokenType === 'JWT' && tokenInfo.decodedJwt && (
        <div className="bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Giải mã cấu trúc 3 phần của JWT (RFC 7519)</span>
            </h4>
            {tokenInfo.decodedJwt.expiresAtFormatted && (
              <span className={`text-xs flex items-center gap-1 font-mono ${tokenInfo.decodedJwt.isExpired ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {tokenInfo.decodedJwt.isExpired
                    ? 'Token đã hết hạn'
                    : `Hết hạn lúc: ${tokenInfo.decodedJwt.expiresAtFormatted}`}
                </span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Header */}
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20 font-bold">
                1. Header (Thuật toán & Loại)
              </span>
              <pre className="text-xs font-mono text-rose-700 dark:text-rose-300 mt-2 whitespace-pre overflow-x-auto">
                {JSON.stringify(tokenInfo.decodedJwt.header, null, 2)}
              </pre>
            </div>

            {/* Payload Claims */}
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20 font-bold">
                2. Payload (Claims: Quyền & Thông tin)
              </span>
              <pre className="text-xs font-mono text-cyan-700 dark:text-cyan-300 mt-2 whitespace-pre overflow-x-auto">
                {JSON.stringify(tokenInfo.decodedJwt.payload, null, 2)}
              </pre>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            💡 <strong>Cơ chế JWT:</strong> Phần 3 là Chữ ký số (Signature). Máy chủ sử dụng khóa bí mật để ký. Vi điều khiển hoặc backend không cần truy vấn Database mỗi lần, chỉ cần kiểm tra chữ ký và hạn <code className="text-cyan-700 dark:text-cyan-300 font-mono">exp</code> là biết request có hợp lệ hay không.
          </p>
        </div>
      )}

      {/* Educational: How IoT Devices Use This Token */}
      <div className="bg-cyan-50/50 dark:bg-slate-950/90 rounded-xl border border-cyan-200 dark:border-cyan-900/40 p-4 sm:p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shrink-0 mt-0.5">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Cách Thiết Bị IoT Sử Dụng Token Này Cho Mọi Request Tiếp Theo
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Trong kiến trúc IoT, sau khi đăng nhập thành công, thiết bị <strong>KHÔNG</strong> gửi lại tài khoản/mật khẩu trong mỗi chu kỳ gửi cảm biến. Thay vào đó, thiết bị đính kèm Token này vào Header <code className="text-cyan-800 dark:text-cyan-300 font-mono font-semibold">Authorization: Bearer &lt;token&gt;</code>.
            </p>
          </div>
        </div>

        {/* Workflow steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1 text-cyan-700 dark:text-cyan-300">
              <span>1. Lưu vào RAM / RTC</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              ESP32 gán biến chuỗi <code className="text-slate-800 dark:text-slate-300">String authToken = "..."</code> hoặc lưu RTC Memory nếu dùng Deep Sleep.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1 text-cyan-700 dark:text-cyan-300">
              <span>2. Gắn Header Authorization</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Trong lệnh HTTP: <code className="text-slate-800 dark:text-slate-300">http.addHeader("Authorization", "Bearer " + authToken);</code>
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1 text-cyan-700 dark:text-cyan-300">
              <span>3. Xử lý khi Token Hết Hạn</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Nếu Server trả về <code className="text-rose-600 dark:text-rose-400 font-semibold">401 Unauthorized</code>, thiết bị tự động gọi lại hàm Login để lấy Token mới.
            </p>
          </div>
        </div>

        {/* Copyable Authorization Header Box */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">Header cần thêm:</span>
            <span className="text-cyan-700 dark:text-cyan-300 font-semibold truncate">
              Authorization: Bearer {tokenInfo.token.slice(0, 30)}...
            </span>
          </div>
          <button
            id="btn-copy-auth-header"
            type="button"
            onClick={copyAuthHeader}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
          >
            {copiedAuthHeader ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedAuthHeader ? 'Đã copy Header' : 'Copy Header'}</span>
          </button>
        </div>
      </div>

      {/* Interactive IoT Telemetry Simulator */}
      <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Mô Phỏng Gửi Dữ Liệu Cảm Biến IoT với Token Này</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Quan sát trực tiếp cấu trúc gói tin HTTP Telemetry mà thiết bị IoT sẽ gửi lên server sau khi đã có Token.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-700 dark:text-slate-300 block mb-1">
              Nhiệt độ đo được (°C): <strong className="text-amber-700 dark:text-amber-300">{telemetryTemp}°C</strong>
            </label>
            <input
              type="range"
              min={10}
              max={50}
              step={0.5}
              value={telemetryTemp}
              onChange={(e) => setTelemetryTemp(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-600 dark:accent-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-700 dark:text-slate-300 block mb-1">
              Độ ẩm đo được (%): <strong className="text-cyan-700 dark:text-cyan-300">{telemetryHum}%</strong>
            </label>
            <input
              type="range"
              min={20}
              max={99}
              step={1}
              value={telemetryHum}
              onChange={(e) => setTelemetryHum(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-600 dark:accent-cyan-500"
            />
          </div>
        </div>

        <button
          type="button"
          id="btn-simulate-telemetry"
          onClick={handleSimulateTelemetry}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Tạo & Kiểm Tra Gói Tin HTTP Telemetry Kèm Bearer Token</span>
        </button>

        {simulatedLog && (
          <div className="pt-2">
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
              Gói tin HTTP Telemetry được sinh ra (Ready for ESP32 Socket):
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
              <pre className="whitespace-pre">{simulatedLog}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
