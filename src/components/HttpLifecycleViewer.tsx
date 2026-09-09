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
  // Determine lifecycle step: 0: idle, 1: DNS & Socket, 2: TLS Handshake, 3: Wire Request, 4: Server Auth, 5: Response
  let activeStep = 0;
  if (isRequesting) {
    activeStep = 3;
  } else if (response) {
    activeStep = 5;
  }

  const isSuccess = response && response.status >= 200 && response.status < 300;
  const isClientError = response && response.status >= 400 && response.status < 500;
  const isServerError = response && response.status >= 500;
  const isNetworkFail = response && response.isError && response.status === 0;

  return (
    <div className="bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRequesting ? 'bg-amber-400' : response ? 'bg-emerald-400' : 'bg-cyan-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRequesting ? 'bg-amber-500' : response ? 'bg-emerald-500' : 'bg-cyan-500'}`}></span>
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Vòng Đời Gói Tin HTTP / HTTPS (Pipeline Trực Quan)
          </h3>
        </div>

        {response && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <Timer className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Độ trễ:</span>
              <strong className="font-mono text-cyan-700 dark:text-cyan-300 font-bold">{response.durationMs} ms</strong>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Dung lượng Body:</span>
              <strong className="font-mono text-amber-700 dark:text-amber-300 font-bold">
                {new TextEncoder().encode(response.bodyText || '').length} B
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Visual Pipeline with Connected Progress Line */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {/* Step 1: IoT Client */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            activeStep >= 1
              ? 'bg-cyan-50/70 dark:bg-slate-800/90 border-cyan-300 dark:border-cyan-500/50 shadow-2xs'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
              BƯỚC 1
            </span>
            <Cpu className={`w-4 h-4 ${activeStep >= 1 ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`} />
          </div>
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Khởi Tạo Socket</div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            Phân giải DNS miền sang IP và mở kết nối TCP Socket trên thiết bị.
          </p>
        </div>

        {/* Step 2: Transport & TLS */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            activeStep >= 2
              ? 'bg-cyan-50/70 dark:bg-slate-800/90 border-cyan-300 dark:border-cyan-500/50 shadow-2xs'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
              BƯỚC 2
            </span>
            <ShieldCheck className={`w-4 h-4 ${isHttps ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`} />
          </div>
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
            {isHttps ? 'TLS Handshake (Port 443)' : 'TCP Bản Rõ (Port 80)'}
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            {isHttps
              ? 'Xác thực chứng chỉ CA & thiết lập khóa mã hóa đối xứng AES-GCM.'
              : 'Bắt tay 3 bước TCP SYN-ACK thông thường, không mã hóa an toàn.'}
          </p>
        </div>

        {/* Step 3: Request Sending */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            isRequesting
              ? 'bg-cyan-100/90 dark:bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-400/30 animate-pulse'
              : activeStep >= 3
              ? 'bg-cyan-50/70 dark:bg-slate-800/90 border-cyan-300 dark:border-cyan-500/50 shadow-2xs'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
              BƯỚC 3
            </span>
            <ArrowRight className={`w-4 h-4 ${activeStep >= 3 ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`} />
          </div>
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Truyền Tải Dữ Liệu</div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            Gửi chuỗi Headers & JSON Payload <code className="text-cyan-700 dark:text-cyan-300 font-mono text-[10px]">{`{user, pass}`}</code> vào socket.
          </p>
        </div>

        {/* Step 4: Server Processing */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            isRequesting
              ? 'bg-cyan-100/90 dark:bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-400/30 animate-pulse'
              : activeStep >= 4
              ? 'bg-cyan-50/70 dark:bg-slate-800/90 border-cyan-300 dark:border-cyan-500/50 shadow-2xs'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
              BƯỚC 4
            </span>
            <Server className={`w-4 h-4 ${activeStep >= 4 ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`} />
          </div>
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Xác Thực & Ký Token</div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            Máy chủ băm mật khẩu, đối chiếu cơ sở dữ liệu và ký sinh mã JWT.
          </p>
        </div>

        {/* Step 5: Response Received */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            response
              ? isSuccess
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/80 text-emerald-950 dark:text-emerald-200 shadow-2xs'
                : isClientError
                ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/80 text-amber-950 dark:text-amber-200 shadow-2xs'
                : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/80 text-rose-950 dark:text-rose-200 shadow-2xs'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
              BƯỚC 5
            </span>
            {response ? (
              isSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : isClientError ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              )
            ) : (
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="font-bold text-xs">
            {response ? (
              response.status > 0 ? (
                <span>
                  HTTP {response.status} {response.statusText}
                </span>
              ) : (
                <span>Lỗi Kết Nối Mạng</span>
              )
            ) : (
              'Chờ Phản Hồi'
            )}
          </div>
          <p className="text-[11px] mt-1 opacity-90 leading-relaxed">
            {response
              ? isSuccess
                ? 'Nhận Token thành công! Thiết bị đã có quyền gửi dữ liệu cảm biến.'
                : isClientError
                ? 'Xác thực thất bại (4xx: sai tài khoản hoặc URL endpoint).'
                : isNetworkFail
                ? 'Không vươn tới server (mất Wi-Fi hoặc timeout quá hạn).'
                : 'Máy chủ phản hồi lỗi nội bộ (5xx).'
              : 'Thiết bị sẵn sàng nhận các khung phản hồi TCP.'}
          </p>
        </div>
      </div>
    </div>
  );
};
