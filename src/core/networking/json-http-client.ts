import { APP_CONFIG } from '@/core/config/app-config';
import { NetworkError } from '@/core/errors/app-errors';

export interface JsonHttpClientOptions {
  baseUrl: string;
  userAgent: string;
  timeoutMs?: number;
  retries?: number;
  fetchImpl?: typeof fetch;
}

interface ErrorBody {
  message?: string;
}

export class JsonHttpClient {
  private readonly baseUrl: string;
  private readonly userAgent: string;
  private readonly timeoutMs: number;
  private readonly retries: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: JsonHttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.userAgent = options.userAgent;
    this.timeoutMs = options.timeoutMs ?? APP_CONFIG.httpTimeoutMs;
    this.retries = options.retries ?? APP_CONFIG.httpRetries;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    let lastError: NetworkError | null = null;

    for (let attempt = 0; attempt <= this.retries; attempt += 1) {
      try {
        return await this.request<T>(url, signal);
      } catch (error) {
        if (error instanceof NetworkError) {
          lastError = error;
          const retryable = error.status === undefined || error.status === 429 || error.status >= 500;
          if (!retryable || attempt === this.retries || signal?.aborted) {
            throw error;
          }
          await this.delay(attempt);
          continue;
        }
        throw error;
      }
    }

    throw lastError ?? new NetworkError(`Request failed: ${url}`);
  }

  private async request<T>(url: string, signal?: AbortSignal): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const onExternalAbort = () => controller.abort();
    signal?.addEventListener('abort', onExternalAbort);

    try {
      const response = await this.fetchImpl(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': this.userAgent,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await this.readErrorBody(response);
        throw new NetworkError(`HTTP ${response.status} for ${url}${body ? `: ${body}` : ''}`, {
          status: response.status,
        });
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof NetworkError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError' && signal?.aborted) {
        throw new NetworkError(`Request aborted: ${url}`, { cause: error });
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError(`Request timed out after ${this.timeoutMs}ms: ${url}`, { cause: error });
      }
      throw new NetworkError(`Network request failed: ${url}`, { cause: error });
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', onExternalAbort);
    }
  }

  private async readErrorBody(response: Response): Promise<string | null> {
    try {
      const text = await response.text();
      if (!text) {
        return null;
      }
      try {
        const parsed = JSON.parse(text) as ErrorBody;
        return parsed.message ?? text.slice(0, 200);
      } catch {
        return text.slice(0, 200);
      }
    } catch {
      return null;
    }
  }

  private delay(attempt: number): Promise<void> {
    const milliseconds = 400 * 2 ** attempt;
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}
