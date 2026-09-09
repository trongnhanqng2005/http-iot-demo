import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Zap,
  Activity,
  Server,
  Cpu,
  Wifi,
} from 'lucide-react';
import { ResponseLog } from '../types';

interface NetworkPipeConnectorProps {
  isLoading: boolean;
  response: ResponseLog | null;
  isHttps: boolean;
  method: string;
}

export const NetworkPipeConnector: React.FC<NetworkPipeConnectorProps> = ({
  isLoading,
  response,
  isHttps,
  method,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [returnPacket, setReturnPacket] = React.useState<boolean>(false);
  const [returnColor, setReturnColor] = React.useState<'emerald' | 'rose'>('emerald');

  // Trigger return packet when response changes from loading
  const prevLoadingRef = React.useRef(isLoading);
  React.useEffect(() => {
    if (prevLoadingRef.current && !isLoading && response) {
      const isSuccess = response.status >= 200 && response.status < 300;
      setReturnColor(isSuccess ? 'emerald' : 'rose');
      setReturnPacket(true);
      const timer = setTimeout(() => setReturnPacket(false), 1400);
      return () => clearTimeout(timer);
    }
    prevLoadingRef.current = isLoading;
  }, [isLoading, response]);

  return (
    <div className="w-full my-3 lg:my-0 flex flex-col items-center justify-center relative select-none">
      {/* ================= DESKTOP VIEW (Large screens) ================= */}
      <div className="hidden lg:flex flex-col items-center justify-center w-full px-2 py-4">
        {/* Node Labels & Status Info */}
        <div className="w-full flex items-center justify-between text-[11px] font-mono mb-2 px-1 text-slate-400">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Cpu className="w-3.5 h-3.5" />
            <span className="font-semibold tracking-wider">CLIENT (IoT)</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isHttps
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isHttps ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
              <span>{isHttps ? 'TLS Encrypted' : 'Plaintext HTTP'}</span>
            </span>

            {response && (
              <span className="text-cyan-400 font-bold">
                RTT: {response.durationMs}ms
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="font-semibold tracking-wider">SERVER (Cloud)</span>
            <Server className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* SVG Pipeline Track */}
        <div className="relative w-full h-14 flex items-center justify-center">
          {/* Background Bus Line */}
          <div className="absolute inset-x-0 h-1.5 bg-slate-800/90 dark:bg-slate-900 rounded-full border border-slate-700/60 overflow-hidden shadow-inner">
            {/* Grid dashes */}
            <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(90deg,#06b6d4,#06b6d4_6px,transparent_6px,transparent_14px)]" />

            {/* Scanning Laser Beam during loading */}
            {isLoading && !shouldReduceMotion && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  ease: 'easeInOut',
                }}
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-xs"
              />
            )}
          </div>

          {/* Left Node Anchor (Client) */}
          <div className="absolute left-0 w-6 h-6 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center z-10 shadow-md shadow-cyan-500/40">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-cyan-400 animate-ping' : 'bg-cyan-400'}`} />
          </div>

          {/* Center Protocol Badge */}
          <div className="relative z-10 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-mono font-semibold text-cyan-300 shadow-lg backdrop-blur-md flex items-center gap-1.5">
            <Activity className={`w-3.5 h-3.5 ${isLoading ? 'text-cyan-400 animate-spin' : 'text-slate-400'}`} />
            <span>{isLoading ? 'Đang truyền...' : `${method} / TCP Pipeline`}</span>
          </div>

          {/* Right Node Anchor (Server) */}
          <div
            className={`absolute right-0 w-6 h-6 rounded-full bg-slate-900 border-2 z-10 shadow-md transition-colors ${
              response?.isError
                ? 'border-rose-400 shadow-rose-500/40'
                : response
                ? 'border-emerald-400 shadow-emerald-500/40'
                : 'border-slate-700'
            } flex items-center justify-center`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                response?.isError ? 'bg-rose-400' : response ? 'bg-emerald-400' : 'bg-slate-600'
              }`}
            />
          </div>

          {/* 1. FORWARD PACKET: Client -> Server */}
          {isLoading && !shouldReduceMotion && (
            <motion.div
              initial={{ left: '3%', opacity: 0 }}
              animate={{
                left: ['3%', '94%'],
                opacity: [0, 1, 1, 0],
                scale: [0.8, 1.3, 1, 0.8],
              }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute z-20 pointer-events-none flex items-center"
            >
              <div className="w-4 h-4 rounded-full bg-cyan-300 shadow-[0_0_15px_#22d3ee] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <div className="w-8 h-1 bg-gradient-to-r from-cyan-400 to-transparent -ml-2 rounded-full opacity-70" />
            </motion.div>
          )}

          {/* 2. BACKWARD PACKET: Server -> Client */}
          {returnPacket && !shouldReduceMotion && (
            <motion.div
              initial={{ left: '94%', opacity: 0 }}
              animate={{
                left: ['94%', '4%'],
                opacity: [0, 1, 1, 0],
                scale: [0.9, 1.4, 1.1, 0.9],
              }}
              transition={{
                duration: 0.85,
                ease: 'easeOut',
              }}
              className="absolute z-20 pointer-events-none flex items-center flex-row-reverse"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  returnColor === 'emerald'
                    ? 'bg-emerald-400 shadow-[0_0_18px_#34d399]'
                    : 'bg-rose-500 shadow-[0_0_18px_#f43f5e]'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div
                className={`w-10 h-1.5 bg-gradient-to-l -mr-2 rounded-full opacity-80 ${
                  returnColor === 'emerald' ? 'from-emerald-400 to-transparent' : 'from-rose-400 to-transparent'
                }`}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* ================= MOBILE VIEW (< 1024px) ================= */}
      <div className="lg:hidden w-full px-1 py-2">
        <div className="relative p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md backdrop-blur-md overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Cpu className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">IoT Client</span>
            </div>

            {/* State Pill */}
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isLoading
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : response?.isError
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : response
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>Sending Packet...</span>
                  </>
                ) : response ? (
                  <span>HTTP {response.status} ({response.durationMs}ms)</span>
                ) : (
                  <span>Ready</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="text-[11px] font-bold">Cloud Server</span>
              <Server className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pulse Bar track */}
          <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/80">
            {isLoading && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              />
            )}
            {!isLoading && response && (
              <div
                className={`w-full h-full ${
                  response.isError ? 'bg-rose-500/60' : 'bg-emerald-500/60'
                }`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
