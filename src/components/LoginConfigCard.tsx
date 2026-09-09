import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
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
  User,
  KeyRound,
  Layers,
  Terminal,
  Copy,
  Check,
  CornerDownLeft,
  Cpu,
  HelpCircle,
} from 'lucide-react';
import { HeaderPair, HttpMethod, HttpPreset, RequestConfig } from '../types';
import { ProtocolTooltip } from './ProtocolTooltip';

interface LoginConfigCardProps {
  config: RequestConfig;
  onChangeConfig: (newConfig: RequestConfig) => void;
  presets: HttpPreset[];
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onSendRequest: () => void;
  onAbortRequest: () => void;
  isLoading: boolean;
  stepByStepMode: boolean;
  onCopyToast: (text: string, title: string) => void;
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
  stepByStepMode,
  onCopyToast,
}) => {
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = React.useState<boolean>(false);
  const [autofillSuccess, setAutofillSuccess] = React.useState<boolean>(false);
  const [curlCopied, setCurlCopied] = React.useState<boolean>(false);

  // 3D Tilt State
  const shouldReduceMotion = useReducedMotion();
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = React.useState<{ rotateX: number; rotateY: number; glareX: number; glareY: number }>({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
  });
  const [isHovered, setIsHovered] = React.useState<boolean>(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Small, subtle angle (-2.5 to 2.5 deg) for a high-end feel without distorting usability
    const rotateX = ((y - centerY) / centerY) * -2.5;
    const rotateY = ((x - centerX) / centerX) * 2.5;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, glareX, glareY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  };

  const isHttps = config.url.trim().toLowerCase().startsWith('https://');
  const isHttp = config.url.trim().toLowerCase().startsWith('http://');

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeConfig({ ...config, url: e.target.value });
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeConfig({ ...config, method: e.target.value as HttpMethod });
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

  const handleAddHeader = (initialKey = '', initialVal = '') => {
    onChangeConfig({
      ...config,
      headers: [...config.headers, { key: initialKey, value: initialVal, enabled: true }],
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

  const handleToggleCustomBody = (useCustom: boolean) => {
    onChangeConfig({ ...config, useCustomBody: useCustom });
  };

  // Generate and copy cURL command
  const handleCopyAsCurl = () => {
    let bodyString = '';
    if (config.useCustomBody && config.customBodyJson) {
      bodyString = config.customBodyJson;
    } else {
      bodyString = JSON.stringify(
        { username: config.username, password: config.password },
        null,
        2
      );
    }

    let curl = `curl -X ${config.method} "${config.url}" \\\n`;
    config.headers
      .filter((h) => h.enabled && h.key)
      .forEach((h) => {
        curl += `  -H "${h.key}: ${h.value}" \\\n`;
      });
    if (config.method !== 'GET' && bodyString) {
      curl += `  -d '${bodyString.replace(/'/g, `'\\''`)}'`;
    }

    navigator.clipboard.writeText(curl.trim());
    setCurlCopied(true);
    onCopyToast(curl.trim(), 'Đã sao chép lệnh cURL vào clipboard!');
    setTimeout(() => setCurlCopied(false), 2200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSendRequest();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading) {
        onSendRequest();
      }
    }
  };

  const handleAutofillCredentials = (user: string, pass: string) => {
    onChangeConfig({
      ...config,
      username: user,
      password: pass,
    });
    setAutofillSuccess(true);
    setTimeout(() => setAutofillSuccess(false), 1500);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      style={{
        transform:
          !shouldReduceMotion && isHovered
            ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`
            : 'none',
        transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.3s ease-out',
      }}
      className="relative bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col transition-colors duration-200"
    >
      {/* 3D Glare Light Reflection (strictly pointer-events-none so text selection works flawlessly) */}
      {!shouldReduceMotion && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 320px at ${tilt.glareX}% ${tilt.glareY}%, rgba(6, 182, 212, 0.25), transparent 70%)`,
          }}
        />
      )}

      {/* Card Header & Preset Selector */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  IoT Client (Gửi HTTP Request)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  ESP32 / Node
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cấu hình thông tin xác thực, Endpoint & Payload gửi lên Cloud
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Advanced Toggle Button */}
            <button
              type="button"
              id="btn-toggle-advanced-config"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showAdvanced
                  ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-700 text-cyan-800 dark:text-cyan-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showAdvanced ? 'Đóng nâng cao' : 'Headers & Timeout'}</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-700 text-[10px] font-mono">
                {config.headers.filter((h) => h.enabled).length}
              </span>
            </button>
          </div>
        </div>

        {/* Preset Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Máy chủ:
          </span>
          {presets.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                id={`btn-preset-${preset.id}`}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className={`group px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30 font-semibold'
                    : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750'
                }`}
              >
                <span>{preset.name.split(' (')[0]}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {preset.tokenKey ? 'JWT' : 'API'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
        {/* URL Endpoint Configuration + Copy as cURL Button */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="input-server-url"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <span>Endpoint URL</span>
              <span className="text-rose-500">*</span>
            </label>

            <div className="flex items-center gap-2 text-xs">
              <ProtocolTooltip topicKey="TLS" active={stepByStepMode}>
                {isHttps ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>HTTPS (TLS Encrypted)</span>
                  </span>
                ) : isHttp ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>HTTP (Plaintext)</span>
                  </span>
                ) : null}
              </ProtocolTooltip>

              {/* Nút "Copy as cURL" đặt cạnh URL request theo yêu cầu */}
              <button
                type="button"
                id="btn-copy-curl"
                onClick={handleCopyAsCurl}
                title="Sao chép toàn bộ request này thành lệnh cURL"
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                {curlCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-500 font-bold">Đã chép cURL</span>
                  </>
                ) : (
                  <>
                    <Terminal className="w-3 h-3 text-cyan-500" />
                    <span>Copy as cURL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="relative flex rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
            <ProtocolTooltip topicKey={config.method} active={stepByStepMode}>
              <select
                value={config.method}
                onChange={handleMethodChange}
                className="h-full bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 font-mono text-xs font-bold px-3 py-2 border-r border-slate-300 dark:border-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
              </select>
            </ProtocolTooltip>

            <input
              id="input-server-url"
              type="text"
              value={config.url}
              onChange={handleUrlChange}
              placeholder="https://api.example.com/api/v1/auth/login"
              required
              className="w-full px-3 py-2 text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-100 bg-transparent placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            💡 URL endpoint mà vi điều khiển IoT kết nối để gửi payload chứng thực.
          </p>
        </div>

        {/* Payload Selector: Form vs Custom Body JSON */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Nội Dung Gói Tin (Payload)</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => handleToggleCustomBody(false)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                !config.useCustomBody
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Form Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => handleToggleCustomBody(true)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                config.useCustomBody
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              JSON Tùy Biến
            </button>
          </div>
        </div>

        {/* Form Credentials */}
        {!config.useCustomBody ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Username Input */}
              <div>
                <label
                  htmlFor="input-username"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Tài khoản (Client ID) <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
                  <div className="pl-3 pr-1 text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="input-username"
                    type="text"
                    value={config.username}
                    onChange={handleUsernameChange}
                    placeholder="e.g. emilys hoặc device_01"
                    required
                    className="w-full px-2.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-transparent placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="input-password"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Mật khẩu (Secret Key) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    id="btn-toggle-password-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Ẩn' : 'Hiện'}</span>
                  </button>
                </div>
                <div className="relative flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
                  <div className="pl-3 pr-1 text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="input-password"
                    type={showPassword ? 'text' : 'password'}
                    value={config.password}
                    onChange={handlePasswordChange}
                    placeholder="e.g. emilyspass"
                    required
                    className="w-full px-2.5 py-2 pr-8 text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-transparent placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick Demo Autofill Hint Pill */}
            {selectedPresetId === 'dummyjson' && (
              <div className="p-3 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span>
                    Tài khoản mẫu: <strong className="font-mono text-cyan-800 dark:text-cyan-200">emilys</strong> / <strong className="font-mono text-cyan-800 dark:text-cyan-200">emilyspass</strong> (Nhận JWT 60 phút).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAutofillCredentials('emilys', 'emilyspass')}
                  className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700 text-xs font-semibold transition cursor-pointer"
                >
                  {autofillSuccess ? '✓ Đã điền mẫu' : 'Nạp mẫu này'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="input-custom-body"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Payload JSON Body Tùy Biến
              </label>
              <ProtocolTooltip topicKey="Content-Type" active={stepByStepMode}>
                <span className="text-[11px] text-cyan-700 dark:text-cyan-400 font-mono">
                  Content-Type: application/json
                </span>
              </ProtocolTooltip>
            </div>
            <textarea
              id="input-custom-body"
              rows={4}
              value={config.customBodyJson || ''}
              onChange={handleCustomBodyChange}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition"
              placeholder={`{\n  "username": "...",\n  "password": "..."\n}`}
            />
          </div>
        )}

        {/* Advanced Accordion: Headers & Timeout */}
        {showAdvanced && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            {/* Headers Configuration */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  HTTP Request Headers ({config.headers.filter((h) => h.enabled).length} kích hoạt)
                </span>
                <div className="flex items-center gap-1.5">
                  <ProtocolTooltip topicKey="X-Device-Id" active={stepByStepMode}>
                    <button
                      type="button"
                      onClick={() => handleAddHeader('X-Device-Id', 'ESP32-NODE-01')}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono transition cursor-pointer"
                    >
                      + X-Device-Id
                    </button>
                  </ProtocolTooltip>
                  <button
                    type="button"
                    id="btn-add-header"
                    onClick={() => handleAddHeader('', '')}
                    className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold px-2 py-0.5 rounded cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm dòng</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {config.headers.map((header, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`checkbox-header-enable-${idx}`}
                      checked={header.enabled}
                      onChange={(e) => handleHeaderChange(idx, 'enabled', e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                    <ProtocolTooltip topicKey={header.key} active={stepByStepMode}>
                      <input
                        type="text"
                        id={`input-header-key-${idx}`}
                        value={header.key}
                        onChange={(e) => handleHeaderChange(idx, 'key', e.target.value)}
                        placeholder="Header Key (e.g. Content-Type)"
                        className="w-32 sm:w-40 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
                      />
                    </ProtocolTooltip>
                    <input
                      type="text"
                      id={`input-header-val-${idx}`}
                      value={header.value}
                      onChange={(e) => handleHeaderChange(idx, 'value', e.target.value)}
                      placeholder="Header Value"
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      id={`btn-remove-header-${idx}`}
                      onClick={() => handleRemoveHeader(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                      title="Xóa Header"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeout Slider for IoT */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Request Timeout (Giới hạn chờ mạng IoT)</span>
                </span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/40">
                  {config.timeoutMs / 1000}s ({config.timeoutMs} ms)
                </span>
              </div>
              <input
                id="slider-request-timeout"
                type="range"
                min={1000}
                max={15000}
                step={500}
                value={config.timeoutMs}
                onChange={handleTimeoutChange}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>1s (Rất gấp)</span>
                <span className="text-emerald-600 font-semibold">3s - 5s (Chuẩn IoT ESP32)</span>
                <span>15s (Tối đa)</span>
              </div>
            </div>
          </div>
        )}

        {/* Nút bấm chính với Hiệu ứng nhấn 3D (Depth Press) & Shadow phát sáng */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            id="btn-submit-login"
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all cursor-pointer select-none ${
              isLoading
                ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed text-slate-200'
                : 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_6px_20px_rgba(6,182,212,0.4)] hover:shadow-[0_8px_25px_rgba(6,182,212,0.6)] active:translate-y-1 active:shadow-[0_2px_10px_rgba(6,182,212,0.3)] focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang truyền qua Network Pipe...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi HTTP POST Request</span>
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[11px] opacity-80 font-mono px-1.5 py-0.5 rounded bg-black/25">
                  <CornerDownLeft className="w-3 h-3" /> Ctrl+Enter
                </span>
              </>
            )}
          </button>

          {isLoading && (
            <button
              type="button"
              id="btn-abort-request"
              onClick={onAbortRequest}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition cursor-pointer"
              title="Hủy request ngay lập tức (Abort)"
            >
              <StopCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Hủy (Abort)</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
