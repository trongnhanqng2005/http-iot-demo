/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Navbar } from './components/Navbar';
import { LoginConfigCard } from './components/LoginConfigCard';
import { ServerResponsePanel } from './components/ServerResponsePanel';
import { NetworkPipeConnector } from './components/NetworkPipeConnector';
import { HttpLifecycleViewer } from './components/HttpLifecycleViewer';
import { RequestHistoryDrawer } from './components/RequestHistoryDrawer';
import { ToastContainer } from './components/ToastContainer';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal';
import { IotCodeSnippetsModal } from './components/IotCodeSnippetsModal';
import { HTTP_PRESETS } from './data/presets';
import {
  AuthTokenInfo,
  HeaderPair,
  HistoryItem,
  RequestConfig,
  RequestLog,
  ResponseLog,
  ToastNotification,
} from './types';
import {
  generateRawHttpWire,
  headersArrayToRecord,
  inspectToken,
  maskJsonPasswords,
} from './utils/httpHelper';
import { soundManager } from './utils/soundEffects';
import {
  BookOpen,
  Code2,
  HelpCircle,
  Radio,
  ShieldCheck,
  Zap,
  Layers,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function App() {
  // Preset selection
  const [selectedPresetId, setSelectedPresetId] = React.useState<string>('dummyjson');

  // Request Configuration State
  const defaultPreset = HTTP_PRESETS[0];
  const [config, setConfig] = React.useState<RequestConfig>({
    url: defaultPreset.url,
    method: defaultPreset.method,
    headers: defaultPreset.headers,
    username: defaultPreset.defaultUsername,
    password: defaultPreset.defaultPassword,
    customBodyJson: defaultPreset.customBodyJson,
    useCustomBody: defaultPreset.useCustomBody,
    timeoutMs: 5000, // 5s standard IoT timeout
  });

  // Logs & Result State
  const [requestLog, setRequestLog] = React.useState<RequestLog | null>(null);
  const [responseLog, setResponseLog] = React.useState<ResponseLog | null>(null);
  const [tokenInfo, setTokenInfo] = React.useState<AuthTokenInfo | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Request History State
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = React.useState<string | null>(null);

  // Interactive UI Polish States
  const [historyDrawerOpen, setHistoryDrawerOpen] = React.useState<boolean>(false);
  const [toasts, setToasts] = React.useState<ToastNotification[]>([]);
  const [stepByStepMode, setStepByStepMode] = React.useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = React.useState<boolean>(soundManager.getIsMuted());
  const [showLifecycleSection, setShowLifecycleSection] = React.useState<boolean>(true);

  // Modals
  const [knowledgeModalOpen, setKnowledgeModalOpen] = React.useState<boolean>(false);
  const [knowledgeInitialTopic, setKnowledgeInitialTopic] = React.useState<string | undefined>(undefined);
  const [snippetsModalOpen, setSnippetsModalOpen] = React.useState<boolean>(false);

  // Abort controller ref for in-flight requests
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Toast Helper
  const showToast = (
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    message?: string
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message, durationMs: 3800 }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sound Toggle Helper
  const handleToggleSound = () => {
    const newMuted = !isSoundMuted;
    soundManager.setMuted(newMuted);
    setIsSoundMuted(newMuted);
    showToast(
      'info',
      newMuted ? 'Đã tắt âm thanh' : 'Đã bật âm thanh phản hồi',
      newMuted
        ? 'Chế độ im lặng (Silent)'
        : 'Web Audio API đã sẵn sàng phát tín hiệu âm thanh mạng.'
    );
  };

  // Step-by-Step Toggle Helper
  const handleToggleStepByStep = () => {
    const next = !stepByStepMode;
    setStepByStepMode(next);
    showToast(
      'info',
      next ? 'Chế độ Giải thích: ĐANG BẬT' : 'Chế độ Giải thích: ĐÃ TẮT',
      next
        ? 'Rê chuột vào Method, Header hoặc TLS để xem chú giải chi tiết'
        : 'Đã ẩn các chú giải giao thức'
    );
  };

  // Switch presets
  const handleSelectPreset = (presetId: string) => {
    const preset = HTTP_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(presetId);
    setConfig({
      url: preset.url,
      method: preset.method,
      headers: [...preset.headers],
      username: preset.defaultUsername,
      password: preset.defaultPassword,
      customBodyJson: preset.customBodyJson,
      useCustomBody: preset.useCustomBody,
      timeoutMs: 5000,
    });
    showToast('info', `Đã chọn máy chủ: ${preset.name}`);
  };

  // Reset all state
  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const preset = HTTP_PRESETS[0];
    setSelectedPresetId('dummyjson');
    setConfig({
      url: preset.url,
      method: preset.method,
      headers: [...preset.headers],
      username: preset.defaultUsername,
      password: preset.defaultPassword,
      customBodyJson: preset.customBodyJson,
      useCustomBody: preset.useCustomBody,
      timeoutMs: 5000,
    });
    setRequestLog(null);
    setResponseLog(null);
    setTokenInfo(null);
    setIsLoading(false);
    setSelectedHistoryId(null);
    showToast('info', 'Đã đặt lại cấu hình mặc định');
  };

  // Open knowledge modal on specific topic
  const openKnowledgeWithTopic = (topicId: string) => {
    setKnowledgeInitialTopic(topicId);
    setKnowledgeModalOpen(true);
  };

  // Send the actual HTTP request
  const handleSendRequest = async () => {
    if (isLoading) return;

    // Validate URL
    let targetUrl = config.url.trim();
    if (!targetUrl) {
      showToast('error', 'URL không hợp lệ', 'Vui lòng nhập địa chỉ máy chủ API đích.');
      return;
    }
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
      setConfig((prev) => ({ ...prev, url: targetUrl }));
    }

    // Play tick sound feedback
    soundManager.playSendTick();

    // Prepare Request Body
    let bodyToSend: string | undefined = undefined;
    if (config.method !== 'GET') {
      if (config.useCustomBody) {
        bodyToSend = config.customBodyJson;
      } else {
        const payload: Record<string, any> = {
          username: config.username,
          password: config.password,
        };
        bodyToSend = JSON.stringify(payload, null, 2);
      }
    }

    // Build headers record
    const headersRecord = headersArrayToRecord(config.headers);

    // Build raw request string for wire inspection
    const rawReqWire = generateRawHttpWire(
      config.method,
      targetUrl,
      headersRecord,
      bodyToSend
    );

    const maskedBody = bodyToSend ? maskJsonPasswords(bodyToSend) : '';

    const newReqLog: RequestLog = {
      timestamp: new Date().toLocaleTimeString(),
      method: config.method,
      url: targetUrl,
      headers: headersRecord,
      body: bodyToSend || '',
      maskedBody,
      rawHttpWire: rawReqWire,
    };

    setRequestLog(newReqLog);
    setResponseLog(null);
    setTokenInfo(null);
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Setup Timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, config.timeoutMs);

    const startTime = performance.now();

    try {
      const fetchOptions: RequestInit = {
        method: config.method,
        headers: headersRecord,
        signal: controller.signal,
      };

      if (config.method !== 'GET' && bodyToSend) {
        fetchOptions.body = bodyToSend;
      }

      const response = await fetch(targetUrl, fetchOptions);
      clearTimeout(timeoutId);

      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      // Extract response headers
      const resHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });

      // Extract response body
      const rawText = await response.text();
      let parsedJson: any = null;
      try {
        parsedJson = JSON.parse(rawText);
      } catch {
        parsedJson = null;
      }

      const resLog: ResponseLog = {
        status: response.status,
        statusText: response.statusText,
        headers: resHeaders,
        bodyText: rawText,
        jsonBody: parsedJson,
        durationMs,
        isError: !response.ok,
      };

      setResponseLog(resLog);

      // Inspect Token if present
      let extractedToken: AuthTokenInfo | null = null;
      if (parsedJson) {
        extractedToken = inspectToken(parsedJson);
        if (extractedToken) {
          setTokenInfo(extractedToken);
        }
      }

      // Add to History
      const histItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: newReqLog.timestamp,
        url: targetUrl,
        method: config.method,
        status: response.status,
        statusText: response.statusText,
        durationMs,
        isError: !response.ok,
        request: newReqLog,
        response: resLog,
        tokenInfo: extractedToken,
      };

      setHistory((prev) => [histItem, ...prev.slice(0, 19)]);
      setSelectedHistoryId(histItem.id);

      // Sound & Toast feedback
      if (response.ok) {
        soundManager.playSuccessDing();
        showToast(
          'success',
          `HTTP ${response.status} ${response.statusText}`,
          `Máy chủ phản hồi trong ${durationMs}ms.`
        );
      } else {
        soundManager.playErrorBuzz();
        showToast(
          'warning',
          `HTTP ${response.status} ${response.statusText}`,
          `Mã trạng thái cảnh báo từ máy chủ.`
        );
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      let status = 0;
      let statusText = 'Network Error';
      let errorMsg = err.message || 'Lỗi mạng không xác định';
      let errorType: 'NETWORK_ERROR' | 'TIMEOUT' | 'CORS_ERROR' | 'HTTP_ERROR' | 'ABORTED' =
        'NETWORK_ERROR';

      if (err.name === 'AbortError') {
        statusText = 'Request Timeout';
        errorType = 'TIMEOUT';
        errorMsg = `Quá thời gian chờ (${config.timeoutMs}ms). Không nhận được phản hồi từ server.`;
      } else if (err.message && err.message.includes('Failed to fetch')) {
        statusText = 'Connection Refused / CORS Blocked';
        errorType = 'CORS_ERROR';
        errorMsg = 'Không thể kết nối đến máy chủ. Kiểm tra lại kết nối mạng Internet hoặc cấu hình CORS của server.';
      }

      const errorResLog: ResponseLog = {
        status,
        statusText,
        headers: {},
        bodyText: JSON.stringify(
          {
            error: true,
            type: statusText,
            message: errorMsg,
            tip: 'Nếu test server ngoài, đảm bảo server đó cho phép CORS (Access-Control-Allow-Origin: *).',
          },
          null,
          2
        ),
        jsonBody: { error: errorMsg },
        durationMs,
        isError: true,
        errorMessage: errorMsg,
        errorType,
      };

      setResponseLog(errorResLog);

      const histItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: newReqLog.timestamp,
        url: targetUrl,
        method: config.method,
        status,
        statusText,
        durationMs,
        isError: true,
        request: newReqLog,
        response: errorResLog,
        tokenInfo: null,
      };

      setHistory((prev) => [histItem, ...prev.slice(0, 19)]);
      setSelectedHistoryId(histItem.id);

      soundManager.playErrorBuzz();
      showToast('error', statusText, errorMsg);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Abort active request
  const handleAbortRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      showToast('info', 'Đã hủy request', 'Yêu cầu HTTP đã bị hủy lập tức bởi người dùng.');
    }
  };

  // Restore request from history item
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setSelectedHistoryId(item.id);
    setRequestLog(item.request);
    setResponseLog(item.response);
    setTokenInfo(item.tokenInfo);

    // Populate form config from history snapshot
    setConfig((prev) => ({
      ...prev,
      url: item.request.url,
      method: item.request.method,
      headers: Object.entries(item.request.headers).map(([k, v]) => ({
        key: k,
        value: v,
        enabled: true,
      })),
      customBodyJson: item.request.body,
      useCustomBody: true,
    }));

    showToast('info', 'Đã phục hồi lịch sử', `Nạp lại gói tin HTTP ${item.method} ${item.status}`);
  };

  // Clear all history
  const handleClearHistory = () => {
    setHistory([]);
    setSelectedHistoryId(null);
    showToast('info', 'Đã xóa toàn bộ lịch sử');
  };

  const isHttps = config.url.trim().toLowerCase().startsWith('https://');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-cyan-500 selection:text-white transition-colors duration-200">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Navigation Bar */}
      <Navbar
        onOpenKnowledge={() => setKnowledgeModalOpen(true)}
        onOpenCodeSnippets={() => setSnippetsModalOpen(true)}
        onOpenHistory={() => setHistoryDrawerOpen(true)}
        historyCount={history.length}
        stepByStepMode={stepByStepMode}
        onToggleStepByStep={handleToggleStepByStep}
        isSoundMuted={isSoundMuted}
        onToggleSound={handleToggleSound}
        onReset={handleReset}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Educational Context Banner */}
        <div className="bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm dark:shadow-xl transition-colors duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20">
                <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-600 dark:text-cyan-400" />
                <span>Mô phỏng Giao thức Mạng cho Thiết Bị IoT</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Khám Phá Cơ Chế HTTP POST & Xác Thực Token Qua Server Thật
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Khi thiết bị IoT (ESP32, STM32, Raspberry Pi) khởi động, nó thực hiện một HTTP POST request gửi tài khoản/mật khẩu để lấy Token. Ứng dụng này giúp bạn bóc tách từng byte dữ liệu truyền tải trên dây mạng và quan sát trọn vẹn phản hồi của máy chủ.
              </p>
            </div>

            {/* Quick Educational Topics Trigger Chips */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openKnowledgeWithTopic('http-vs-https')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>HTTP vs HTTPS trong IoT</span>
              </button>
              <button
                type="button"
                onClick={() => openKnowledgeWithTopic('http-methods')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>GET vs POST vs PUT</span>
              </button>
              <button
                type="button"
                onClick={() => openKnowledgeWithTopic('network-errors-timeouts')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 transition cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Lỗi Mạng & Timeout</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2 CỘT ĐỐI XỨNG (SPLIT SCREEN TRÊN DESKTOP) & NETWORK PIPE CONNECTOR */}
        <div className="space-y-4">
          {/* Network Pipe Connector (Trực quan hóa đường truyền dữ liệu nối giữa Client và Server) */}
          <NetworkPipeConnector
            isLoading={isLoading}
            response={responseLog}
            isHttps={isHttps}
            method={config.method}
          />

          {/* Grid 2 Cột: Cột Trái (Client Panel) và Cột Phải (Server Panel) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* CỘT TRÁI: CLIENT PANEL (Cấu hình Request, 3D Tilt Card, cURL Copy, Depth Press) */}
            <div className="flex flex-col">
              <LoginConfigCard
                config={config}
                onChangeConfig={setConfig}
                presets={HTTP_PRESETS}
                selectedPresetId={selectedPresetId}
                onSelectPreset={handleSelectPreset}
                onSendRequest={handleSendRequest}
                onAbortRequest={handleAbortRequest}
                isLoading={isLoading}
                stepByStepMode={stepByStepMode}
                onCopyToast={(text, title) => showToast('info', title, text)}
              />
            </div>

            {/* CỘT PHẢI: SERVER PANEL (Hiển thị Response, Status Code Micro-Animation, JSON, Headers, Token) */}
            <div className="flex flex-col">
              <ServerResponsePanel
                response={responseLog}
                tokenInfo={tokenInfo}
                serverUrl={config.url}
                isLoading={isLoading}
                onCopyToast={(text, title) => showToast('info', title, text)}
              />
            </div>
          </div>
        </div>

        {/* SECTION TIẾT LỘ DẦN (PROGRESSIVE DISCLOSURE): VÒNG ĐỜI HTTP 5 BƯỚC */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
          <button
            type="button"
            onClick={() => setShowLifecycleSection(!showLifecycleSection)}
            className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Vòng Đời HTTP & Đường Đi Gói Tin Mạng (HTTP Lifecycle)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  5 giai đoạn từ Socket TCP & Handshake đến Máy chủ xử lý và phản hồi 200 OK
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
              <span>{showLifecycleSection ? 'Thu gọn' : 'Mở rộng'}</span>
              {showLifecycleSection ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {showLifecycleSection && (
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <HttpLifecycleViewer
                isRequesting={isLoading}
                response={responseLog}
                isHttps={isHttps}
              />
            </div>
          )}
        </div>

        {/* SECTION: EDUCATIONAL SUMMARY & IOT GUIDANCE FOOTER CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors duration-200">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Tại sao HTTPS quan trọng cho IoT?</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Nếu dùng HTTP thường, mật khẩu đăng nhập của thiết bị gửi qua Wi-Fi công cộng hay 4G đều bị lộ dạng bản rõ. HTTPS mã hóa qua TLS bảo vệ an toàn danh tính thiết bị trước các cuộc tấn công nghe lén (Sniffing).
            </p>
            <button
              type="button"
              onClick={() => openKnowledgeWithTopic('http-vs-https')}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold cursor-pointer"
            >
              Đọc chi tiết về TLS trên ESP32 &rarr;
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors duration-200">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Cơ chế Xác thực Bearer Token</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Sau khi login thành công, thiết bị lưu Token vào RAM. Các lần gửi dữ liệu cảm biến sau đó chỉ cần đính kèm header <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 font-mono">Authorization: Bearer &lt;token&gt;</code>, giảm thiểu rủi ro truyền lại mật khẩu gốc.
            </p>
            <button
              type="button"
              onClick={() => openKnowledgeWithTopic('http-headers')}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold cursor-pointer"
            >
              Xem vai trò của Headers &rarr;
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs transition-colors duration-200">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Xử lý Timeout & Mạng Chập Chờn</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Khác với trình duyệt có tài nguyên lớn, vi điều khiển IoT có RAM rất nhỏ. Luôn đặt timeout ngắn (3s-5s) và áp dụng cơ chế thử lại trễ dần (Exponential Backoff) để bảo vệ tuổi thọ pin và chống treo Watchdog.
            </p>
            <button
              type="button"
              onClick={() => openKnowledgeWithTopic('network-errors-timeouts')}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold cursor-pointer"
            >
              Xem giải pháp xử lý lỗi mạng &rarr;
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <p>
          Ứng dụng Giáo dục Giao thức HTTP & Xác Thực IoT | Thiết kế theo trường phái UI/UX Pro Max Minimalism & Cyberpunk-Lite
        </p>
      </footer>

      {/* Request History Drawer */}
      <RequestHistoryDrawer
        isOpen={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        history={history}
        selectedId={selectedHistoryId}
        onSelect={handleSelectHistoryItem}
        onClear={handleClearHistory}
      />

      {/* Knowledge Base Modal */}
      <KnowledgeBaseModal
        isOpen={knowledgeModalOpen}
        onClose={() => setKnowledgeModalOpen(false)}
        initialTopicId={knowledgeInitialTopic}
      />

      {/* IoT Code Snippets Modal */}
      <IotCodeSnippetsModal
        isOpen={snippetsModalOpen}
        onClose={() => setSnippetsModalOpen(false)}
        config={config}
      />
    </div>
  );
}
