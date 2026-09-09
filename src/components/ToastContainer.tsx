import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { ToastNotification } from '../types';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3 sm:px-0">
      <AnimatePresence>
        {toasts.map((t) => {
          const isError = t.type === 'error';
          const isSuccess = t.type === 'success';
          const isWarning = t.type === 'warning';
          const duration = t.durationMs || 3500;

          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.92 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                x: isError ? [0, -6, 6, -4, 4, 0] : 0,
              }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              transition={{
                duration: 0.25,
                x: isError ? { duration: 0.35, ease: 'easeInOut' } : undefined,
              }}
              className={`pointer-events-auto relative overflow-hidden rounded-xl border p-3.5 shadow-xl backdrop-blur-md transition-all ${
                isSuccess
                  ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40'
                  : isError
                  ? 'bg-slate-900/95 border-rose-500/40 text-rose-100 shadow-rose-950/40'
                  : isWarning
                  ? 'bg-slate-900/95 border-amber-500/40 text-amber-100 shadow-amber-950/40'
                  : 'bg-slate-900/95 border-cyan-500/40 text-cyan-100 shadow-cyan-950/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isError && <XCircle className="w-4 h-4 text-rose-400" />}
                  {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-cyan-400" />}
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="text-xs font-bold tracking-tight text-white">{t.title}</h4>
                  {t.message && (
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed break-words font-mono">
                      {t.message}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onDismiss(t.id)}
                  className="shrink-0 p-1 text-slate-400 hover:text-white rounded-md transition cursor-pointer"
                  title="Đóng thông báo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress Bar Countdown */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-0.5 ${
                  isSuccess
                    ? 'bg-emerald-400'
                    : isError
                    ? 'bg-rose-400'
                    : isWarning
                    ? 'bg-amber-400'
                    : 'bg-cyan-400'
                }`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
