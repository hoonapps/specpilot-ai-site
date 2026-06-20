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

export type IntakeSlotDiagnosis = {
  slot: string;
  label: string;
  status: OpsStatus;
  message: string;
  recommendation: string;
};

export type IntakeNormalizedRequest = Omit<AnalyzePayload, "budget_krw"> & {
  budget_krw: number | null;
  purchase_timing: string;
};

export type IntakeDiagnosisResponse = {
  readiness_score: number;
  readiness_label: string;
  next_action: string;
  missing_slots: string[];
  clarifying_questions: string[];
  suggested_must_haves: string[];
  suggested_exclusions: string[];
  slot_diagnostics: IntakeSlotDiagnosis[];
  normalized_request: IntakeNormalizedRequest;
  warnings: string[];
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
  risks?: string[];
  purchase_checklist?: string[];
};

export type ExcludedProduct = {
  product_id: string;
  model_name: string;
  reason: string;
};

export type ComparisonRow = {
  product_id: string;
  model_name: string;
  effective_price_krw: number;
  total_score: number;
  compatibility_score: number;
  review_risk: string;
  purchase_timing: string;
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

export type PriceAlertPlan = {
  product_id: string;
  current_price_krw: number;
  target_price_krw: number;
  recheck_interval_days: number;
  channels: string[];
  trigger_reason: string;
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
      final_pick_id?: string | null;
      final_pick_model?: string | null;
      effective_price_krw?: number | null;
      confidence?: number;
      key_reasons: string[];
      watchouts: string[];
      reviewer_questions?: string[];
      copy_text: string;
    };
    excluded_products?: ExcludedProduct[];
    comparison_table?: ComparisonRow[];
    verification_flags?: string[];
    citations?: string[];
    execution_plan?: {
      product_id: string | null;
      model_name: string | null;
      headline: string;
      primary_action: string;
      urgency: string;
      price_recheck_required: boolean;
      checkout_steps: string[];
      seller_questions: string[];
      share_message: string;
    };
    price_alerts: PriceAlertPlan[];
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
  shared_at?: string | null;
  share_views?: number;
};

export type PurchaseLink = {
  link_id: string;
  report_id: string;
  product_id: string;
  model_name: string;
  seller_name: string;
  is_affiliate: boolean;
  affiliate_network: string;
  price_krw: number | null;
  shipping_fee_krw: number;
  coupon_krw: number;
  effective_price_krw: number | null;
  rank: number;
  active: boolean;
  status: OpsStatus;
  disclosure: string;
  policy_warnings: string[];
  click_path: string;
  click_count: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type PurchaseLinkRequest = {
  product_id: string | null;
  seller_name: string;
  url: string;
  is_affiliate: boolean;
  affiliate_network: string;
  price_krw: number | null;
  shipping_fee_krw: number;
  coupon_krw: number;
  rank: number;
  active: boolean;
  notes: string;
};

export type PurchaseLinkGovernance = {
  workspace_id: string;
  report_id: string;
  status: OpsStatus;
  affiliate_link_count: number;
  non_affiliate_link_count: number;
  active_link_count: number;
  click_count: number;
  summary: string;
  required_actions: string[];
  links: PurchaseLink[];
};

export type PublicReport = {
  report_id: string;
  title: string;
  top_model_name: string | null;
  final_pick_id: string | null;
  shared_at: string;
  share_views: number;
  response: AnalyzeResponse;
  purchase_links: PurchaseLink[];
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

export type AlertSubscriptionRequest = {
  trace_id: string;
  product_id: string;
  target_price_krw: number;
  channels: string[];
  contact: string;
  owner_label: string;
};

export type AlertSubscription = {
  subscription_id: string;
  trace_id: string;
  product_id: string;
  workspace_id: string;
  target_price_krw: number;
  current_price_krw: number;
  channels: string[];
  contact: string;
  owner_label: string;
  status: string;
  created_at: string;
};

export type AlertDeliveryEvent = {
  event_id: string;
  subscription_id: string;
  trace_id: string;
  product_id: string;
  workspace_id: string;
  target_price_krw: number;
  current_price_krw: number;
  delta_krw: number;
  channels: string[];
  contact_masked: string;
  delivery_status: string;
  message: string;
  created_at: string;
};

export type AlertEvaluationRequest = {
  price_overrides_krw: Record<string, number>;
  dry_run: boolean;
  limit: number;
};

export type AlertEvaluationResponse = {
  workspace_id: string;
  evaluated_count: number;
  triggered_count: number;
  dry_run: boolean;
  events: AlertDeliveryEvent[];
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

export type PurchaseOutcomeStatus =
  | "purchased"
  | "abandoned"
  | "delayed"
  | "returned";

export type PurchaseOutcomeRequest = {
  report_id: string;
  product_id: string | null;
  checkout_review_id: string | null;
  status: PurchaseOutcomeStatus;
  final_paid_price_krw: number | null;
  source_channel: string;
  reason: string;
  satisfaction: number | null;
  order_reference: string;
  notes: string;
};

export type PurchaseOutcome = {
  outcome_id: string;
  report_id: string;
  trace_id: string;
  workspace_id: string;
  product_id: string | null;
  model_name: string | null;
  checkout_review_id: string | null;
  status: PurchaseOutcomeStatus;
  final_paid_price_krw: number | null;
  expected_price_krw: number | null;
  price_delta_krw: number | null;
  source_channel: string;
  reason: string;
  satisfaction: number | null;
  order_reference_masked: string;
  conversion_value_krw: number;
  learning_signal: string;
  notes: string;
  created_at: string;
};

export type OpsStatus = "ok" | "warning" | "blocker";

export type OpsLearningInsight = {
  product_id: string;
  model_name: string | null;
  outcome_count: number;
  purchase_count: number;
  abandoned_count: number;
  delayed_count: number;
  returned_count: number;
  checkout_review_count: number;
  checkout_blocked_count: number;
  feedback_count: number;
  average_satisfaction: number;
  conversion_rate: number;
  return_rate: number;
  average_price_delta_krw: number;
  conversion_value_krw: number;
  status: OpsStatus;
  evidence: string;
  recommended_action: string;
  learning_tags: string[];
};

export type OpsLearningDashboard = {
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  summary: string;
  insight_count: number;
  top_actions: string[];
  insights: OpsLearningInsight[];
};

export type BetaReadinessCheck = {
  area: string;
  label: string;
  status: OpsStatus;
  metric: string;
  recommendation: string;
};

export type BetaReadinessDashboard = {
  workspace_id: string;
  launch_readiness_score: number;
  readiness_label: string;
  analysis_runs: number;
  saved_reports: number;
  shared_reports: number;
  public_share_views: number;
  alert_subscriptions: number;
  feedback_count: number;
  beta_leads: number;
  average_quality_score: number;
  blocker_count: number;
  average_satisfaction: number;
  purchase_intent_rate: number;
  conversion_ready_rate: number;
  checks: BetaReadinessCheck[];
  next_actions: string[];
};

export type LaunchGateCheck = {
  area: string;
  label: string;
  status: OpsStatus;
  metric: string;
  recommendation: string;
};

export type LaunchGateDashboard = {
  workspace_id: string;
  generated_at: string;
  decision: "go" | "limited_beta" | "hold" | "blocked" | string;
  status: OpsStatus;
  launch_readiness_score: number;
  readiness_label: string;
  summary: string;
  required_actions: string[];
  checks: LaunchGateCheck[];
  metric_cards: Record<string, number | string>;
};

export type BetaBacklogSummary = {
  workspace_id: string;
  total_count: number;
  open_count: number;
  in_progress_count: number;
  done_count: number;
  dismissed_count: number;
  overdue_count: number;
  due_soon_count: number;
  blocker_count: number;
  completion_summaries: string[];
  next_actions: string[];
};

export type LaunchReadinessBundle = {
  readiness: BetaReadinessDashboard;
  launch_gate: LaunchGateDashboard;
  backlog_summary: BetaBacklogSummary;
};
