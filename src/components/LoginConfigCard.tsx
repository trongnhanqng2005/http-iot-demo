import React from 'react';
import {
  Send,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  StopCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { HeaderPair, HttpMethod, HttpPreset, RequestConfig } from '../types';

interface LoginConfigCardProps {
  config: RequestConfig;
  onChangeConfig: (newConfig: RequestConfig) => void;
  presets: HttpPreset[];
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onSendRequest: () => void;
  onAbortRequest: () => void;
  isLoading: boolean;
}

export const LoginConfigCard: React.FC<LoginConfigCardProps> = ({
  config,
  onChangeConfig,
  presets,
  selectedPresetId,
  onSelectPreset,
  onSendRequest,
  onAbortRequest,
  isLoading,
}) => {
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = React.useState<boolean>(false);

  const isHttps = config.url.trim().toLowerCase().startsWith('https://');
  const isHttp = config.url.trim().toLowerCase().startsWith('http://');

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeConfig({ ...config, url: e.target.value });
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeConfig({ ...config, username: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeConfig({ ...config, password: e.target.value });
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value' | 'enabled', val: any) => {
    const updated = [...config.headers];
    updated[index] = { ...updated[index], [field]: val };
    onChangeConfig({ ...config, headers: updated });
  };

  const handleAddHeader = () => {
    onChangeConfig({
      ...config,
      headers: [...config.headers, { key: '', value: '', enabled: true }],
    });
  };

  const handleRemoveHeader = (index: number) => {
    const updated = config.headers.filter((_, i) => i !== index);
    onChangeConfig({ ...config, headers: updated });
  };

  const handleTimeoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeConfig({ ...config, timeoutMs: Number(e.target.value) });
  };

  const handleCustomBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChangeConfig({ ...config, customBodyJson: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSendRequest();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg shadow-black/20 overflow-hidden">
      {/* Card Header & Preset Selector */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Màn Hình Đăng Nhập & Cấu Hình Endpoint</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chọn máy chủ xác thực mẫu hoặc nhập URL server API IoT thật của bạn
            </p>
          </div>

          <button
            type="button"
            id="btn-toggle-advanced-config"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition ${
              showAdvanced
                ? 'bg-cyan-950/60 border-cyan-700 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showAdvanced ? 'Thu gọn tùy chọn' : 'Tùy chọn Headers & Timeout'}</span>
          </button>
        </div>

        {/* Preset Pills */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              id={`btn-preset-${preset.id}`}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                selectedPresetId === preset.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
              }`}
            >
              <span>{preset.name.split(' (')[0]}</span>
              {selectedPresetId === preset.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
        {/* URL Endpoint Configuration */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="input-server-url" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>URL Máy chủ Xác thực (Endpoint URL)</span>
              <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-1.5 text-xs">
              {isHttps ? (
                <span
                  title="HTTPS: Có mã hóa TLS/SSL, an toàn cho mật khẩu và token."
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>HTTPS (TLS Encrypted)</span>
                </span>
              ) : isHttp ? (
                <span
                  title="HTTP: Dữ liệu truyền ở dạng bản rõ (plaintext), mật khẩu có thể bị nhìn trộm."
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"
                >
                  <ShieldAlert className="w-3 h-3" />
                  <span>HTTP (Plaintext Không Mã Hóa)</span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="relative flex rounded-lg overflow-hidden border border-slate-700 bg-slate-950 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition">
            <div className="flex items-center px-3 bg-slate-800/90 text-cyan-400 font-mono text-xs font-bold border-r border-slate-700 select-none">
              POST
            </div>
            <input
              id="input-server-url"
              type="text"
              value={config.url}
              onChange={handleUrlChange}
              placeholder="https://api.example.com/api/v1/login"
              required
              className="w-full px-3 py-2 text-xs sm:text-sm font-mono text-slate-100 bg-transparent placeholder:text-slate-600 focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Bạn có thể tùy chỉnh URL server thật (Node.js, Flask, Spring, ESP32 web server...) để kiểm thử trực tiếp.
          </p>
        </div>

        {/* Login Credentials Form */}
        {!config.useCustomBody ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Username */}
            <div>
              <label htmlFor="input-username" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tên đăng nhập (Username / Identifier) <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-username"
                type="text"
                value={config.username}
                onChange={handleUsernameChange}
                placeholder="Nhập username..."
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none transition"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-password" className="text-xs font-semibold text-slate-300">
                  Mật khẩu (Password) <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  id="btn-toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Ẩn' : 'Hiện'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  value={config.password}
                  onChange={handlePasswordChange}
                  placeholder="Nhập mật khẩu..."
                  required
                  className="w-full px-3 py-2 pr-10 rounded-lg bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="input-custom-body" className="text-xs font-semibold text-slate-300">
                Payload Body JSON Tùy Biến
              </label>
              <span className="text-[11px] text-cyan-400 font-mono">Content-Type: application/json</span>
            </div>
            <textarea
              id="input-custom-body"
              rows={4}
              value={config.customBodyJson || ''}
              onChange={handleCustomBodyChange}
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none transition"
            />
          </div>
        )}

        {/* Quick Demo Fill Notification */}
        {selectedPresetId === 'dummyjson' && (
          <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-slate-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-cyan-300">Tài khoản thử nghiệm DummyJSON:</span>{' '}
              Username: <code className="text-cyan-200 bg-slate-900 px-1 py-0.5 rounded font-mono">emilys</code> | Mật khẩu:{' '}
              <code className="text-cyan-200 bg-slate-900 px-1 py-0.5 rounded font-mono">emilyspass</code>. Trả về JWT thật có hạn 60 phút.
            </div>
          </div>
        )}

        {/* Advanced Accordion: Headers & Timeout */}
        {showAdvanced && (
          <div className="pt-3 border-t border-slate-800/80 space-y-4">
            {/* Headers Configuration */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  HTTP Request Headers ({config.headers.filter(h => h.enabled).length} đang kích hoạt)
                </span>
                <button
                  type="button"
                  id="btn-add-header"
                  onClick={handleAddHeader}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Header</span>
                </button>
              </div>

              <div className="space-y-2">
                {config.headers.map((header, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`checkbox-header-enable-${idx}`}
                      checked={header.enabled}
                      onChange={(e) => handleHeaderChange(idx, 'enabled', e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                    />
                    <input
                      type="text"
                      id={`input-header-key-${idx}`}
                      value={header.key}
                      onChange={(e) => handleHeaderChange(idx, 'key', e.target.value)}
                      placeholder="Header Key (e.g. Content-Type)"
                      className="w-1/3 px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      id={`input-header-val-${idx}`}
                      value={header.value}
                      onChange={(e) => handleHeaderChange(idx, 'value', e.target.value)}
                      placeholder="Header Value (e.g. application/json)"
                      className="flex-1 px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      id={`btn-remove-header-${idx}`}
                      onClick={() => handleRemoveHeader(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                      title="Xóa Header"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeout Slider for IoT */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Thời gian chờ phản hồi (Request Timeout): {config.timeoutMs / 1000}s</span>
                </span>
                <span className="font-mono text-amber-400 font-medium">{config.timeoutMs} ms</span>
              </div>
              <input
                id="slider-request-timeout"
                type="range"
                min={1000}
                max={15000}
                step={500}
                value={config.timeoutMs}
                onChange={handleTimeoutChange}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Trong IoT, luôn cần đặt timeout (thường từ 3s - 10s). Nếu server bị treo hoặc mạng rớt, vi điều khiển sẽ tự ngắt kết nối thay vì bị đứng (hang) làm cạn pin hoặc kích hoạt Hardware Watchdog Reset.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            id="btn-submit-login"
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-xs sm:text-sm text-white transition shadow-md ${
              isLoading
                ? 'bg-slate-700 cursor-not-allowed text-slate-300'
                : 'bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 shadow-cyan-950'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang gửi Request HTTP POST...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Đăng Nhập (Gửi HTTP POST Request)</span>
              </>
            )}
          </button>

          {isLoading && (
            <button
              type="button"
              id="btn-abort-request"
              onClick={onAbortRequest}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800 transition"
              title="Hủy request ngay lập tức (Abort)"
            >
              <StopCircle className="w-4 h-4 text-rose-400" />
              <span>Hủy (Abort)</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
