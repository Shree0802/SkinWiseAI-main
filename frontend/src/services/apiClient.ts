import type {
  SkinAnalysisResult,
  AnalysisReportSummary,
  RoutineRequest,
  RoutineResponse,
  ProductItem,
  ProductMatchRequest,
  JournalEntry,
  JournalEntryCreate,
  HealthStatus,
} from '../types';

/**
 * Resolves and normalizes the API base URL.
 * Ensures the resulting base URL always ends with '/api/v1' without duplication.
 *
 * Examples:
 *  "https://skinwise-ai-backend-wt7t.onrender.com"      -> "https://skinwise-ai-backend-wt7t.onrender.com/api/v1"
 *  "https://skinwise-ai-backend-wt7t.onrender.com/"     -> "https://skinwise-ai-backend-wt7t.onrender.com/api/v1"
 *  "https://skinwise-ai-backend-wt7t.onrender.com/api/v1"  -> "https://skinwise-ai-backend-wt7t.onrender.com/api/v1"
 *  "https://skinwise-ai-backend-wt7t.onrender.com/api/v1/" -> "https://skinwise-ai-backend-wt7t.onrender.com/api/v1"
 *  undefined / "" -> "http://localhost:8000/api/v1"
 */
export function getNormalizedApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  const rawUrl = envUrl || 'http://localhost:8000/api/v1';
  let cleaned = rawUrl.replace(/\/+$/, '');
  if (!cleaned.endsWith('/api/v1')) {
    cleaned = `${cleaned}/api/v1`;
  }
  return cleaned;
}

/**
 * Builds a safe full API URL preventing duplicated "/api/v1/api/v1"
 */
export function buildApiUrl(endpoint: string): string {
  const base = getNormalizedApiBaseUrl();
  let path = endpoint.trim();
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  // If endpoint already starts with /api/v1, strip it so base URL does not duplicate it
  if (path.startsWith('/api/v1/')) {
    path = path.slice('/api/v1'.length);
  } else if (path === '/api/v1') {
    path = '';
  }
  return `${base}${path}`;
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export class ApiClient {
  private defaultTimeoutMs = 30000;

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = buildApiUrl(endpoint);
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
    const headers = new Headers(options.headers || {});

    // Set JSON content type if body is not FormData and not already set
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      // Handle HTTP error statuses
      if (!response.ok) {
        let detailMessage = `Server responded with HTTP ${response.status}`;
        try {
          const errorJson = await response.json();
          if (errorJson.detail) {
            detailMessage =
              typeof errorJson.detail === 'string'
                ? errorJson.detail
                : JSON.stringify(errorJson.detail);
          } else if (errorJson.message) {
            detailMessage = errorJson.message;
          }
        } catch {
          // Response body was not JSON; use default
        }

        if (response.status === 401) {
          throw new Error(`Authentication Required: ${detailMessage}`);
        } else if (response.status === 404) {
          throw new Error(`Resource Not Found (404): ${detailMessage}`);
        } else if (response.status === 429) {
          throw new Error(`Rate limit reached: ${detailMessage}`);
        } else if (response.status === 504) {
          throw new Error(`Gateway Timeout: ${detailMessage}`);
        } else if (response.status >= 500) {
          throw new Error(`Backend Service Error (${response.status}): ${detailMessage}`);
        }
        throw new Error(detailMessage);
      }

      // 204 No Content or empty responses
      if (response.status === 204) {
        return {} as T;
      }

      const text = await response.text();
      if (!text || !text.trim()) {
        return {} as T;
      }

      try {
        return JSON.parse(text) as T;
      } catch (parseError) {
        console.error('Failed to parse JSON response:', text, parseError);
        throw new Error('Received malformed JSON from the server.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error(
          `Request timed out after ${Math.round(timeoutMs / 1000)}s. The backend may be spinning up on Render; please retry shortly.`
        );
      }
      if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
        throw new Error(
          `Unable to connect to SkinWise backend at ${getNormalizedApiBaseUrl()}. Please verify network connection and server status.`
        );
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  // Health
  async checkHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/health', { timeoutMs: 10000 });
  }

  // Skin Analysis (longer timeout for AI task polling)
  async analyzeSkin(file: File, isDemo: boolean = false, saveReport: boolean = true): Promise<SkinAnalysisResult> {
    const formData = new FormData();
    formData.append('image', file, file.name);
    formData.append('demo', String(isDemo));
    formData.append('save_report', String(saveReport));

    return this.request<SkinAnalysisResult>('/skin-analysis', {
      method: 'POST',
      body: formData,
      timeoutMs: 65000,
    });
  }

  async getReport(reportId: string): Promise<SkinAnalysisResult> {
    return this.request<SkinAnalysisResult>(`/skin-analysis/${encodeURIComponent(reportId)}`);
  }

  async listReports(): Promise<AnalysisReportSummary[]> {
    return this.request<AnalysisReportSummary[]>('/reports');
  }

  async deleteReport(reportId: string): Promise<{ message: string; deleted_id: string }> {
    return this.request<{ message: string; deleted_id: string }>(
      `/reports/${encodeURIComponent(reportId)}`,
      { method: 'DELETE' }
    );
  }

  // Routine Builder
  async generateRoutine(request: RoutineRequest): Promise<RoutineResponse> {
    return this.request<RoutineResponse>('/routine', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Smart Shopping
  async getProducts(params?: { category?: string; skin_type?: string; max_budget?: number }): Promise<ProductItem[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') {
      query.append('category', params.category);
    }
    if (params?.skin_type && params.skin_type !== 'All') {
      query.append('skin_type', params.skin_type);
    }
    if (params?.max_budget && params.max_budget > 0) {
      query.append('max_budget', String(params.max_budget));
    }

    const qs = query.toString();
    return this.request<ProductItem[]>(`/products${qs ? `?${qs}` : ''}`);
  }

  async matchProducts(request: ProductMatchRequest): Promise<ProductItem[]> {
    return this.request<ProductItem[]>('/products/match', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async compareProducts(ids: string[]): Promise<ProductItem[]> {
    const validIds = ids.filter((id) => id && id.trim().length > 0);
    const qs = new URLSearchParams({ ids: validIds.join(',') }).toString();
    return this.request<ProductItem[]>(`/products/compare?${qs}`);
  }

  // Skin Journal
  async getJournalEntries(): Promise<JournalEntry[]> {
    return this.request<JournalEntry[]>('/journal');
  }

  async createJournalEntry(entry: JournalEntryCreate): Promise<JournalEntry> {
    return this.request<JournalEntry>('/journal', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async deleteJournalEntry(entryId: string): Promise<{ message: string; deleted_id: string }> {
    return this.request<{ message: string; deleted_id: string }>(
      `/journal/${encodeURIComponent(entryId)}`,
      { method: 'DELETE' }
    );
  }
}

export const apiClient = new ApiClient();
