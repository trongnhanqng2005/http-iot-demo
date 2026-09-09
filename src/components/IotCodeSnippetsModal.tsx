import React from 'react';
import { X, Copy, Check, Terminal, Cpu, Layers } from 'lucide-react';
import { generateCodeSnippets } from '../utils/httpHelper';
import { RequestConfig } from '../types';

interface IotCodeSnippetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RequestConfig;
}

export const IotCodeSnippetsModal: React.FC<IotCodeSnippetsModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [activeTab, setActiveTab] = React.useState<'esp32' | 'micropython' | 'curl' | 'fetch'>('esp32');
  const [copied, setCopied] = React.useState<boolean>(false);

  if (!isOpen) return null;

  // Build headers & body
  const headersObj: Record<string, string> = {};
  for (const h of config.headers) {
    if (h.enabled && h.key) headersObj[h.key] = h.value;
  }
  if (!headersObj['Content-Type']) {
    headersObj['Content-Type'] = 'application/json';
  }

  let bodyStr = '';
  if (config.useCustomBody && config.customBodyJson) {
    bodyStr = config.customBodyJson;
  } else {
    bodyStr = JSON.stringify({
      username: config.username,
      password: config.password,
    });
  }

  const snippets = generateCodeSnippets(config.method, config.url, headersObj, bodyStr);

  const getCurrentSnippet = () => {
    switch (activeTab) {
      case 'esp32':
        return snippets.esp32Arduino;
      case 'micropython':
        return snippets.microPython;
      case 'curl':
        return snippets.curl;
      case 'fetch':
        return snippets.fetchJs;
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getCurrentSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Mã Nguồn Mẫu Cho Thiết Bị IoT (Ready to Flash)
              </h3>
              <p className="text-xs text-slate-400">
                Tự động sinh mã nguồn kết nối trực tiếp đến endpoint hiện tại của bạn
              </p>
            </div>
          </div>

          <button
            id="btn-close-snippets-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              id="tab-code-esp32"
              onClick={() => setActiveTab('esp32')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'esp32'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              ESP32 (Arduino C++)
            </button>
            <button
              id="tab-code-micropython"
              onClick={() => setActiveTab('micropython')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'micropython'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              MicroPython (ESP32/Pico)
            </button>
            <button
              id="tab-code-curl"
              onClick={() => setActiveTab('curl')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'curl'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              cURL (Terminal Linux/Mac)
            </button>
            <button
              id="tab-code-fetch"
              onClick={() => setActiveTab('fetch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'fetch'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Fetch API (Node.js/JS)
            </button>
          </div>

          <button
            id="btn-copy-code-snippet"
            onClick={copyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép mã!' : 'Sao chép Code'}</span>
          </button>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-950 font-mono text-xs text-emerald-300">
          <pre className="whitespace-pre leading-relaxed">{getCurrentSnippet()}</pre>
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            💡 <strong>Mẹo:</strong> Đoạn code trên đã bao gồm cài đặt Timeout và Headers tương ứng với thông số bạn đã chỉnh trong ứng dụng.
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
