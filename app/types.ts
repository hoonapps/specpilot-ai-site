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

export type ReportShareAssetVariant = {
  channel: string;
  label: string;
  headline: string;
  body: string;
  cta: string;
  copy_text: string;
};

export type ReportShareAssets = {
  asset_version: string;
  workspace_id: string;
  report_id: string;
  share_token: string | null;
  public_path: string | null;
  generated_at: string;
  headline: string;
  subheadline: string;
  og_title: string;
  og_description: string;
  visual_card_text: string[];
  hashtags: string[];
  reviewer_questions: string[];
  variants: ReportShareAssetVariant[];
  next_actions: string[];
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

export type PublicReportConversionCta = {
  cta_version: string;
  headline: string;
  body: string;
  primary_label: string;
  primary_path: string;
  secondary_label: string;
  secondary_path: string;
  source: string;
  surface: string;
  report_ref: string;
  proof_points: string[];
  next_actions: string[];
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
  conversion_cta: PublicReportConversionCta;
};

export type AnalyzeAndShareResponse = {
  analysis: AnalyzeResponse;
  saved_report: SaveReportResponse | null;
  share: ShareReportResponse | null;
  share_assets: ReportShareAssets | null;
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

export type PublicReferralLeaderboardEntry = {
  rank: number;
  referral_code: string;
  email_masked: string;
  persona: string;
  referred_signup_count: number;
  priority_score: number;
  reward_label: string;
  status: "current" | "ranked" | string;
};

export type PublicReferralLeaderboard = {
  leaderboard_version: string;
  workspace_id: string;
  generated_at: string;
  headline: string;
  summary: string;
  total_referrals: number;
  referred_signup_count: number;
  current_rank: number | null;
  current_entry: PublicReferralLeaderboardEntry | null;
  entries: PublicReferralLeaderboardEntry[];
  next_actions: string[];
};

export type ReferralShareKitVariant = {
  channel: string;
  label: string;
  headline: string;
  body: string;
  cta: string;
  copy_text: string;
};

export type ReferralShareKit = {
  kit_version: string;
  workspace_id: string;
  referral_code: string;
  referral_url: string;
  generated_at: string;
  headline: string;
  subheadline: string;
  hashtags: string[];
  variants: ReferralShareKitVariant[];
  next_actions: string[];
};

export type ReferralRewardTier = {
  tier_id: string;
  label: string;
  required_referrals: number;
  benefit: string;
  status: "achieved" | "next" | "locked" | string;
};

export type ReferralRewardProgress = {
  reward_version: string;
  workspace_id: string;
  referral_code: string;
  referral_url: string;
  generated_at: string;
  referred_signup_count: number;
  headline: string;
  summary: string;
  progress_percent: number;
  current_tier: ReferralRewardTier | null;
  next_tier: ReferralRewardTier | null;
  tiers: ReferralRewardTier[];
  next_actions: string[];
};

export type PublicReferralLaunchKit = {
  kit_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  headline: string;
  summary: string;
  dashboard: WaitlistReferralDashboard;
  leaderboard: PublicReferralLeaderboard;
  reward_tiers: ReferralRewardTier[];
  share_examples: ReferralShareKitVariant[];
  cta_cards: string[];
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

export type BuyerTrustBadge = {
  badge_id: string;
  label: string;
  status: OpsStatus;
  summary: string;
  evidence: string[];
  buyer_impact: string;
};

export type PublicBuyerTrustKit = {
  kit_version: string;
  generated_at: string;
  status: OpsStatus;
  headline: string;
  summary: string;
  trust_badges: BuyerTrustBadge[];
  buyer_rights: string[];
  risk_disclosures: string[];
  plain_language_guarantee: string;
  proof_strip: string[];
  primary_cta_label: string;
  primary_cta_path: string;
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

export type TeamPurchaseConsultKit = {
  kit_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  headline: string;
  summary: string;
  target_plan: PricingPlan;
  team_intent_count: number;
  estimated_team_mrr_krw: number;
  recommended_team_size: number;
  decision_maker_brief: string;
  consultation_agenda: string[];
  required_inputs: string[];
  roi_points: string[];
  rollout_steps: string[];
  email_copy: string;
  cta_cards: string[];
  recent_team_intents: SubscriptionIntent[];
  next_actions: string[];
};

export type PricingOpsBundle = {
  dashboard: PricingDashboard;
  plans: PricingPlan[];
  intents: SubscriptionIntent[];
  team_consult: TeamPurchaseConsultKit;
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

export type BuyerChecklistItem = {
  item_id: string;
  label: string;
  status: OpsStatus;
  why_it_matters: string;
  user_input_hint: string;
  failure_if_missing: string;
};

export type BuyerChecklistSection = {
  section_id: string;
  title: string;
  summary: string;
  items: BuyerChecklistItem[];
};

export type PublicBuyerChecklist = {
  checklist_version: string;
  generated_at: string;
  category: Category;
  persona: string;
  budget_krw: number;
  headline: string;
  summary: string;
  readiness_score: number;
  budget_fit: string;
  primary_cta_label: string;
  primary_cta_anchor: string;
  analysis_prefill: string;
  sections: BuyerChecklistSection[];
  red_flags: string[];
  evidence_to_capture: string[];
  share_copy: string;
  next_actions: string[];
};

export type BuyerPersonaQuizOption = {
  option_id: string;
  label: string;
  description: string;
};

export type BuyerPersonaQuizQuestion = {
  question_id: string;
  title: string;
  helper: string;
  options: BuyerPersonaQuizOption[];
};

export type PublicBuyerPersonaQuiz = {
  quiz_version: string;
  generated_at: string;
  headline: string;
  summary: string;
  questions: BuyerPersonaQuizQuestion[];
  result_endpoint: string;
  next_actions: string[];
};

export type BuyerPersonaQuizAnswer = {
  question_id: string;
  option_id: string;
};

export type BuyerPersonaQuizRequest = {
  answers: BuyerPersonaQuizAnswer[];
  source: string;
};

export type BuyerPersonaQuizResult = {
  result_version: string;
  generated_at: string;
  persona_id: string;
  persona_label: string;
  category: Category;
  recommended_plan_id: string;
  recommended_budget_krw: number;
  confidence_score: number;
  headline: string;
  summary: string;
  analysis_prefill: string;
  checklist_path: string;
  primary_cta_label: string;
  primary_cta_path: string;
  proof_points: string[];
  share_copy: string;
  next_actions: string[];
};

export type MistakeCostRiskOption = {
  risk_id: string;
  label: string;
  default_weight: number;
  description: string;
};

export type PublicMistakeCostCalculator = {
  calculator_version: string;
  generated_at: string;
  headline: string;
  summary: string;
  default_category: Category;
  default_budget_krw: number;
  default_quantity: number;
  risk_options: MistakeCostRiskOption[];
  result_endpoint: string;
  next_actions: string[];
};

export type MistakeCostCalculatorRequest = {
  category: Category;
  budget_krw: number;
  quantity: number;
  urgency: string;
  selected_risks: string[];
  source: string;
};

export type MistakeCostLineItem = {
  item_id: string;
  label: string;
  estimated_cost_krw: number;
  prevention: string;
};

export type MistakeCostCalculatorResult = {
  result_version: string;
  generated_at: string;
  category: Category;
  budget_krw: number;
  quantity: number;
  urgency: string;
  estimated_mistake_cost_krw: number;
  protected_value_krw: number;
  risk_score: number;
  risk_level: "ok" | "warning" | "blocker" | string;
  headline: string;
  summary: string;
  line_items: MistakeCostLineItem[];
  analysis_prefill: string;
  primary_cta_label: string;
  primary_cta_path: string;
  share_copy: string;
  next_actions: string[];
};

export type BuyerChallengeStep = {
  step_id: string;
  title: string;
  action: string;
  proof: string;
};

export type BuyerChallengeShareVariant = {
  channel: string;
  label: string;
  headline: string;
  body: string;
  cta: string;
  copy_text: string;
};

export type PublicBuyerChallengeKit = {
  kit_version: string;
  generated_at: string;
  category: Category;
  budget_krw: number;
  persona: string;
  headline: string;
  summary: string;
  challenge_title: string;
  challenge_steps: BuyerChallengeStep[];
  analysis_prefill: string;
  checklist_path: string;
  mistake_cost_path: string;
  persona_quiz_path: string;
  hashtags: string[];
  proof_points: string[];
  share_variants: BuyerChallengeShareVariant[];
  primary_cta_label: string;
  primary_cta_path: string;
  next_actions: string[];
};

export type PublicSpecRiskScanner = {
  scanner_version: string;
  generated_at: string;
  headline: string;
  summary: string;
  default_category: Category;
  default_budget_krw: number;
  result_endpoint: string;
  example_request: Record<string, string | number>;
  required_evidence: string[];
  next_actions: string[];
};

export type SpecRiskScannerRequest = {
  category: Category;
  product_title: string;
  option_text: string;
  cart_total_krw: number | null;
  budget_krw: number;
  expected_cpu: string;
  expected_gpu: string;
  expected_ram_gb: number | null;
  expected_storage_gb: number | null;
  expected_os: string;
  evidence_text: string;
  source: string;
};

export type SpecRiskCheck = {
  check_id: string;
  label: string;
  status: OpsStatus;
  expected: string;
  observed: string;
  recommendation: string;
};

export type SpecRiskScannerResult = {
  result_version: string;
  generated_at: string;
  category: Category;
  product_title: string;
  budget_krw: number;
  cart_total_krw: number | null;
  verdict: "ready" | "verify" | "hold" | string;
  readiness_score: number;
  headline: string;
  summary: string;
  checks: SpecRiskCheck[];
  blocker_count: number;
  warning_count: number;
  missing_evidence: string[];
  analysis_prefill: string;
  share_copy: string;
  purchase_safety_brief: string;
  seller_questions: string[];
  approval_brief: string;
  capture_checklist: string[];
  checkout_next_step: string;
  primary_cta_label: string;
  primary_cta_path: string;
  next_actions: string[];
};

export type ListingDecoderRequest = {
  category: Category;
  product_title: string;
  option_text: string;
  budget_krw: number;
  cart_total_krw: number | null;
  purpose: string;
  source: string;
};

export type ListingSpecFact = {
  slot: string;
  label: string;
  value: string;
  status: OpsStatus;
  evidence: string;
  recommendation: string;
};

export type PublicListingDecoderKit = {
  kit_version: string;
  generated_at: string;
  category: Category;
  product_title: string;
  option_text: string;
  normalized_title: string;
  confidence_score: number;
  headline: string;
  summary: string;
  decoded_specs: ListingSpecFact[];
  blocker_count: number;
  warning_count: number;
  ambiguity_notes: string[];
  seller_questions: string[];
  scanner_prefill: SpecRiskScannerRequest;
  analysis_prefill: string;
  share_copy: string;
  primary_cta_label: string;
  primary_cta_path: string;
  next_actions: string[];
};

export type SetupCompatibilityRequest = {
  category: Category;
  cpu: string;
  gpu: string;
  ram_gb: number | null;
  storage_gb: number | null;
  monitor_resolution: string;
  psu_watt: number | null;
  form_factor: string;
  weight_kg: number | null;
  battery_wh: number | null;
  budget_krw: number;
  purpose: string;
  source: string;
};

export type SetupCompatibilityCheck = {
  check_id: string;
  label: string;
  status: OpsStatus;
  observed: string;
  recommendation: string;
  impact: string;
};

export type PublicSetupCompatibilityKit = {
  kit_version: string;
  generated_at: string;
  category: Category;
  compatibility_score: number;
  verdict: "ready" | "verify" | "hold" | string;
  headline: string;
  summary: string;
  blocker_count: number;
  warning_count: number;
  checks: SetupCompatibilityCheck[];
  recommended_changes: string[];
  scanner_prefill: SpecRiskScannerRequest;
  analysis_prefill: string;
  share_copy: string;
  primary_cta_label: string;
  primary_cta_path: string;
  next_actions: string[];
};

export type ShoppingCartItemInput = {
  title: string;
  option_text: string;
  price_krw: number | null;
  quantity: number;
  seller: string;
  url: string;
};

export type ShoppingCartIntakeRequest = {
  category: Category;
  cart_text: string;
  items: ShoppingCartItemInput[];
  budget_krw: number;
  purpose: string;
  source: string;
};

export type ShoppingCartLine = {
  line_id: string;
  title: string;
  normalized_role: string;
  quantity: number;
  price_krw: number | null;
  status: OpsStatus;
  evidence: string;
  recommendation: string;
};

export type PublicShoppingCartIntakeKit = {
  kit_version: string;
  generated_at: string;
  category: Category;
  item_count: number;
  cart_total_krw: number | null;
  budget_delta_krw: number | null;
  readiness_score: number;
  verdict: "ready" | "verify" | "hold" | string;
  headline: string;
  summary: string;
  blocker_count: number;
  warning_count: number;
  lines: ShoppingCartLine[];
  detected_slots: string[];
  missing_slots: string[];
  duplicate_warnings: string[];
  seller_questions: string[];
  scanner_prefill: SpecRiskScannerRequest;
  approval_prefill: PurchaseApprovalBriefRequest;
  analysis_prefill: string;
  share_copy: string;
  primary_cta_label: string;
  primary_cta_path: string;
  next_actions: string[];
};

export type PurchaseApprovalBriefRequest = {
  category: Category;
  product_title: string;
  verdict: string;
  budget_krw: number;
  cart_total_krw: number | null;
  blocker_count: number;
  warning_count: number;
  key_reasons: string[];
  missing_evidence: string[];
  audience: string;
  decision_deadline: string;
  source: string;
};

export type ApprovalVoteOption = {
  option_id: string;
  label: string;
  status: OpsStatus;
  description: string;
  when_to_choose: string;
};

export type ApprovalCopyVariant = {
  channel: string;
  label: string;
  copy_text: string;
  cta_label: string;
};

export type PublicPurchaseApprovalBriefKit = {
  kit_version: string;
  generated_at: string;
  category: Category;
  product_title: string;
  verdict: "ready" | "verify" | "hold" | string;
  priority: OpsStatus;
  headline: string;
  summary: string;
  decision_rule: string;
  approval_question: string;
  buyer_brief: string;
  reject_reasons: string[];
  approve_conditions: string[];
  evidence_checklist: string[];
  vote_options: ApprovalVoteOption[];
  copy_variants: ApprovalCopyVariant[];
  analysis_prefill: string;
  share_copy: string;
  primary_cta_label: string;
  primary_cta_path: string;
  next_actions: string[];
};

export type SellerEvidenceRequest = {
  category: Category;
  product_title: string;
  seller_name: string;
  verdict: string;
  budget_krw: number;
  cart_total_krw: number | null;
  risk_terms: string[];
  missing_evidence: string[];
  must_confirm: string[];
  answer_text: string;
  source: string;
};

export type SellerEvidenceQuestion = {
  question_id: string;
  label: string;
  status: OpsStatus;
  question: string;
  required_answer: string;
  why_it_matters: string;
};

export type SellerAnswerRubric = {
  rubric_id: string;
  label: string;
  status: OpsStatus;
  pass_signal: string;
  fail_signal: string;
};

export type PublicSellerEvidenceKit = {
  kit_version: string;
  generated_at: string;
  category: Category;
  product_title: string;
  seller_name: string;
  priority: OpsStatus;
  answer_status: OpsStatus;
  headline: string;
  summary: string;
  seller_message: string;
  questions: SellerEvidenceQuestion[];
  answer_rubric: SellerAnswerRubric[];
  evidence_checklist: string[];
  approval_prefill: PurchaseApprovalBriefRequest;
  analysis_prefill: string;
  share_copy: string;
  primary_cta_label: string;
  primary_cta_path: string;
  next_actions: string[];
};

export type PurchaseAftercareRequest = {
  category: Category;
  product_title: string;
  seller_name: string;
  purchase_date: string;
  delivered_date: string;
  final_paid_price_krw: number | null;
  expected_price_krw: number | null;
  return_window_days: number;
  warranty_months: number;
  order_reference: string;
  issues: string[];
  source: string;
};

export type AftercareDeadline = {
  deadline_id: string;
  label: string;
  status: OpsStatus;
  due_date: string;
  action: string;
  reminder_copy: string;
};

export type AftercareMessage = {
  channel: string;
  label: string;
  copy_text: string;
  cta_label: string;
};

export type PublicPurchaseAftercareKit = {
  kit_version: string;
  generated_at: string;
  category: Category;
  product_title: string;
  seller_name: string;
  priority: OpsStatus;
  headline: string;
  summary: string;
  return_deadline: string;
  warranty_deadline: string;
  price_delta_krw: number | null;
  deadlines: AftercareDeadline[];
  capture_checklist: string[];
  issue_triage: string[];
  outcome_prefill: string;
  messages: AftercareMessage[];
  analysis_prefill: string;
  share_copy: string;
  primary_cta_label: string;
  primary_cta_path: string;
  next_actions: string[];
};

export type FirstBootSetupRequest = {
  category: Category;
  product_title: string;
  os_name: string;
  primary_purpose: string;
  monitor_resolution: string;
  connection_type: string;
  peripherals: string[];
  missing_drivers: string[];
  observed_issues: string[];
  warranty_registered: boolean;
  bios_updated: boolean;
  source: string;
};

export type FirstBootSetupTask = {
  task_id: string;
  label: string;
  status: OpsStatus;
  instruction: string;
  evidence: string;
};

export type FirstBootMessage = {
  channel: string;
  label: string;
  copy_text: string;
  cta_label: string;
};

export type PublicFirstBootSetupKit = {
  kit_version: string;
  generated_at: string;
  category: Category;
  product_title: string;
  priority: OpsStatus;
  setup_score: number;
  headline: string;
  summary: string;
  first_boot_checklist: FirstBootSetupTask[];
  driver_checklist: FirstBootSetupTask[];
  benchmark_plan: string[];
  issue_triage: string[];
  warranty_actions: string[];
  messages: FirstBootMessage[];
  analysis_prefill: string;
  share_copy: string;
  primary_cta_label: string;
  primary_cta_path: string;
  next_actions: string[];
};

export type UpgradeReadinessRequest = {
  category: Category;
  product_title: string;
  cpu_platform: string;
  gpu_name: string;
  ram_gb: number;
  ram_slots_total: number;
  ram_slots_used: number;
  storage_slots_total: number;
  storage_slots_used: number;
  psu_watt: number | null;
  case_form_factor: string;
  laptop_ram_upgradeable: boolean | null;
  laptop_storage_upgradeable: boolean | null;
  target_years: number;
  planned_upgrades: string[];
  constraints: string[];
  budget_krw: number | null;
  source: string;
};

export type UpgradeReadinessItem = {
  item_id: string;
  label: string;
  status: OpsStatus;
  finding: string;
  recommendation: string;
};

export type UpgradePathOption = {
  path_id: string;
  label: string;
  priority: OpsStatus;
  timing: string;
  estimated_cost_krw: number;
  expected_gain: string;
  evidence_to_confirm: string[];
};

export type PublicUpgradeReadinessKit = {
  kit_version: string;
  generated_at: string;
  category: Category;
  product_title: string;
  priority: OpsStatus;
  readiness_score: number;
  horizon_months: number;
  headline: string;
  summary: string;
  readiness_items: UpgradeReadinessItem[];
  upgrade_paths: UpgradePathOption[];
  lifecycle_risks: string[];
  seller_questions: string[];
  analysis_prefill: string;
  share_copy: string;
  primary_cta_label: string;
  primary_cta_path: string;
  next_actions: string[];
};

export type OwnershipCostRequest = {
  category: Category;
  product_title: string;
  purchase_price_krw: number;
  expected_years: number;
  resale_rate_percent: number | null;
  yearly_maintenance_krw: number;
  planned_upgrade_cost_krw: number;
  warranty_months: number;
  downtime_days: number;
  daily_value_krw: number;
  brand_resale_signal: string;
  condition_risks: string[];
  source: string;
};

export type OwnershipCostLine = {
  line_id: string;
  label: string;
  amount_krw: number;
  explanation: string;
};

export type OwnershipCostScenario = {
  scenario_id: string;
  label: string;
  resale_value_krw: number;
  net_cost_krw: number;
  monthly_cost_krw: number;
  status: OpsStatus;
};

export type PublicOwnershipCostKit = {
  kit_version: string;
  generated_at: string;
  category: Category;
  product_title: string;
  priority: OpsStatus;
  ownership_score: number;
  expected_resale_value_krw: number;
  net_cost_krw: number;
  monthly_cost_krw: number;
  headline: string;
  summary: string;
  cost_lines: OwnershipCostLine[];
  scenarios: OwnershipCostScenario[];
  risk_flags: string[];
  seller_questions: string[];
  analysis_prefill: string;
  share_copy: string;
  primary_cta_label: string;
  primary_cta_path: string;
  next_actions: string[];
};

export type WarrantyReturnRequest = {
  category: Category;
  product_title: string;
  seller_name: string;
  purchase_price_krw: number;
  return_window_days: number;
  exchange_window_days: number;
  dead_on_arrival_days: number;
  warranty_months: number;
  opened_box_return_allowed: boolean | null;
  warranty_provider: string;
  warranty_transferable: boolean | null;
  return_shipping_fee_krw: number;
  restocking_fee_percent: number;
  policy_text: string;
  risk_terms: string[];
  source: string;
};

export type WarrantyReturnCheck = {
  check_id: string;
  label: string;
  status: OpsStatus;
  finding: string;
  recommendation: string;
};

export type WarrantyReturnCostLine = {
  line_id: string;
  label: string;
  amount_krw: number;
  explanation: string;
};

export type PublicWarrantyReturnKit = {
  kit_version: string;
  generated_at: string;
  category: Category;
  product_title: string;
  seller_name: string;
  priority: OpsStatus;
  protection_score: number;
  estimated_return_cost_krw: number;
  headline: string;
  summary: string;
  policy_checks: WarrantyReturnCheck[];
  cost_lines: WarrantyReturnCostLine[];
  seller_questions: string[];
  evidence_checklist: string[];
  buyer_message: string;
  analysis_prefill: string;
  share_copy: string;
  primary_cta_label: string;
  primary_cta_path: string;
  next_actions: string[];
};

export type CheckoutNudgeRequest = {
  category: Category;
  product_title: string;
  verdict: string;
  budget_krw: number;
  cart_total_krw: number | null;
  blocker_count: number;
  warning_count: number;
  missing_evidence: string[];
  source: string;
};

export type CheckoutNudgeStep = {
  step_id: string;
  label: string;
  timing: string;
  trigger: string;
  message: string;
  cta_label: string;
  cta_path: string;
  event_name: string;
};

export type PublicCheckoutNudgeKit = {
  kit_version: string;
  generated_at: string;
  category: Category;
  product_title: string;
  verdict: string;
  priority: OpsStatus;
  headline: string;
  summary: string;
  next_best_action: string;
  reminder_copy: string;
  analysis_prefill: string;
  waitlist_prefill: string;
  nudges: CheckoutNudgeStep[];
  proof_points: string[];
  primary_cta_label: string;
  primary_cta_path: string;
};

export type SpecRescueRequest = {
  category: Category;
  product_title: string;
  verdict: string;
  budget_krw: number;
  cart_total_krw: number | null;
  blocker_count: number;
  warning_count: number;
  missing_evidence: string[];
  purpose: string;
  source: string;
};

export type SpecRescueAlternative = {
  alternative_id: string;
  product_id: string;
  model_name: string;
  role_label: string;
  effective_price_krw: number;
  price_delta_krw: number;
  status: OpsStatus;
  option_summary: string;
  rescue_reason: string;
  tradeoff: string;
  evidence: string[];
  search_query: string;
  cta_label: string;
};

export type PublicSpecRescueKit = {
  kit_version: string;
  generated_at: string;
  category: Category;
  product_title: string;
  verdict: string;
  rescue_priority: OpsStatus;
  headline: string;
  summary: string;
  decision_rule: string;
  seller_message: string;
  alternatives: SpecRescueAlternative[];
  analysis_prefill: string;
  share_copy: string;
  primary_cta_label: string;
  primary_cta_path: string;
  next_actions: string[];
};

export type CandidateCompareItem = {
  product_id: string;
  model_name: string;
  category: Category;
  role_label: string;
  effective_price_krw: number;
  price_gap_krw: number;
  score: number;
  status: OpsStatus;
  option_summary: string;
  fit_summary: string;
  reasons: string[];
  watchouts: string[];
  evidence: string[];
  cta_label: string;
};

export type CandidateCompareAxis = {
  axis_id: string;
  label: string;
  winner_product_id: string | null;
  summary: string;
};

export type CandidateCompareScenario = {
  scenario: string;
  label: string;
  product_id: string;
  model_name: string;
  why: string;
  tradeoff: string;
};

export type PublicCandidateCompare = {
  compare_version: string;
  generated_at: string;
  category: Category;
  budget_krw: number;
  purpose: string;
  headline: string;
  summary: string;
  winner_product_id: string | null;
  winner_reason: string;
  items: CandidateCompareItem[];
  axes: CandidateCompareAxis[];
  scenarios: CandidateCompareScenario[];
  analysis_prefill: string;
  share_copy: string;
  primary_cta_label: string;
  primary_cta_path: string;
  next_actions: string[];
};

export type PublicDealTimingWindow = {
  timing_version: string;
  generated_at: string;
  category: Category;
  budget_krw: number;
  purpose: string;
  headline: string;
  summary: string;
  lead_product_id: string | null;
  lead_label: string;
  buy_now_count: number;
  wait_count: number;
  hold_count: number;
  target_savings_krw: number;
  windows: DealWindow[];
  analysis_prefill: string;
  share_copy: string;
  primary_cta_label: string;
  primary_cta_path: string;
  next_actions: string[];
};

export type PriceWatchCandidate = {
  product_id: string;
  model_name: string;
  status: "ok" | "warning" | "blocker";
  current_price_krw: number;
  target_price_krw: number;
  target_gap_krw: number;
  alert_threshold_krw: number;
  cadence: string;
  alert_reason: string;
  notification_copy: string;
  decision_rule: string;
  fallback_action: string;
};

export type PublicPriceWatchKit = {
  watch_version: string;
  generated_at: string;
  category: Category;
  budget_krw: number;
  purpose: string;
  headline: string;
  summary: string;
  watched_count: number;
  immediate_buy_count: number;
  total_target_savings_krw: number;
  primary_watch_product_id: string | null;
  primary_watch_label: string;
  candidates: PriceWatchCandidate[];
  alert_script: string;
  analysis_prefill: string;
  share_copy: string;
  primary_cta_label: string;
  primary_cta_path: string;
  next_actions: string[];
};

export type StartConciergeMilestone = {
  step: string;
  title: string;
  status: OpsStatus;
  detail: string;
  next_action: string;
};

export type StartConciergeAction = {
  label: string;
  target: string;
  action_type: string;
  reason: string;
};

export type PurchaseStartConcierge = {
  concierge_version: string;
  category: Category;
  readiness_score: number;
  headline: string;
  summary: string;
  primary_action: StartConciergeAction;
  matched_playbook: PurchaseOnboardingPlaybook;
  diagnosis: IntakeDiagnosisResponse;
  milestones: StartConciergeMilestone[];
  quick_actions: StartConciergeAction[];
  proof_points: string[];
  conversion_prompt: string;
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

export type LaunchDistributionSlot = {
  slot_id: string;
  phase: string;
  channel: string;
  timing: string;
  audience: string;
  priority: number;
  status: OpsStatus;
  headline: string;
  body: string;
  cta_label: string;
  cta_path: string;
  copy_text: string;
  tracking_event: GrowthEventType;
  success_metric: string;
  proof_to_attach: string[];
  checklist: string[];
};

export type LaunchDistributionPlan = {
  plan_version: string;
  workspace_id: string;
  generated_at: string;
  category: Category | null;
  audience: string;
  launch_window: string;
  status: OpsStatus;
  distribution_score: number;
  headline: string;
  summary: string;
  primary_cta: string;
  priority_channels: string[];
  experiment_to_promote: string;
  slots: LaunchDistributionSlot[];
  measurement_events: string[];
  risk_controls: string[];
  next_actions: string[];
};

export type LaunchExperimentVariantRequest = {
  label: string;
  headline: string;
  body: string;
  cta_label: string;
  cta_path: string;
  allocation_percent: number;
};

export type LaunchExperimentRequest = {
  name: string;
  channel: string;
  audience: string;
  hypothesis: string;
  primary_metric: GrowthEventType;
  target_surface: string;
  category: Category | null;
  variants: LaunchExperimentVariantRequest[];
};

export type LaunchExperimentEventRequest = {
  variant_id: string;
  event_type: "impression" | "conversion";
  trace_id?: string | null;
  source: string;
  surface: string;
  label: string;
  metadata?: Record<string, string | number | boolean>;
};

export type LaunchExperimentEvent = {
  event_id: string;
  experiment_id: string;
  workspace_id: string;
  variant_id: string;
  event_type: string;
  trace_id: string | null;
  source: string;
  surface: string;
  label: string;
  metadata: Record<string, string | number | boolean>;
  created_at: string;
};

export type LaunchExperimentVariant = {
  variant_id: string;
  label: string;
  headline: string;
  body: string;
  cta_label: string;
  cta_path: string;
  allocation_percent: number;
  impressions: number;
  conversions: number;
  conversion_rate: number;
  status: OpsStatus;
  evidence: string;
  recommendation: string;
};

export type LaunchExperiment = {
  experiment_id: string;
  workspace_id: string;
  name: string;
  channel: string;
  audience: string;
  hypothesis: string;
  primary_metric: GrowthEventType;
  target_surface: string;
  category: Category | null;
  status: OpsStatus;
  winning_variant_id: string | null;
  created_at: string;
  updated_at: string;
  variants: LaunchExperimentVariant[];
};

export type LaunchExperimentDashboard = {
  dashboard_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  experiment_count: number;
  active_experiment_count: number;
  total_impressions: number;
  total_conversions: number;
  conversion_rate: number;
  best_variant_label: string;
  summary: string;
  experiments: LaunchExperiment[];
  recommended_experiments: LaunchExperiment[];
  next_actions: string[];
  recent_events: LaunchExperimentEvent[];
};

export type LaunchPulseMetric = {
  key: string;
  label: string;
  value: number | string;
  unit: string;
  status: OpsStatus;
  detail: string;
};

export type LaunchPulseSignal = {
  area: string;
  label: string;
  status: OpsStatus;
  score: number;
  evidence: string;
  recommendation: string;
};

export type LaunchPulseDashboard = {
  pulse_version: string;
  workspace_id: string;
  generated_at: string;
  pulse_score: number;
  status: OpsStatus;
  headline: string;
  summary: string;
  metrics: LaunchPulseMetric[];
  signals: LaunchPulseSignal[];
  hot_surfaces: string[];
  top_actions: string[];
  recent_feedback: FeedbackRecord[];
  recent_growth_events: GrowthEventRecord[];
};

export type LaunchWarRoomSignal = {
  key: string;
  label: string;
  status: OpsStatus;
  metric: string;
  evidence: string;
  owner: string;
  next_action: string;
};

export type LaunchWarRoomPlay = {
  play_id: string;
  label: string;
  status: OpsStatus;
  trigger: string;
  action: string;
  expected_impact: string;
  owner: string;
};

export type LaunchWarRoomDashboard = {
  war_room_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  command_score: number;
  decision: string;
  headline: string;
  summary: string;
  metric_cards: Record<string, number | string>;
  signals: LaunchWarRoomSignal[];
  plays: LaunchWarRoomPlay[];
  escalation_paths: string[];
  next_actions: string[];
};

export type LaunchIncidentSignal = {
  key: string;
  label: string;
  status: OpsStatus;
  owner: string;
  metric: string;
  impact: string;
  first_response: string;
};

export type LaunchIncidentRunbookStep = {
  step: string;
  owner: string;
  trigger: string;
  action: string;
  success_signal: string;
};

export type LaunchIncidentCenter = {
  center_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  incident_level: string;
  incident_score: number;
  commander_brief: string;
  summary: string;
  metric_cards: Record<string, number | string>;
  signals: LaunchIncidentSignal[];
  runbook: LaunchIncidentRunbookStep[];
  escalation_paths: string[];
  tracking_events: string[];
  next_actions: string[];
};

export type LaunchWeekRecapWin = {
  key: string;
  label: string;
  metric: string;
  evidence: string;
  repeat_action: string;
};

export type LaunchWeekRecapRisk = {
  key: string;
  label: string;
  status: OpsStatus;
  evidence: string;
  mitigation: string;
  owner: string;
};

export type LaunchWeekRecapDashboard = {
  recap_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  recap_score: number;
  headline: string;
  summary: string;
  metric_cards: Record<string, number | string>;
  wins: LaunchWeekRecapWin[];
  risks: LaunchWeekRecapRisk[];
  channel_moves: string[];
  founder_update: string;
  next_actions: string[];
};

export type LaunchCommunityReplyTemplate = {
  key: string;
  label: string;
  trigger: string;
  tone: string;
  copy_text: string;
  cta_label: string;
  cta_path: string;
  tracking_event: string;
};

export type LaunchCommunityRisk = {
  key: string;
  label: string;
  status: OpsStatus;
  evidence: string;
  response_rule: string;
};

export type LaunchCommunityKit = {
  kit_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  response_score: number;
  headline: string;
  summary: string;
  metric_cards: Record<string, number | string>;
  pinned_update: string;
  reply_templates: LaunchCommunityReplyTemplate[];
  risks: LaunchCommunityRisk[];
  tracking_events: string[];
  next_actions: string[];
};

export type LaunchMediaAsset = {
  key: string;
  label: string;
  kind: string;
  path: string;
  usage: string;
  alt_text: string;
  tracking_event: string;
};

export type LaunchMediaPitch = {
  channel: string;
  audience: string;
  headline: string;
  body: string;
  cta_label: string;
  cta_path: string;
  copy_text: string;
};

export type LaunchMediaKit = {
  kit_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  media_score: number;
  headline: string;
  summary: string;
  metric_cards: Record<string, number | string>;
  hero_statement: string;
  proof_points: string[];
  assets: LaunchMediaAsset[];
  pitches: LaunchMediaPitch[];
  usage_guidelines: string[];
  tracking_events: string[];
  next_actions: string[];
};

export type LaunchActivationOffer = {
  key: string;
  label: string;
  audience: string;
  trigger: string;
  cta_label: string;
  cta_path: string;
  value_prop: string;
  proof: string;
  friction: string;
  tracking_event: string;
  priority_score: number;
};

export type LaunchActivationOfferDashboard = {
  offer_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  activation_score: number;
  headline: string;
  summary: string;
  metric_cards: Record<string, number | string>;
  primary_offer: LaunchActivationOffer;
  offers: LaunchActivationOffer[];
  handoff_prompts: string[];
  proof_points: string[];
  tracking_events: string[];
  next_actions: string[];
};

export type LaunchResponseFollowup = {
  key: string;
  label: string;
  owner: string;
  priority: string;
  trigger: string;
  action: string;
  reply_copy: string;
  proof_policy: string;
  tracking_event: string;
};

export type LaunchResponseLoopDashboard = {
  loop_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  response_score: number;
  headline: string;
  summary: string;
  metric_cards: Record<string, number | string>;
  followups: LaunchResponseFollowup[];
  proof_candidates: string[];
  founder_reply_queue: string[];
  product_fix_queue: string[];
  tracking_events: string[];
  recent_feedback: FeedbackRecord[];
  recent_growth_events: GrowthEventRecord[];
  next_actions: string[];
};

export type PublicAcquisitionSurface = {
  key: string;
  label: string;
  path: string;
  channel: string;
  status: OpsStatus;
  readiness_score: number;
  primary_cta: string;
  proof: string;
  metric: string;
  next_action: string;
};

export type PublicAcquisitionHub = {
  hub_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  launch_score: number;
  headline: string;
  summary: string;
  primary_cta: string;
  primary_cta_path: string;
  surfaces: PublicAcquisitionSurface[];
  seo_paths: string[];
  channel_actions: string[];
  next_actions: string[];
  recent_growth_events: GrowthEventRecord[];
};

export type PublicConversionStage = {
  key: string;
  label: string;
  status: OpsStatus;
  metric: string;
  insight: string;
  next_action: string;
};

export type PublicConversionBoard = {
  board_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  conversion_score: number;
  headline: string;
  summary: string;
  metric_cards: Record<string, number | string>;
  stages: PublicConversionStage[];
  priority_surfaces: PublicAcquisitionSurface[];
  channel_actions: string[];
  next_actions: string[];
  recent_growth_events: GrowthEventRecord[];
};

export type PublicProofAsset = {
  key: string;
  label: string;
  status: OpsStatus;
  metric: string;
  proof: string;
  public_path: string;
  cta_label: string;
  next_action: string;
};

export type PublicObjectionAnswer = {
  question: string;
  answer: string;
  evidence: string[];
};

export type PublicObjectionCard = {
  key: string;
  question: string;
  status: OpsStatus;
  short_answer: string;
  proof_points: string[];
  evidence_paths: string[];
  cta_label: string;
  cta_path: string;
};

export type PublicObjectionComparison = {
  criterion: string;
  price_comparison_sites: string;
  specpilot_ai: string;
  why_it_matters: string;
};

export type PublicLaunchObjectionKit = {
  kit_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  objection_score: number;
  headline: string;
  summary: string;
  primary_cta: string;
  primary_cta_path: string;
  objections: PublicObjectionCard[];
  comparisons: PublicObjectionComparison[];
  trust_badges: string[];
  channel_replies: string[];
  next_actions: string[];
};

export type PublicLaunchShareVariant = {
  channel: string;
  label: string;
  audience: string;
  share_url: string;
  headline: string;
  body: string;
  cta_label: string;
  copy_text: string;
  tracking_event: string;
  proof_points: string[];
  disclosure: string;
};

export type PublicLaunchSharePack = {
  pack_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  share_score: number;
  headline: string;
  summary: string;
  primary_url: string;
  primary_copy: string;
  variants: PublicLaunchShareVariant[];
  proof_strip: string[];
  trust_disclosures: string[];
  measurement_events: string[];
  next_actions: string[];
};

export type PublicLaunchActionRoute = {
  key: string;
  persona: string;
  trigger: string;
  recommended_action: string;
  cta_label: string;
  cta_path: string;
  priority_score: number;
  status: OpsStatus;
  why_now: string;
  proof_points: string[];
  fallback_action: string;
  tracking_event: string;
};

export type PublicLaunchActionRouter = {
  router_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  routing_score: number;
  headline: string;
  summary: string;
  default_route_key: string;
  routes: PublicLaunchActionRoute[];
  quick_filters: string[];
  measurement_events: string[];
  next_actions: string[];
};

export type PublicProofEvidence = {
  title: string;
  status: OpsStatus;
  audience: string;
  proof: string;
  source_path: string;
  reuse_hint: string;
};

export type PublicProofHub = {
  proof_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  proof_score: number;
  headline: string;
  summary: string;
  hero_proof_strip: string[];
  metric_cards: Record<string, number | string>;
  trust_badges: string[];
  evidence_kit: PublicProofEvidence[];
  proof_assets: PublicProofAsset[];
  objection_answers: PublicObjectionAnswer[];
  cta_cards: string[];
  public_paths: string[];
  recent_feedback: FeedbackRecord[];
  next_actions: string[];
};

export type PublicSocialProofItem = {
  proof_id: string;
  kind: string;
  title: string;
  body: string;
  metric: string;
  persona: string;
  source_label: string;
  rating: number | null;
  status: OpsStatus;
  created_at: string | null;
};

export type PublicSocialProofWall = {
  wall_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  proof_score: number;
  headline: string;
  summary: string;
  metric_cards: Record<string, number | string>;
  proof_strip: string[];
  items: PublicSocialProofItem[];
  trust_notes: string[];
  cta_cards: string[];
  next_actions: string[];
};

export type PublicLaunchRoomCard = {
  key: string;
  title: string;
  status: OpsStatus;
  metric: string;
  body: string;
  cta_label: string;
  cta_path: string;
};

export type PublicLaunchRoomMarketLink = {
  category: Category;
  title: string;
  path: string;
  share_text: string;
  lead_pick: string;
  risk_count: number;
};

export type PublicLaunchRoom = {
  room_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  launch_score: number;
  headline: string;
  hero_message: string;
  share_title: string;
  share_text: string;
  primary_cta: string;
  primary_cta_path: string;
  proof_strip: string[];
  demo_cards: PublicLaunchRoomCard[];
  launch_cards: PublicLaunchRoomCard[];
  market_links: PublicLaunchRoomMarketLink[];
  secondary_ctas: string[];
  channel_posts: string[];
  next_actions: string[];
};

export type RetentionSignal = {
  key: string;
  label: string;
  status: OpsStatus;
  score: number;
  metric: string;
  insight: string;
  next_action: string;
};

export type RetentionPlay = {
  play_id: string;
  label: string;
  audience: string;
  trigger: string;
  channel: string;
  cta_label: string;
  cta_target: string;
  expected_impact: string;
  evidence: string[];
};

export type RetentionHubDashboard = {
  hub_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  retention_score: number;
  headline: string;
  summary: string;
  metric_cards: Record<string, number | string>;
  signals: RetentionSignal[];
  plays: RetentionPlay[];
  next_actions: string[];
  recent_events: GrowthEventRecord[];
  recent_advisor_answers: ReportAdvisorAnswer[];
  recent_purchase_outcomes: PurchaseOutcome[];
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

export type PublicLaunchSmokeCheck = {
  key: string;
  label: string;
  status: OpsStatus;
  public_path: string;
  expected_signal: string;
  metric: string;
  recommendation: string;
};

export type PublicLaunchSmokeDashboard = {
  smoke_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  smoke_score: number;
  headline: string;
  summary: string;
  ok_count: number;
  warning_count: number;
  blocker_count: number;
  publish_ready_paths: string[];
  checks: PublicLaunchSmokeCheck[];
  measurement_events: string[];
  next_actions: string[];
};

export type PublicLaunchPreflightCheck = {
  key: string;
  label: string;
  status: OpsStatus;
  owner: string;
  metric: string;
  evidence: string;
  required_action: string;
  public_path: string;
};

export type PublicLaunchPreflightDashboard = {
  preflight_version: string;
  workspace_id: string;
  generated_at: string;
  status: OpsStatus;
  go_decision: string;
  preflight_score: number;
  headline: string;
  summary: string;
  metric_cards: Record<string, number | string>;
  checks: PublicLaunchPreflightCheck[];
  launch_brief: string[];
  tracking_events: string[];
  next_actions: string[];
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
