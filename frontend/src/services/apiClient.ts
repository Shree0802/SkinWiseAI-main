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

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers || {});
    
    // Don't set Content-Type for FormData as the browser handles the boundary
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `Server error HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
          }
        } catch {
          // Response body wasn't JSON
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to SkinWise backend. Please ensure the backend is running at ' + API_BASE_URL);
      }
      throw err;
    }
  }

  // Health
  async checkHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/health');
  }

  // Skin Analysis
  async analyzeSkin(file: File, isDemo: boolean = false): Promise<SkinAnalysisResult> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('demo', String(isDemo));
    formData.append('save_report', 'true');

    return this.request<SkinAnalysisResult>('/skin-analysis', {
      method: 'POST',
      body: formData,
    });
  }

  async getReport(reportId: string): Promise<SkinAnalysisResult> {
    return this.request<SkinAnalysisResult>(`/skin-analysis/${reportId}`);
  }

  async listReports(): Promise<AnalysisReportSummary[]> {
    return this.request<AnalysisReportSummary[]>('/reports');
  }

  async deleteReport(reportId: string): Promise<{ message: string; deleted_id: string }> {
    return this.request<{ message: string; deleted_id: string }>(`/reports/${reportId}`, {
      method: 'DELETE',
    });
  }

  // Routine Builder
  async generateRoutine(request: RoutineRequest): Promise<RoutineResponse> {
    return this.request<RoutineResponse>('/routine', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Products
  async getProducts(params?: { category?: string; skin_type?: string; max_budget?: number }): Promise<ProductItem[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.skin_type) query.append('skin_type', params.skin_type);
    if (params?.max_budget) query.append('max_budget', String(params.max_budget));

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
    const qs = new URLSearchParams({ ids: ids.join(',') }).toString();
    return this.request<ProductItem[]>(`/products/compare?${qs}`);
  }

  // Journal
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
    return this.request<{ message: string; deleted_id: string }>(`/journal/${entryId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
