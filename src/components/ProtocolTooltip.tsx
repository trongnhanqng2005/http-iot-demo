import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Shield, Info } from 'lucide-react';
import { PROTOCOL_TOOLTIPS, ProtocolItemExplanation } from '../data/protocolExplanations';

interface ProtocolTooltipProps {
  topicKey: string;
  active: boolean; // whether step-by-step mode is on
  children: React.ReactNode;
}

export const ProtocolTooltip: React.FC<ProtocolTooltipProps> = ({
  topicKey,
  active,
  children,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const info: ProtocolItemExplanation | undefined = PROTOCOL_TOOLTIPS[topicKey];

  if (!active || !info) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className="relative cursor-help underline decoration-cyan-500/50 decoration-dotted underline-offset-4">
        {children}
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 p-3 bg-slate-950/95 text-slate-100 border border-cyan-500/40 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none text-left"
          >
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold font-mono mb-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{info.title}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug mb-1.5">
              {info.role}
            </p>
            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-cyan-300/90 leading-normal font-mono">
              <span className="text-amber-400 font-bold">Góc nhìn IoT: </span>
              {info.iotContext}
            </div>
            {info.securityNote && (
              <div className="mt-1 text-[10px] text-emerald-400 font-mono flex items-start gap-1">
                <Shield className="w-3 h-3 shrink-0 mt-0.5" />
                <span>{info.securityNote}</span>
              </div>
            )}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950/95" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
