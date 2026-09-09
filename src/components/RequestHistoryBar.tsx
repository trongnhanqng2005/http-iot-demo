import React from 'react';
import { HistoryItem } from '../types';
import { History, CheckCircle2, AlertTriangle, XCircle, Clock, Trash2, ArrowUpRight } from 'lucide-react';

interface RequestHistoryBarProps {
  history: HistoryItem[];
  currentSelectedId: string | null;
  onSelectHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const RequestHistoryBar: React.FC<RequestHistoryBarProps> = ({
  history,
  currentSelectedId,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  if (history.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-2xs transition-colors duration-200">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
            Lịch Sử Gửi Yêu Cầu ({history.length} lượt gần nhất)
          </h4>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-[11px] text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 transition cursor-pointer"
          title="Xóa toàn bộ lịch sử gửi"
        >
          <Trash2 className="w-3 h-3" />
          <span>Xóa lịch sử</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {history.map((item) => {
          const isSelected = currentSelectedId === item.id;
          const is2xx = item.status >= 200 && item.status < 300;
          const is4xx = item.status >= 400 && item.status < 500;
          const isFail = item.isError || item.status === 0 || item.status >= 500;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectHistoryItem(item)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer border ${
                isSelected
                  ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-400 dark:border-cyan-600 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300'
              }`}
            >
              {is2xx ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : is4xx ? (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              )}

              <span className="font-bold text-slate-900 dark:text-slate-100">
                {item.method}
              </span>

              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  is2xx
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : is4xx
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                }`}
              >
                {item.status > 0 ? item.status : 'ERR'}
              </span>

              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {item.durationMs}ms
              </span>

              <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                {item.timestamp}
              </span>

              <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-60" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
