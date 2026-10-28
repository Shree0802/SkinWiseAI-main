export interface SkinMetric {
  key: string;
  label: string;
  score: number | null;
  raw_score: number | null;
  severity: 'Optimal' | 'Mild Concern' | 'Moderate Concern' | 'Needs Targeted Care' | string | null;
  explanation: string;
  mask_url?: string | null;
}

export interface SkinAnalysisResult {
  report_id: string;
  created_at: string;
  skin_type: string | null;
  skin_age: number | null;
  overall_score: number | null;
  metrics: SkinMetric[];
  summary: string;
  is_demo: boolean;
  source: 'youcam_api' | 'demo_mock';
  disclaimer: string;
  raw_data_summary?: Record<string, any>;
}

export interface AnalysisReportSummary {
  report_id: string;
  created_at: string;
  skin_type: string | null;
  overall_score: number | null;
  is_demo: boolean;
  concerns_highlighted: string[];
}

export interface RoutineStep {
  step_number: number;
  phase: 'morning' | 'evening';
  step_name: string;
  product_category: string;
  rationale: string;
  recommended_ingredients: string[];
  ingredients_to_avoid: string[];
}

export interface RoutineRequest {
  skin_type?: string;
  primary_concerns: string[];
  budget_tier?: 'budget' | 'moderate' | 'premium';
  preferences?: string[];
  avoid_ingredients?: string[];
  report_id?: string;
}

export interface RoutineResponse {
  routine_id: string;
  created_at: string;
  target_skin_type: string;
  target_concerns: string[];
  morning_steps: RoutineStep[];
  evening_steps: RoutineStep[];
  patch_test_guidelines: string;
  medical_disclaimer: string;
}

export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  price_inr: number;
  description: string;
  key_ingredients: string[];
  all_ingredients: string[];
  suitability_tags: string[];
  target_concerns: string[];
  is_fragrance_free: boolean;
  is_cruelty_free: boolean;
  is_sample_catalogue: boolean;
  verified_url?: string;
  match_score?: number;
  match_reasons?: string[];
}

export interface ProductMatchRequest {
  skin_type?: string;
  concerns?: string[];
  max_budget_inr?: number;
  categories?: string[];
  preferences?: string[];
  avoid_ingredients?: string[];
}

export interface JournalEntryCreate {
  report_id?: string;
  title: string;
  notes?: string;
  skin_feel?: string;
  products_used?: string[];
}

export interface JournalEntry {
  id: string;
  created_at: string;
  report_id?: string;
  title: string;
  notes?: string;
  skin_feel?: string;
  products_used: string[];
  report_summary?: {
    skin_type?: string;
    overall_score?: number;
    created_at?: string;
    is_demo?: boolean;
  };
}

export interface HealthStatus {
  status: string;
  app_name: string;
  environment: string;
  youcam_configured: boolean;
  database_connected: boolean;
  version: string;
}
