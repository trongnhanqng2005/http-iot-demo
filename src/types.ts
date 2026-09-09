export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HeaderPair {
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestConfig {
  url: string;
  method: HttpMethod;
  headers: HeaderPair[];
  username: string;
  password: string;
  customBodyJson?: string;
  useCustomBody: boolean;
  timeoutMs: number;
}

export interface RequestLog {
  timestamp: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: string;
  maskedBody: string;
  rawHttpWire: string;
}

export interface ResponseLog {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  bodyText: string;
  jsonBody?: any;
  durationMs: number;
  isError: boolean;
  errorMessage?: string;
  errorType?: 'NETWORK_ERROR' | 'TIMEOUT' | 'CORS_ERROR' | 'HTTP_ERROR' | 'ABORTED';
}

export interface AuthTokenInfo {
  token: string;
  tokenType: 'JWT' | 'SESSION' | 'API_KEY';
  extractedFromKey: string;
  decodedJwt?: {
    header: Record<string, any>;
    payload: Record<string, any>;
    signature: string;
    isExpired: boolean;
    expiresAtFormatted?: string;
  };
}

export interface HttpPreset {
  id: string;
  name: string;
  description: string;
  url: string;
  method: HttpMethod;
  defaultUsername: string;
  defaultPassword: string;
  headers: HeaderPair[];
  useCustomBody: boolean;
  customBodyJson?: string;
  tokenKey?: string;
  notes: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  url: string;
  method: HttpMethod;
  status: number;
  statusText: string;
  durationMs: number;
  isError: boolean;
  request: RequestLog;
  response: ResponseLog;
  tokenInfo: AuthTokenInfo | null;
}

