import React from 'react';
import { BookOpen, Code2, Wifi, WifiOff, RefreshCw, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();

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
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-4 lg:px-8 py-3.5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-mono font-bold text-sm shadow-xs transition-transform hover:scale-105">
            HTTP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                HTTP & IoT Auth Lab
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Pro Max UI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              Vòng đời HTTP POST & Xác thực Bearer Token cho Lập trình viên IoT
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-400'
            }`}
            title={isOnline ? 'Mạng thiết bị sẵn sàng' : 'Không có kết nối mạng internet'}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isOnline ? 'Network Online' : 'Offline'}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            id="btn-toggle-theme"
            onClick={toggleTheme}
            type="button"
            aria-label={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Giao diện Sáng</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Giao diện Tối</span>
              </>
            )}
          </button>

          {/* IoT Code Generator button */}
          <button
            id="btn-iot-code"
            onClick={onOpenCodeSnippets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Mã nguồn IoT</span>
          </button>

          {/* Knowledge Hub button */}
          <button
            id="btn-knowledge-hub"
            onClick={onOpenKnowledge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm shadow-cyan-900/40 transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kiến thức</span>
          </button>

          {/* Reset button */}
          <button
            id="btn-reset-state"
            onClick={onReset}
            title="Làm mới cài đặt"
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

