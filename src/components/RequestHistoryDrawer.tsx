import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  History,
  X,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Clock,
  Key,
  Database,
  ExternalLink,
} from 'lucide-react';
import { HistoryItem } from '../types';

interface RequestHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  selectedId: string | null;
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const RequestHistoryDrawer: React.FC<RequestHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  selectedId,
  onSelect,
  onClear,
}) => {
  const [filter, setFilter] = React.useState<'all' | 'success' | 'error'>('all');

  const filteredHistory = history.filter((item) => {
    if (filter === 'success') return item.status >= 200 && item.status < 300;
    if (filter === 'error') return item.isError || item.status >= 400 || item.status === 0;
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Container */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[440px] bg-slate-950/95 text-slate-100 border-l border-cyan-500/20 shadow-2xl backdrop-blur-xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between gap-3 bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Lịch Sử Giao Tiếp HTTP</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {history.length}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Nhấp vào mục để phục hồi payload và phản hồi vào inspector
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={onClear}
                    title="Xóa toàn bộ lịch sử"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-2.5 border-b border-slate-800/60 flex items-center gap-2 text-xs bg-slate-950">
              <span className="text-[11px] text-slate-500 font-mono">Lọc:</span>
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                  filter === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tất cả ({history.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('success')}
                className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                  filter === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2xx OK
              </button>
              <button
                type="button"
                onClick={() => setFilter('error')}
                className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                  filter === 'error'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Lỗi / 4xx / 5xx
              </button>
            </div>

            {/* History List Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Clock className="w-10 h-10 mb-3 text-slate-600 opacity-60 stroke-1" />
                  <p className="text-xs font-medium text-slate-400">Chưa có lịch sử yêu cầu nào.</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-[240px]">
                    Các lần gửi HTTP POST/GET sẽ được lưu tự động để bạn dễ dàng so sánh kết quả.
                  </p>
                </div>
              ) : (
                filteredHistory.map((item) => {
                  const isSelected = selectedId === item.id;
                  const is2xx = item.status >= 200 && item.status < 300;
                  const is4xx = item.status >= 400 && item.status < 500;
                  const hasToken = !!item.tokenInfo;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelect(item);
                        onClose();
                      }}
                      className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400/80 shadow-lg shadow-cyan-950/50'
                          : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Top line: Method, Status, Latency */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                              item.method === 'GET'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            }`}
                          >
                            {item.method}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1 ${
                              is2xx
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : is4xx
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {is2xx ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : is4xx ? (
                              <AlertTriangle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            <span>{item.status > 0 ? `HTTP ${item.status}` : 'NET_FAIL'}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                          <span className="text-cyan-400 font-semibold">{item.durationMs}ms</span>
                          <span className="text-slate-500">{item.timestamp}</span>
                        </div>
                      </div>

                      {/* URL */}
                      <div className="text-xs font-mono text-slate-300 truncate mb-2">
                        {item.url}
                      </div>

                      {/* Metadata badges */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                        <div className="flex items-center gap-2">
                          {hasToken && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                              <Key className="w-2.5 h-2.5" />
                              <span>{item.tokenInfo?.tokenType}</span>
                            </span>
                          )}
                          <span className="text-slate-400">
                            {new TextEncoder().encode(item.response.bodyText || '').length} Bytes
                          </span>
                        </div>

                        <span className="text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 text-[11px]">
                          <span>Xem lại</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
