import React from 'react';
import {
  Cpu,
  Server,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Timer,
  Zap,
} from 'lucide-react';
import { ResponseLog } from '../types';

interface HttpLifecycleViewerProps {
  isRequesting: boolean;
  response: ResponseLog | null;
  isHttps: boolean;
}

export const HttpLifecycleViewer: React.FC<HttpLifecycleViewerProps> = ({
  isRequesting,
  response,
  isHttps,
}) => {
  // Determine lifecycle step
  let activeStep = 0; // 0 = idle, 1 = connect, 2 = send, 3 = process, 4 = complete
  if (isRequesting) {
    activeStep = 3; // Processing
  } else if (response) {
    activeStep = 4; // Complete
  }

  const isSuccess = response && response.status >= 200 && response.status < 300;
  const isClientError = response && response.status >= 400 && response.status < 500;
  const isServerError = response && response.status >= 500;
  const isNetworkFail = response && response.isError && response.status === 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-200 tracking-wide uppercase">
            Vòng Đời Giao Thức HTTP / HTTPS (Request - Response Lifecycle)
          </h3>
        </div>

        {response && (
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              <Timer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Thời gian phản hồi (Latency): </span>
              <strong className="font-mono text-cyan-300">{response.durationMs} ms</strong>
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Kích thước Body: </span>
              <strong className="font-mono text-amber-300">
                {new TextEncoder().encode(response.bodyText || '').length} bytes
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Visual Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 relative">
        {/* Step 1: IoT Client */}
        <div
          className={`p-3 rounded-lg border transition-all ${
            activeStep >= 1
              ? 'bg-slate-800/80 border-cyan-500/60 shadow-sm shadow-cyan-950/40'
              : 'bg-slate-950/60 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              Bước 1: Client
            </span>
            <Cpu className={`w-4 h-4 ${activeStep >= 1 ? 'text-cyan-400' : 'text-slate-600'}`} />
          </div>
          <div className="font-semibold text-xs text-slate-200">Thiết bị IoT / App</div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Khởi tạo socket TCP, phân giải DNS sang IP máy chủ.
          </p>
        </div>

        {/* Step 2: Transport & TLS */}
        <div
          className={`p-3 rounded-lg border transition-all ${
            activeStep >= 2
              ? 'bg-slate-800/80 border-cyan-500/60 shadow-sm shadow-cyan-950/40'
              : 'bg-slate-950/60 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              Bước 2: Kết nối
            </span>
            <ShieldCheck className={`w-4 h-4 ${isHttps ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <div className="font-semibold text-xs text-slate-200">
            {isHttps ? 'Bắt tay TLS (Port 443)' : 'TCP Bản rõ (Port 80)'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            {isHttps
              ? 'Trao đổi chứng chỉ CA & tạo khóa phiên mã hóa đối xứng.'
              : 'Bắt tay TCP 3-way handshake thông thường, không mã hóa.'}
          </p>
        </div>

        {/* Step 3: Request Sending */}
        <div
          className={`p-3 rounded-lg border transition-all ${
            isRequesting
              ? 'bg-cyan-950/50 border-cyan-400 animate-pulse'
              : activeStep >= 3
              ? 'bg-slate-800/80 border-cyan-500/60'
              : 'bg-slate-950/60 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              Bước 3: Request
            </span>
            <ArrowRight className={`w-4 h-4 ${activeStep >= 3 ? 'text-cyan-400' : 'text-slate-600'}`} />
          </div>
          <div className="font-semibold text-xs text-slate-200">Gửi Headers & Body</div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Truyền tải chuỗi JSON <code className="text-cyan-300 font-mono text-[10px]">{`{username, password}`}</code> qua luồng mạng.
          </p>
        </div>

        {/* Step 4: Server Processing */}
        <div
          className={`p-3 rounded-lg border transition-all ${
            isRequesting
              ? 'bg-cyan-950/50 border-cyan-400 animate-pulse'
              : activeStep >= 4
              ? 'bg-slate-800/80 border-cyan-500/60'
              : 'bg-slate-950/60 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              Bước 4: Máy chủ
            </span>
            <Server className={`w-4 h-4 ${activeStep >= 4 ? 'text-cyan-400' : 'text-slate-600'}`} />
          </div>
          <div className="font-semibold text-xs text-slate-200">Xác thực & Tạo Token</div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Đối chiếu mật khẩu trong Database, ký phát sinh chuỗi JWT/Session Token.
          </p>
        </div>

        {/* Step 5: Response Received */}
        <div
          className={`p-3 rounded-lg border transition-all ${
            response
              ? isSuccess
                ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 shadow-sm shadow-emerald-950'
                : isClientError
                ? 'bg-amber-950/40 border-amber-500/80 text-amber-200'
                : 'bg-rose-950/40 border-rose-500/80 text-rose-200'
              : 'bg-slate-950/60 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              Bước 5: Phản hồi
            </span>
            {response ? (
              isSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : isClientError ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400" />
              )
            ) : (
              <CheckCircle2 className="w-4 h-4 text-slate-600" />
            )}
          </div>
          <div className="font-semibold text-xs">
            {response ? (
              response.status > 0 ? (
                <span>
                  HTTP {response.status} {response.statusText}
                </span>
              ) : (
                <span>Lỗi Kết Nối Mạng</span>
              )
            ) : (
              'Chờ phản hồi'
            )}
          </div>
          <p className="text-[11px] mt-1 opacity-80 leading-relaxed">
            {response
              ? isSuccess
                ? 'Đã nhận Token thành công. Sẵn sàng cho Telemetry IoT.'
                : isClientError
                ? 'Xác thực thất bại (Sai user/pass hoặc URL).'
                : isNetworkFail
                ? 'Timeout hoặc mạng không thể vươn tới server.'
                : 'Máy chủ phản hồi lỗi nội bộ.'
              : 'Client đợi nhận các gói tin TCP Response.'}
          </p>
        </div>
      </div>
    </div>
  );
};
