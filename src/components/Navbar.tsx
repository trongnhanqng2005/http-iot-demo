import React from 'react';
import { BookOpen, Code2, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onOpenKnowledge: () => void;
  onOpenCodeSnippets: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenKnowledge,
  onOpenCodeSnippets,
  onReset,
}) => {
  const [isOnline, setIsOnline] = React.useState<boolean>(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-base shadow-sm shadow-cyan-950">
            HTTP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                HTTP & IoT Auth Lab
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Mô phỏng Giao thức
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Trực quan hóa vòng đời Request/Response & Xác thực Token cho Lập trình viên IoT
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isOnline
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-400'
            }`}
            title={isOnline ? 'Mạng thiết bị sẵn sàng' : 'Không có kết nối mạng internet'}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isOnline ? 'Network Online' : 'Offline'}</span>
          </div>

          {/* IoT Code Generator button */}
          <button
            id="btn-iot-code"
            onClick={onOpenCodeSnippets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mã nguồn IoT (ESP32/C)</span>
          </button>

          {/* Knowledge Hub button */}
          <button
            id="btn-knowledge-hub"
            onClick={onOpenKnowledge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm shadow-cyan-900/40 transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kiến thức HTTP IoT</span>
          </button>

          {/* Reset button */}
          <button
            id="btn-reset-state"
            onClick={onReset}
            title="Làm mới cài đặt"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
