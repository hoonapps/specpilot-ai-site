export type Category = "desktop_pc" | "laptop";

export type AnalyzePayload = {
  query: string;
  category: Category;
  budget_krw: number;
  purpose: string;
  must_haves: string[];
  exclusions: string[];
  channels: string[];
};

export type Recommendation = {
  rank: number;
  product: {
    id: string;
    model_name: string;
    option_summary: string;
  };
  price: {
    effective_price_krw: number;
  };
  score: {
    total_score: number;
    compatibility: number;
  };
  fit_summary: string;
};

export type DealWindow = {
  product_id: string;
  model_name: string;
  label: string;
  status: "ok" | "warning" | "blocker";
  current_price_krw: number;
  target_price_krw: number;
  fair_price_band_krw: string;
  urgency: string;
  volatility_risk: string;
  wait_reason: string;
  buy_trigger: string;
  monitoring_plan: string[];
};

export type AnalyzeResponse = {
  graph_trace_id: string;
  report: {
    summary: string;
    purchase_timing: string;
    final_pick_id: string | null;
    top_recommendations: Recommendation[];
    purchase_decision: {
      label: string;
      confidence: number;
      reason: string;
      next_steps: string[];
    };
    share_brief: {
      headline: string;
      verdict_label: string;
      key_reasons: string[];
      watchouts: string[];
      copy_text: string;
    };
    deal_windows: DealWindow[];
    source_health: string[];
  };
  quality_audit?: {
    quality_score: number;
    estimated_cost_krw: number;
    launch_blockers: string[];
  };
};

export type SaveReportResponse = {
  report_id: string;
  trace_id: string;
  title: string;
};

export type ShareReportResponse = {
  report_id: string;
  is_public: boolean;
  share_token: string;
  public_path: string;
};

export type AnalyzeAndShareResponse = {
  analysis: AnalyzeResponse;
  saved_report: SaveReportResponse | null;
  share: ShareReportResponse | null;
  public_url: string | null;
  mode: "live" | "demo";
  warning?: string;
};
