/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Navbar } from './components/Navbar';
import { LoginConfigCard } from './components/LoginConfigCard';
import { HttpLifecycleViewer } from './components/HttpLifecycleViewer';
import { RequestResponseInspector } from './components/RequestResponseInspector';
import { TokenVisualizer } from './components/TokenVisualizer';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal';
import { IotCodeSnippetsModal } from './components/IotCodeSnippetsModal';
import { HTTP_PRESETS } from './data/presets';
import {
  AuthTokenInfo,
  HeaderPair,
  RequestConfig,
  RequestLog,
  ResponseLog,
} from './types';
import {
  generateRawHttpWire,
  headersArrayToRecord,
  inspectToken,
  maskJsonPasswords,
} from './utils/httpHelper';
import {
  BookOpen,
  Code2,
  HelpCircle,
  Radio,
  ShieldCheck,
  Zap,
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

  // Modals state
  const [knowledgeModalOpen, setKnowledgeModalOpen] = React.useState<boolean>(false);
  const [knowledgeInitialTopic, setKnowledgeInitialTopic] = React.useState<string>('http-vs-https');
  const [snippetsModalOpen, setSnippetsModalOpen] = React.useState<boolean>(false);

  // Abort controller reference to cancel request
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Handle Preset Switching
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
  };

  // Reset all states
  const handleReset = () => {
    handleSelectPreset('dummyjson');
    setRequestLog(null);
    setResponseLog(null);
    setTokenInfo(null);
    setIsLoading(false);
  };

  // Open knowledge modal with specific topic
  const openKnowledgeWithTopic = (topicId: string) => {
    setKnowledgeInitialTopic(topicId);
    setKnowledgeModalOpen(true);
  };

  // Cancel/Abort current in-flight request
  const handleAbortRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Send real HTTP Request
  const handleSendRequest = async () => {
    if (isLoading) return;

    // Abort previous if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setResponseLog(null);
    setTokenInfo(null);

    // 1. Prepare Request Headers
    const headersRecord = headersArrayToRecord(config.headers);
    if (!headersRecord['Content-Type']) {
      headersRecord['Content-Type'] = 'application/json';
    }

    // 2. Prepare Request Body
    let bodyString = '';
    if (config.useCustomBody && config.customBodyJson) {
      bodyString = config.customBodyJson;
    } else {
      bodyString = JSON.stringify(
        {
          username: config.username,
          password: config.password,
        },
        null,
        2
      );
    }

    const maskedBody = maskJsonPasswords(bodyString);
    const rawWire = generateRawHttpWire(config.method, config.url, headersRecord, bodyString);

    const newRequestLog: RequestLog = {
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      method: config.method,
      url: config.url,
      headers: headersRecord,
      body: bodyString,
      maskedBody,
      rawHttpWire: rawWire,
    };
    setRequestLog(newRequestLog);

    // 3. Set Timeout Timer (crucial for IoT behavior)
    let isTimedOut = false;
    const timeoutId = setTimeout(() => {
      isTimedOut = true;
      controller.abort();
    }, config.timeoutMs);

    const startTime = performance.now();

    try {
      // 4. Fire the REAL fetch request
      const response = await fetch(config.url, {
        method: config.method,
        headers: headersRecord,
        body: config.method !== 'GET' ? bodyString : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      // Collect Response Headers
      const resHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });

      // Read Response Body
      const bodyText = await response.text();
      let parsedJson: any = null;
      try {
        parsedJson = JSON.parse(bodyText);
      } catch {}

      // Format formatted bodyText if JSON
      const formattedBody = parsedJson ? JSON.stringify(parsedJson, null, 2) : bodyText;

      const isError = !response.ok;
      const resLog: ResponseLog = {
        status: response.status,
        statusText: response.statusText,
        headers: resHeaders,
        bodyText: formattedBody,
        jsonBody: parsedJson,
        durationMs,
        isError,
        errorMessage: isError
          ? `Máy chủ phản hồi mã lỗi HTTP ${response.status} (${response.statusText})`
          : undefined,
        errorType: isError ? 'HTTP_ERROR' : undefined,
      };

      setResponseLog(resLog);

      // Extract token if successful
      if (response.ok && parsedJson) {
        const foundToken = inspectToken(parsedJson);
        if (foundToken) {
          setTokenInfo(foundToken);
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      let errorType: 'TIMEOUT' | 'CORS_ERROR' | 'NETWORK_ERROR' | 'ABORTED' = 'NETWORK_ERROR';
      let errorMessage = 'Không thể kết nối đến máy chủ.';

      if (isTimedOut || err.name === 'AbortError') {
        if (isTimedOut) {
          errorType = 'TIMEOUT';
          errorMessage = `Yêu cầu bị ngắt (Timeout) sau ${config.timeoutMs}ms. Máy chủ không phản hồi kịp thời.`;
        } else {
          errorType = 'ABORTED';
          errorMessage = 'Yêu cầu đã bị hủy bởi người dùng (User Aborted).';
        }
      } else if (err instanceof TypeError && err.message.toLowerCase().includes('failed to fetch')) {
        errorType = 'CORS_ERROR';
        errorMessage =
          'Lỗi kết nối hoặc CORS (Cross-Origin Resource Sharing). Trình duyệt chặn đọc phản hồi do server chưa cấu hình Access-Control-Allow-Origin, hoặc URL không tồn tại.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setResponseLog({
        status: 0,
        statusText: errorType,
        headers: {},
        bodyText: '',
        durationMs,
        isError: true,
        errorMessage,
        errorType,
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const isHttps = config.url.trim().toLowerCase().startsWith('https://');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        onOpenKnowledge={() => setKnowledgeModalOpen(true)}
        onOpenCodeSnippets={() => setSnippetsModalOpen(true)}
        onReset={handleReset}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Educational Context Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Mô phỏng Giao thức Mạng cho Thiết Bị IoT</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
                Khám Phá Cơ Chế HTTP POST & Xác Thực Token Qua Server Thật
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Khi thiết bị IoT (ESP32, STM32, Raspberry Pi) khởi động, nó thực hiện một HTTP POST request gửi tài khoản/mật khẩu để lấy Token. Ứng dụng này giúp bạn bóc tách từng byte dữ liệu truyền tải trên dây mạng và quan sát trọn vẹn phản hồi của máy chủ.
              </p>
            </div>

            {/* Quick Educational Topics Trigger Chips */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
              <button
                onClick={() => openKnowledgeWithTopic('http-vs-https')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>HTTP vs HTTPS trong IoT</span>
              </button>
              <button
                onClick={() => openKnowledgeWithTopic('http-methods')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>GET vs POST vs PUT</span>
              </button>
              <button
                onClick={() => openKnowledgeWithTopic('network-errors-timeouts')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lỗi Mạng & Timeout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 1: Login Form & Endpoint Config */}
        <LoginConfigCard
          config={config}
          onChangeConfig={setConfig}
          presets={HTTP_PRESETS}
          selectedPresetId={selectedPresetId}
          onSelectPreset={handleSelectPreset}
          onSendRequest={handleSendRequest}
          onAbortRequest={handleAbortRequest}
          isLoading={isLoading}
        />

        {/* Section 2: Visual HTTP Lifecycle Pipeline */}
        <HttpLifecycleViewer
          isRequesting={isLoading}
          response={responseLog}
          isHttps={isHttps}
        />

        {/* Section 3: Detailed Request & Response Technical Inspector */}
        <RequestResponseInspector
          request={requestLog}
          response={responseLog}
          isLoading={isLoading}
        />

        {/* Section 4: Token & JWT Visualizer (if success and token detected) */}
        {tokenInfo && (
          <TokenVisualizer
            tokenInfo={tokenInfo}
            serverUrl={config.url}
          />
        )}

        {/* Section 5: Educational Summary & IoT Guidance Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Tại sao HTTPS quan trọng cho IoT?</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nếu dùng HTTP thường, mật khẩu đăng nhập của thiết bị gửi qua Wi-Fi công cộng hay 4G đều bị lộ dạng bản rõ. HTTPS mã hóa qua TLS bảo vệ an toàn danh tính thiết bị trước các cuộc tấn công nghe lén (Sniffing).
            </p>
            <button
              onClick={() => openKnowledgeWithTopic('http-vs-https')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Đọc chi tiết về TLS trên ESP32 &rarr;
            </button>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Cơ chế Xác thực Bearer Token</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sau khi login thành công, thiết bị lưu Token vào RAM. Các lần gửi dữ liệu cảm biến sau đó chỉ cần đính kèm header <code className="text-cyan-300 font-mono">Authorization: Bearer &lt;token&gt;</code>, giảm thiểu rủi ro truyền lại mật khẩu gốc.
            </p>
            <button
              onClick={() => openKnowledgeWithTopic('http-headers')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Xem vai trò của Headers &rarr;
            </button>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Xử lý Timeout & Mạng Chập Chờn</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Khác với trình duyệt có tài nguyên lớn, vi điều khiển IoT có RAM rất nhỏ. Luôn đặt timeout ngắn (3s-5s) và áp dụng cơ chế thử lại trễ dần (Exponential Backoff) để bảo vệ tuổi thọ pin và chống treo Watchdog.
            </p>
            <button
              onClick={() => openKnowledgeWithTopic('network-errors-timeouts')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Xem giải pháp xử lý lỗi mạng &rarr;
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 text-center text-xs text-slate-400">
        <p>
          Ứng dụng Giáo dục Giao thức HTTP & Xác Thực IoT | Hỗ trợ kiểm thử trực tiếp máy chủ HTTP/HTTPS thật
        </p>
      </footer>

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
