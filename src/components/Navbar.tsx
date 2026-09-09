import React from 'react';
import {
  BookOpen,
  Code2,
  Wifi,
  WifiOff,
  RefreshCw,
  Sun,
  Moon,
  Clock,
  Volume2,
  VolumeX,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Activity,
  Cpu,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onOpenKnowledge: () => void;
  onOpenCodeSnippets: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  stepByStepMode: boolean;
  onToggleStepByStep: () => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenKnowledge,
  onOpenCodeSnippets,
  onOpenHistory,
  historyCount,
  stepByStepMode,
  onToggleStepByStep,
  isSoundMuted,
  onToggleSound,
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
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm shadow-md shadow-cyan-950/50 transition-transform hover:scale-105">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                HTTP & IoT Auth Lab
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <span>Cyberpunk-Lite UI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              Phân tích Giao thức HTTP & Xác thực Bearer Token cho Thiết bị IoT
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Step-by-Step Explanation Toggle Switch */}
          <button
            type="button"
            id="btn-toggle-step-by-step"
            onClick={onToggleStepByStep}
            title={
              stepByStepMode
                ? 'Đang bật: Hover vào Method/Headers để xem giải thích chi tiết'
                : 'Bật chế độ giải thích từng bước (Tooltips giao thức)'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              stepByStepMode
                ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-700 dark:text-cyan-300 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {stepByStepMode ? (
              <ToggleRight className="w-4 h-4 text-cyan-500" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-slate-400" />
            )}
            <span className="hidden md:inline">Giải thích từng bước</span>
            <span className="md:hidden">Giải thích</span>
          </button>

          {/* Sound Effect Toggle (Default MUTED) */}
          <button
            type="button"
            id="btn-toggle-sound"
            onClick={onToggleSound}
            aria-label={isSoundMuted ? 'Bật âm thanh phản hồi' : 'Tắt âm thanh'}
            title={
              isSoundMuted
                ? 'Âm thanh phản hồi đang TẮT (Click để bật Web Audio)'
                : 'Âm thanh phản hồi đang BẬT'
            }
            className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              !isSoundMuted
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {!isSoundMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* History Drawer Trigger Button */}
          <button
            type="button"
            id="btn-open-history-drawer"
            onClick={onOpenHistory}
            title="Mở ngăn kéo lịch sử yêu cầu"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer relative"
          >
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Lịch sử</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-cyan-600 text-white">
                {historyCount}
              </span>
            )}
          </button>

          {/* Online Network Indicator */}
          <div
            className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-400'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            id="btn-toggle-theme"
            onClick={toggleTheme}
            type="button"
            aria-label={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* IoT Code Generator button */}
          <button
            id="btn-iot-code"
            onClick={onOpenCodeSnippets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Code IoT</span>
          </button>

          {/* Knowledge Hub button */}
          <button
            id="btn-knowledge-hub"
            onClick={onOpenKnowledge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm shadow-cyan-900/40 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kiến thức</span>
          </button>

          {/* Reset button */}
          <button
            id="btn-reset-state"
            onClick={onReset}
            title="Làm mới cài đặt"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
