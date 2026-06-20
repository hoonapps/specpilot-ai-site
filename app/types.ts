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

export type DemoScenario = {
  scenario_id: string;
  title: string;
  category: Category;
  persona: string;
  one_liner: string;
  request: AnalyzePayload & {
    purchase_timing: string;
  };
  expected_outcome: string;
  proof_points: string[];
  demo_cta: string;
  share_angle: string;
  tags: string[];
};

export type DemoScenarioGallery = {
  gallery_version: string;
  headline: string;
  subheadline: string;
  primary_metric: string;
  scenarios: DemoScenario[];
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

export type ScenarioOption = {
  scenario: string;
  label: string;
  product_id: string;
  model_name: string;
  effective_price_krw: number;
  total_score: number;
  why: string;
  tradeoff: string;
};

export type CriterionMatchItem = {
  check_type: string;
  criterion: string;
  status: OpsStatus;
  evidence: string;
};

export type ProductCriteriaMatch = {
  product_id: string;
  model_name: string;
  coverage_score: number;
  matched_count: number;
  warning_count: number;
  blocker_count: number;
  summary: string;
  items: CriterionMatchItem[];
};

export type PurchaseStressTest = {
  scenario: string;
  label: string;
  assumption: string;
  status: OpsStatus;
  budget_krw: number | null;
  selected_product_id: string | null;
  selected_model_name: string | null;
  price_gap_krw: number;
  impact: string;
  recommendation: string;
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
    scenario_options?: ScenarioOption[];
    criteria_matches?: ProductCriteriaMatch[];
    stress_tests?: PurchaseStressTest[];
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

export type CompletionReportTemplateRequest = {
  name: string;
  channel: string;
  subject: string;
  body: string;
  enabled: boolean;
};

export type CompletionReportTemplate = CompletionReportTemplateRequest & {
  template_id: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
};

export type CompletionRecipientGroupRequest = {
  name: string;
  channel: string;
  recipients: string[];
  unsubscribed_recipients: string[];
  unsubscribe_policy: string;
  enabled: boolean;
  description: string;
};

export type CompletionRecipientGroup = {
  group_id: string;
  workspace_id: string;
  name: string;
  channel: string;
  recipients_masked: string[];
  recipient_count: number;
  unsubscribed_count: number;
  unsubscribe_policy: string;
  enabled: boolean;
  description: string;
  created_at: string;
  updated_at: string;
};

export type CompletionReportPreview = {
  workspace_id: string;
  report_id: string;
  template_id: string | null;
  recipient_group_id: string | null;
  channel: string;
  subject: string;
  body: string;
  targets_masked: string[];
  excluded_targets_masked: string[];
  target_count: number;
  excluded_count: number;
  public_path: string;
  preview_generated_at: string;
};

export type CompletionReportDelivery = {
  delivery_id: string;
  batch_id: string;
  report_id: string;
  workspace_id: string;
  channel: string;
  target_masked: string;
  template_id: string | null;
  recipient_group_id: string | null;
  subject: string;
  status: string;
  provider_message: string;
  retry_count: number;
  next_retry_at: string | null;
  sent_at: string | null;
  engagement_count: number;
  open_count: number;
  click_count: number;
  last_engaged_at: string | null;
  tracking_token: string;
  tracking_pixel_path: string;
  tracking_click_path: string;
  created_at: string;
};

export type CompletionReportBatch = {
  batch_id: string;
  workspace_id: string;
  status: string;
  template_id: string | null;
  recipient_group_id: string | null;
  target_count: number;
  selected_count: number;
  sent_count: number;
  failed_count: number;
  dry_run: boolean;
  note: string;
  created_at: string;
  deliveries: CompletionReportDelivery[];
};

export type CompletionReportWorkflowRequest = {
  report_id: string;
  channel: string;
  template_name: string;
  subject: string;
  body: string;
  recipient_group_name: string;
  recipients: string[];
  unsubscribed_recipients: string[];
  respect_unsubscribe: boolean;
  dry_run: boolean;
  note: string;
};

export type CompletionReportWorkflowResponse = {
  template: CompletionReportTemplate;
  recipient_group: CompletionRecipientGroup;
  preview: CompletionReportPreview;
  batch: CompletionReportBatch;
  recent_batches: CompletionReportBatch[];
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

export type WaitlistReferralRequest = {
  email: string;
  persona: string;
  use_case: string;
  referred_by_code: string;
  source: string;
  contact_consent: boolean;
};

export type WaitlistReferral = {
  referral_id: string;
  workspace_id: string;
  email_masked: string;
  persona: string;
  use_case: string;
  referral_code: string;
  referred_by_code: string;
  referral_url: string;
  referred_signup_count: number;
  priority_score: number;
  contact_consent: boolean;
  source: string;
  created_at: string;
};

export type ReferralLeaderboardItem = {
  referral_code: string;
  email_masked: string;
  persona: string;
  referred_signup_count: number;
  priority_score: number;
  referral_url: string;
};

export type WaitlistReferralDashboard = {
  workspace_id: string;
  generated_at: string;
  total_referrals: number;
  referred_signup_count: number;
  share_rate_hint: number;
  summary: string;
  top_referrers: ReferralLeaderboardItem[];
  latest_referrals: WaitlistReferral[];
  next_actions: string[];
};

export type SourceTrustAssessment = {
  source_type: string;
  source_name: string;
  kind: "price" | "review" | "benchmark" | "official";
  trust_grade: "high" | "medium" | "review_required";
  confidence: number;
  freshness_minutes: number;
  cache_ttl_minutes: number;
  evidence_count: number;
  requires_human_review: boolean;
  policy_notes: string[];
};

export type TrustPolicySummary = {
  cache_policy: string;
  stale_price_action: string;
  affiliate_disclosure: string;
  fairness_rules: string[];
  review_rules: string[];
  source_assessments: SourceTrustAssessment[];
};

export type PrivacyDataCategory = {
  category: string;
  label: string;
  stored_fields: string[];
  masking: string;
  retention: string;
  user_control: string;
};

export type PrivacyPolicySummary = {
  policy_version: string;
  headline: string;
  data_minimization: string;
  public_report_policy: string;
  contact_policy: string;
  retention_policy: string;
  user_controls: string[];
  prohibited_data: string[];
  data_categories: PrivacyDataCategory[];
};

export type TrustCenterGate = {
  area: string;
  label: string;
  status: OpsStatus;
  public_message: string;
  evidence: string[];
  buyer_impact: string;
  next_action: string;
};

export type TrustCenterDashboard = {
  policy_version: string;
  generated_at: string;
  headline: string;
  public_summary: string;
  overall_status: OpsStatus;
  trust_policy: TrustPolicySummary;
  privacy_policy: PrivacyPolicySummary;
  public_commitments: string[];
  buyer_rights: string[];
  operational_gates: TrustCenterGate[];
  risk_disclosures: string[];
  escalation_paths: string[];
  next_actions: string[];
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

export type PricingPlan = {
  plan_id: string;
  name: string;
  audience: string;
  monthly_price_krw: number;
  annual_price_krw: number;
  features: string[];
  recommended_for: string[];
  cta_label: string;
};

export type PricingDashboard = {
  workspace_id: string;
  generated_at: string;
  intent_count: number;
  premium_intent_count: number;
  team_intent_count: number;
  estimated_mrr_krw: number;
  annualized_revenue_krw: number;
  average_budget_krw: number;
  top_plan_id: string | null;
  top_plan_name: string | null;
  readiness_status: OpsStatus;
  summary: string;
  next_actions: string[];
  plans: PricingPlan[];
  recent_intents: SubscriptionIntent[];
};

export type PricingOpsBundle = {
  dashboard: PricingDashboard;
  plans: PricingPlan[];
  intents: SubscriptionIntent[];
  created_intent?: SubscriptionIntent | null;
};

export type MarketReportPick = {
  category: Category;
  product_id: string;
  model_name: string;
  role_label: string;
  effective_price_krw: number;
  target_price_krw: number;
  price_band: string;
  stock_status: string;
  source_type: string;
  benchmark_summary: string;
  risk_status: OpsStatus;
  fit_tags: string[];
  reasons: string[];
  watchouts: string[];
};

export type MarketPriceSegment = {
  category: Category;
  label: string;
  min_price_krw: number;
  max_price_krw: number;
  recommended_budget_krw: number;
  summary: string;
  representative_product_ids: string[];
};

export type MarketRiskSignal = {
  title: string;
  status: OpsStatus;
  affected_product_ids: string[];
  evidence: string;
  action: string;
};

export type MarketTrendCard = {
  title: string;
  category: Category | null;
  signal: string;
  evidence: string;
  recommendation: string;
};

export type CategoryMarketReport = {
  workspace_id: string;
  generated_at: string;
  report_month: string;
  category_filter: Category | null;
  headline: string;
  summary: string;
  total_candidates: number;
  picks: MarketReportPick[];
  price_segments: MarketPriceSegment[];
  risk_signals: MarketRiskSignal[];
  trend_cards: MarketTrendCard[];
  workspace_signals: Record<string, number | string>;
  publishing_checklist: string[];
};

export type PublicCategoryMarketReport = {
  category: Category;
  slug: string;
  canonical_path: string;
  title: string;
  description: string;
  share_text: string;
  seo_keywords: string[];
  cta_cards: string[];
  report: CategoryMarketReport;
};

export type PurchaseOnboardingStep = {
  title: string;
  description: string;
  required_inputs: string[];
  output: string;
};

export type PurchaseOnboardingPlaybook = {
  playbook_id: string;
  category: Category;
  persona: string;
  title: string;
  description: string;
  hero_query: string;
  purpose: string;
  budget_hint_krw: number;
  must_haves: string[];
  exclusions: string[];
  readiness_slots: string[];
  steps: PurchaseOnboardingStep[];
  trust_gates: string[];
  recommended_plan_id: string;
  cta_label: string;
  cta_anchor: string;
};

export type GrowthEventType =
  | "analysis_view"
  | "recommendation_click"
  | "alternative_click"
  | "share_cta"
  | "alert_cta"
  | "purchase_link_cta"
  | "subscription_cta"
  | "feedback_cta";

export type GrowthEventRequest = {
  event_type: GrowthEventType;
  trace_id?: string | null;
  report_id?: string | null;
  product_id?: string | null;
  source?: string;
  surface?: string;
  label?: string;
  metadata?: Record<string, number | string | boolean>;
};

export type GrowthEventRecord = Required<
  Omit<GrowthEventRequest, "metadata">
> & {
  event_id: string;
  workspace_id: string;
  metadata: Record<string, number | string | boolean>;
  created_at: string;
};

export type GrowthFunnelStep = {
  key: GrowthEventType;
  label: string;
  event_count: number;
  unique_traces: number;
  conversion_rate: number;
  status: OpsStatus;
  recommendation: string;
};

export type GrowthFunnelDashboard = {
  workspace_id: string;
  generated_at: string;
  total_events: number;
  unique_traces: number;
  activation_rate: number;
  share_rate: number;
  alert_rate: number;
  paid_intent_rate: number;
  status: OpsStatus;
  summary: string;
  steps: GrowthFunnelStep[];
  top_surfaces: string[];
  next_actions: string[];
  recent_events: GrowthEventRecord[];
};

export type LaunchCopyVariant = {
  variant_id: string;
  channel: string;
  headline: string;
  body: string;
  cta_label: string;
  cta_path: string;
  tracking_event: GrowthEventType;
};

export type LaunchChannelPlaybook = {
  channel: string;
  audience: string;
  angle: string;
  post_timing: string;
  copy_variants: LaunchCopyVariant[];
  checklist: string[];
  success_metric: string;
};

export type LaunchCampaignKit = {
  kit_version: string;
  generated_at: string;
  category: Category | null;
  audience: string;
  offer: string;
  positioning: string;
  hero_message: string;
  primary_cta: string;
  primary_cta_path: string;
  proof_points: string[];
  target_segments: string[];
  channel_playbooks: LaunchChannelPlaybook[];
  cta_experiments: string[];
  launch_checklist: string[];
  risk_disclosures: string[];
  measurement_plan: string[];
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

export type ReviewStatus = "pending" | "approved" | "rejected";

export type ReviewQueueItem = {
  review_id: string;
  source: SourceCandidate;
  status: ReviewStatus;
  reason: string;
  created_at: string;
  resolved_at: string | null;
  reviewer: string | null;
};

export type SourceUrlIngestResponse = {
  candidate: SourceCandidate;
  review_item?: ReviewQueueItem | null;
  fetched_live: boolean;
  extraction_notes: string[];
};

export type SourceMonitorRequest = {
  url: string;
  category: Category;
  kind: "price";
  expected_model: string;
  source_name: string;
  seller: string | null;
  cadence_minutes: number;
  active: boolean;
  html_snapshot: string;
};

export type SourceMonitor = {
  monitor_id: string;
  workspace_id: string;
  url: string;
  category: Category;
  kind: "price";
  expected_model: string;
  source_name: string;
  seller: string | null;
  cadence_minutes: number;
  active: boolean;
  last_run_at: string | null;
  last_status: string;
  last_source_id: string | null;
  failure_count: number;
  created_at: string;
  updated_at: string;
};

export type SourceRefreshRun = {
  run_id: string;
  monitor_id: string;
  workspace_id: string;
  status: string;
  source_id: string | null;
  review_id: string | null;
  fetched_live: boolean;
  message: string;
  created_at: string;
};

export type SourceRefreshResponse = {
  selected_count: number;
  succeeded_count: number;
  failed_count: number;
  candidates: SourceCandidate[];
  review_items: ReviewQueueItem[];
  runs: SourceRefreshRun[];
};

export type SourceScheduleItem = {
  monitor: SourceMonitor;
  due: boolean;
  next_due_at: string | null;
  overdue_minutes: number;
};

export type SourceSchedulePreview = {
  workspace_id: string;
  due_count: number;
  upcoming_count: number;
  generated_at: string;
  due: SourceScheduleItem[];
  upcoming: SourceScheduleItem[];
};

export type ReviewDecision = {
  review_id: string;
  status: ReviewStatus;
  reviewer: string;
  note: string;
  resolved_at: string;
};

export type SourceMonitorOpsBundle = {
  monitors: SourceMonitor[];
  schedule: SourceSchedulePreview;
  runs: SourceRefreshRun[];
  pending_reviews: ReviewQueueItem[];
  created_monitor?: SourceMonitor | null;
  refresh?: SourceRefreshResponse | null;
  decision?: ReviewDecision | null;
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
  contact_masked: string;
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

export type AlertNotificationChannelRequest = {
  channel: string;
  display_name: string;
  target: string;
  enabled: boolean;
  retry_limit: number;
};

export type AlertNotificationChannel = {
  channel_id: string;
  workspace_id: string;
  channel: string;
  display_name: string;
  target_masked: string;
  enabled: boolean;
  retry_limit: number;
  created_at: string;
  updated_at: string;
};

export type AlertDispatchResponse = {
  workspace_id: string;
  selected_count: number;
  sent_count: number;
  failed_count: number;
  dry_run: boolean;
  attempts: AlertDeliveryAttempt[];
};

export type AlertDeliveryAttempt = {
  attempt_id: string;
  event_id: string;
  subscription_id: string;
  workspace_id: string;
  channel: string;
  contact_masked: string;
  delivery_status: string;
  provider_message: string;
  retry_count: number;
  next_retry_at: string | null;
  created_at: string;
};

export type AlertOpsBundle = {
  channels: AlertNotificationChannel[];
  events: AlertDeliveryEvent[];
  deliveries: AlertDeliveryAttempt[];
  created_channel?: AlertNotificationChannel | null;
  dispatch?: AlertDispatchResponse | null;
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

export type PurchaseDecisionBoardItem = {
  report_id: string;
  trace_id: string;
  title: string;
  owner_label: string;
  category: Category;
  purpose: string;
  top_model_name: string | null;
  final_pick_id: string | null;
  decision_label: string;
  board_status: OpsStatus;
  recommended_action: string;
  effective_price_krw: number | null;
  target_price_krw: number | null;
  price_gap_krw: number | null;
  confidence: number;
  checkout_blocked: boolean;
  has_purchase_outcome: boolean;
  has_purchase_links: boolean;
  is_shared: boolean;
  next_steps: string[];
  risk_flags: string[];
  created_at: string;
  updated_at: string;
};

export type PurchaseDecisionBoard = {
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  summary: string;
  report_count: number;
  ready_to_buy_count: number;
  price_wait_count: number;
  checkout_blocked_count: number;
  missing_outcome_count: number;
  total_ready_value_krw: number;
  next_actions: string[];
  items: PurchaseDecisionBoardItem[];
};

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

export type OpsRegressionPeriod = {
  label: string;
  run_count: number;
  average_quality_score: number;
  average_cost_krw: number;
  warning_count: number;
  blocker_count: number;
  started_at: string | null;
  ended_at: string | null;
};

export type ProviderReliabilityMetric = {
  provider_id: string | null;
  provider_name: string;
  host: string;
  fetch_count: number;
  allowed_count: number;
  blocked_count: number;
  blocked_rate: number;
  status: OpsStatus;
  recommendation: string;
};

export type OpsRegressionDashboard = {
  workspace_id: string;
  status: OpsStatus;
  summary: string;
  window_size: number;
  recent: OpsRegressionPeriod;
  previous: OpsRegressionPeriod;
  quality_delta: number;
  cost_delta_krw: number;
  cost_delta_rate: number;
  provider_reliability: ProviderReliabilityMetric[];
  risk_flags: string[];
  next_actions: string[];
};

export type ObservabilityExportRecord = {
  export_id: string;
  workspace_id: string;
  trace_id: string;
  destination: string;
  status: string;
  span_count: number;
  quality_score: number;
  payload: Record<string, unknown>;
  provider_message: string;
  retry_count: number;
  dispatched_at: string | null;
  next_retry_at: string | null;
  created_at: string;
};

export type ObservabilityDispatchResponse = {
  workspace_id: string;
  selected_count: number;
  sent_count: number;
  failed_count: number;
  dry_run: boolean;
  exports: ObservabilityExportRecord[];
};

export type ObservabilityOpsBundle = {
  regression: OpsRegressionDashboard;
  exports: ObservabilityExportRecord[];
  created_export?: ObservabilityExportRecord | null;
  dispatch?: ObservabilityDispatchResponse | null;
};

export type IntegrationCategory =
  | "price_api"
  | "marketplace"
  | "official_store"
  | "review_feed"
  | "benchmark"
  | "email"
  | "sms"
  | "webhook"
  | "observability"
  | "affiliate"
  | "scheduler";

export type IntegrationStatus = "mock" | "configured" | "verified" | "blocked";

export type IntegrationProviderRequest = {
  provider_name: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  credential_status: string;
  rate_limit_per_hour: number;
  retention_days: number;
  endpoint: string;
  evidence: string;
  notes: string;
};

export type IntegrationProvider = IntegrationProviderRequest & {
  integration_id: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
  last_verified_at: string | null;
};

export type IntegrationReadinessCheck = {
  category: IntegrationCategory;
  label: string;
  status: OpsStatus;
  provider_name: string | null;
  metric: string;
  recommendation: string;
};

export type IntegrationReadinessDashboard = {
  workspace_id: string;
  generated_at: string;
  readiness_score: number;
  status: OpsStatus;
  verified_count: number;
  configured_count: number;
  blocker_count: number;
  mock_count: number;
  required_count: number;
  summary: string;
  required_actions: string[];
  providers: IntegrationProvider[];
  checks: IntegrationReadinessCheck[];
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

export type BetaBacklogStatus = "open" | "in_progress" | "done" | "dismissed";

export type BetaCohortRequest = {
  name: string;
  scenario: string;
  category: Category;
  target_persona: string;
  target_size: number;
  success_metric: string;
  keywords: string[];
  notes: string;
  active: boolean;
};

export type BetaCohort = BetaCohortRequest & {
  cohort_id: string;
  workspace_id: string;
  lead_count: number;
  feedback_count: number;
  average_satisfaction: number;
  purchase_intent_rate: number;
  readiness_score: number;
  created_at: string;
  updated_at: string;
};

export type BetaBacklogItem = {
  backlog_id: string;
  workspace_id: string;
  source_type: string;
  source_id: string;
  severity: OpsStatus;
  title: string;
  evidence: string;
  suggested_action: string;
  status: BetaBacklogStatus;
  assignee: string;
  action_note: string;
  action_updated_at: string | null;
  sla_due_at: string | null;
  is_overdue: boolean;
  completed_at: string | null;
  completion_summary: string;
  created_at: string;
};

export type BetaBacklogAction = {
  backlog_id: string;
  workspace_id: string;
  status: BetaBacklogStatus;
  assignee: string;
  note: string;
  sla_due_at: string | null;
  completed_at: string | null;
  completion_summary: string;
  updated_at: string;
};

export type BetaCohortReport = {
  cohort: BetaCohort;
  generated_at: string;
  summary: string;
  metric_cards: Record<string, number | string>;
  recommendations: string[];
  backlog: BetaBacklogItem[];
  markdown: string;
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
  data_governance: DataGovernanceDashboard;
};

export type DataInventoryItem = {
  table_name: string;
  label: string;
  record_count: number;
  pii_scope: string;
  retention_days: number;
  earliest_created_at: string | null;
  latest_created_at: string | null;
  status: OpsStatus;
  recommendation: string;
};

export type DataGovernanceDashboard = {
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  summary: string;
  total_records: number;
  raw_contact_surfaces: number;
  masked_contact_surfaces: number;
  retention_actions: string[];
  deletion_controls: string[];
  inventory: DataInventoryItem[];
};

export type DataGovernanceBundle = {
  dashboard: DataGovernanceDashboard;
};

export type BetaOpsBundle = {
  cohorts: BetaCohort[];
  backlog: BetaBacklogItem[];
  backlog_summary: BetaBacklogSummary;
  created_cohort?: BetaCohort | null;
  cohort_report?: BetaCohortReport | null;
  backlog_action?: BetaBacklogAction | null;
};
