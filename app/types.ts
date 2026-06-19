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

export type FeedbackRequest = {
  trace_id: string;
  rating: number;
  purchase_intent: boolean;
  selected_product_id: string | null;
  reason: string;
  improvement_requests: string[];
  contact: string;
};

export type FeedbackRecord = FeedbackRequest & {
  feedback_id: string;
  workspace_id: string;
  contact_masked: string;
  created_at: string;
};

export type BetaLeadRequest = {
  email: string;
  persona: string;
  use_case: string;
  company_size: string;
  contact_consent: boolean;
  source: string;
};

export type BetaLead = {
  lead_id: string;
  workspace_id: string;
  email_masked: string;
  persona: string;
  use_case: string;
  company_size: string;
  contact_consent: boolean;
  source: string;
  created_at: string;
};

export type SubscriptionIntentRequest = {
  email: string;
  plan_id: "premium" | "team";
  billing_cycle: "monthly" | "annual";
  persona: string;
  use_case: string;
  team_size: number;
  max_budget_krw: number;
  feature_priorities: string[];
  purchase_timing: string;
  contact_consent: boolean;
  source: string;
};

export type SubscriptionIntent = {
  intent_id: string;
  workspace_id: string;
  email_masked: string;
  plan_id: string;
  plan_name: string;
  billing_cycle: string;
  monthly_price_krw: number;
  estimated_mrr_krw: number;
  persona: string;
  use_case: string;
  team_size: number;
  max_budget_krw: number | null;
  feature_priorities: string[];
  purchase_timing: string;
  contact_consent: boolean;
  source: string;
  readiness_status: "ok" | "warning" | "blocker";
  recommendation: string;
  created_at: string;
};

export type ReportAdvisorQuestionRequest = {
  report_id: string;
  question: string;
  context: string;
  selected_product_id: string | null;
  buyer_stage: string;
  contact: string;
};

export type ReportAdvisorAnswer = {
  answer_id: string;
  report_id: string;
  trace_id: string;
  workspace_id: string;
  question: string;
  context: string;
  selected_product_id: string | null;
  selected_model_name: string;
  buyer_stage: string;
  answer: string;
  status: "ok" | "warning" | "blocker";
  confidence: number;
  grounded_evidence: string[];
  cited_product_ids: string[];
  next_actions: string[];
  contact_masked: string;
  created_at: string;
};

export type SourceUrlIngestRequest = {
  url: string;
  category: Category;
  kind: "price";
  expected_model: string;
  source_name: string;
  seller: string;
  html: string;
};

export type SourceCandidate = {
  source_id: string;
  adapter_id: string;
  kind: string;
  title: string;
  url: string;
  normalized_model: string;
  extracted_price_krw: number | null;
  shipping_fee_krw: number | null;
  coupon_or_card_benefit_krw: number | null;
  effective_price_krw: number | null;
  availability_status: string;
  model_match_status: "ok" | "warning" | "blocker";
  seller: string | null;
  evidence_text: string;
  confidence: number;
  collected_at: string;
  needs_review: boolean;
  risk_flags: string[];
  extraction_signals: string[];
};

export type SourceUrlIngestResponse = {
  candidate: SourceCandidate;
  fetched_live: boolean;
  extraction_notes: string[];
};

export type CheckoutReviewRequest = {
  report_id: string;
  product_id: string | null;
  confirmed_price_krw: number | null;
  acknowledged_risks: string[];
  seller_answers: Record<string, string>;
  notes: string;
};

export type CheckoutReviewItem = {
  item_id: string;
  label: string;
  status: "ok" | "warning" | "blocker";
  evidence: string;
  required: boolean;
};

export type CheckoutReview = {
  review_id: string;
  report_id: string;
  trace_id: string;
  workspace_id: string;
  product_id: string | null;
  model_name: string | null;
  confirmed_price_krw: number | null;
  readiness_status: "ok" | "warning" | "blocker";
  readiness_score: number;
  checkout_blocked: boolean;
  missing_acknowledgements: string[];
  seller_questions: string[];
  seller_answers: Record<string, string>;
  items: CheckoutReviewItem[];
  final_recommendation: string;
  notes: string;
  created_at: string;
};
