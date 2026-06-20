"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ClipboardCheck,
  CreditCard,
  Loader2,
  MailPlus,
  Send,
  Share2,
} from "lucide-react";
import type {
  PricingOpsBundle,
  SubscriptionIntent,
  WaitlistReferral,
  WaitlistReferralDashboard,
} from "../types";

type FormStatus = "idle" | "sending" | "sent" | "error";

type ReferralPayload = {
  ok: boolean;
  referral?: WaitlistReferral;
  dashboard?: WaitlistReferralDashboard;
};

type PricingPayload = {
  ok: boolean;
  bundle?: PricingOpsBundle;
};

type LaunchConversionPanelProps = {
  initialReferralCode?: string;
  source?: string;
  surface?: string;
  title?: string;
  subtitle?: string;
};

function statusText(status: FormStatus, sent: string, error: string) {
  if (status === "sending") {
    return "저장 중입니다.";
  }
  if (status === "sent") {
    return sent;
  }
  if (status === "error") {
    return error;
  }
  return "";
}

function won(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "확인 필요";
  }
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
}

function absoluteReferralUrl(origin: string, path: string) {
  if (!path) {
    return "";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

async function recordLaunchEvent(
  event_type: "share_cta" | "subscription_cta",
  label: string,
  source: string,
  surface: string,
  metadata?: Record<string, string | number | boolean>,
) {
  await fetch("/api/specpilot/growth-funnel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: {
        event_type,
        source,
        surface,
        label,
        metadata,
      },
      limit: 20,
    }),
  });
}

export function LaunchConversionPanel({
  initialReferralCode = "",
  source = "specpilot-launch-page",
  surface = "launch",
  title = "관심을 바로 대기열과 유료 수요로 저장합니다",
  subtitle,
}: LaunchConversionPanelProps = {}) {
  const [referralStatus, setReferralStatus] = useState<FormStatus>("idle");
  const [pricingStatus, setPricingStatus] = useState<FormStatus>("idle");
  const [referral, setReferral] = useState<WaitlistReferral | null>(null);
  const [referralDashboard, setReferralDashboard] =
    useState<WaitlistReferralDashboard | null>(null);
  const [intent, setIntent] = useState<SubscriptionIntent | null>(null);
  const [pricingBundle, setPricingBundle] = useState<PricingOpsBundle | null>(null);
  const [browserOrigin, setBrowserOrigin] = useState("");
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "shared" | "error">(
    "idle",
  );
  const [referralForm, setReferralForm] = useState({
    email: "",
    persona: "first_pc_buyer",
    useCase: "컴퓨터 또는 노트북 구매 리포트를 먼저 받아보고 싶습니다.",
    referredByCode: initialReferralCode,
    contactConsent: true,
  });
  const [pricingForm, setPricingForm] = useState({
    email: "",
    planId: "premium" as "premium" | "team",
    billingCycle: "monthly" as "monthly" | "annual",
    teamSize: "1",
    maxBudget: "20000",
    purchaseTiming: "이번 달 안에 구매 의향 확인",
    contactConsent: true,
  });

  useEffect(() => {
    setBrowserOrigin(window.location.origin);
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref || initialReferralCode) {
      setReferralForm((current) => ({
        ...current,
        referredByCode: ref || initialReferralCode,
      }));
    }
  }, [initialReferralCode]);

  const referralShareUrl = referral
    ? absoluteReferralUrl(browserOrigin, referral.referral_url)
    : "";

  async function copyReferralUrl() {
    if (!referral || !referralShareUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(referralShareUrl);
      setShareStatus("copied");
      await recordLaunchEvent(
        "share_cta",
        surface === "join" ? "추천 초대 링크 복사" : "런칭 페이지 추천 링크 복사",
        source,
        surface,
        {
          referral_code: referral.referral_code,
          share_url: referralShareUrl,
        },
      );
    } catch {
      setShareStatus("error");
    }
  }

  async function shareReferralUrl() {
    if (!referral || !referralShareUrl) {
      return;
    }
    try {
      if (navigator.share) {
        await navigator.share({
          title: "SpecPilot AI 추천 초대",
          text: "컴퓨터와 노트북 구매 실패를 줄이는 AI 구매 리포트 공개 베타 초대입니다.",
          url: referralShareUrl,
        });
      } else {
        await navigator.clipboard.writeText(referralShareUrl);
      }
      setShareStatus("shared");
      await recordLaunchEvent(
        "share_cta",
        surface === "join" ? "추천 초대 링크 공유" : "런칭 페이지 추천 링크 공유",
        source,
        surface,
        {
          referral_code: referral.referral_code,
          share_url: referralShareUrl,
        },
      );
    } catch {
      setShareStatus("error");
    }
  }

  async function submitReferral(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReferralStatus("sending");

    try {
      const response = await fetch("/api/specpilot/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: referralForm.email,
          persona: referralForm.persona,
          use_case: referralForm.useCase,
          referred_by_code: referralForm.referredByCode,
          source,
          contact_consent: referralForm.contactConsent,
        }),
      });
      if (!response.ok) {
        throw new Error(`referral ${response.status}`);
      }
      const payload = (await response.json()) as ReferralPayload;
      if (!payload.ok || !payload.referral || !payload.dashboard) {
        throw new Error("referral rejected");
      }
      setReferral(payload.referral);
      setReferralDashboard(payload.dashboard);
      setShareStatus("idle");
      setReferralForm((current) => ({
        ...current,
        referredByCode: payload.referral?.referral_code || current.referredByCode,
      }));
      setReferralStatus("sent");
      await recordLaunchEvent(
        "share_cta",
        surface === "join" ? "추천 초대 페이지 대기열 가입" : "런칭 페이지 추천 대기열 가입",
        source,
        surface,
        {
          referral_code: payload.referral.referral_code,
          referred_by_code: referralForm.referredByCode,
        },
      );
    } catch {
      setReferralStatus("error");
    }
  }

  async function submitPricing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPricingStatus("sending");

    try {
      const response = await fetch("/api/specpilot/pricing-ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pricingForm.email,
          plan_id: pricingForm.planId,
          billing_cycle: pricingForm.billingCycle,
          persona:
            pricingForm.planId === "team"
              ? "team_purchase_owner"
              : "individual_buyer",
          use_case: "SpecPilot AI 공개 런칭 페이지에서 구매 의사결정 제품에 관심 등록",
          team_size: Number(pricingForm.teamSize || 1),
          max_budget_krw: Number(pricingForm.maxBudget || 0),
          feature_priorities: ["가격 알림", "공개 리포트", "결제 전 검수"],
          purchase_timing: pricingForm.purchaseTiming,
          contact_consent: pricingForm.contactConsent,
          source,
          limit: 20,
        }),
      });
      if (!response.ok) {
        throw new Error(`pricing ${response.status}`);
      }
      const payload = (await response.json()) as PricingPayload;
      if (!payload.ok || !payload.bundle || !payload.bundle.created_intent) {
        throw new Error("pricing rejected");
      }
      setIntent(payload.bundle.created_intent);
      setPricingBundle(payload.bundle);
      setPricingStatus("sent");
      await recordLaunchEvent(
        "subscription_cta",
        surface === "join" ? "추천 초대 페이지 요금제 관심 등록" : "런칭 페이지 요금제 관심 등록",
        source,
        surface,
        {
          plan_id: pricingForm.planId,
          billing_cycle: pricingForm.billingCycle,
        },
      );
    } catch {
      setPricingStatus("error");
    }
  }

  return (
    <section className="launchPublicSection launchConversionPanel">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <MailPlus size={16} />
            Launch conversion
          </div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {referralDashboard ? (
          <span className="pill ok">
            대기열 {referralDashboard.total_referrals}명
          </span>
        ) : null}
      </div>

      <div className="launchConversionGrid">
        <article className="launchConversionCard">
          <div className="sectionLabel">
            <Share2 size={16} />
            오픈 알림
          </div>
          <h3>공개 베타 대기열에 등록합니다</h3>
          <p>
            추천 코드를 발급해 공유 루프를 만들고, 제품 API의 추천 대기열
            대시보드에 바로 반영합니다.
          </p>
          <form className="conversionForm" onSubmit={submitReferral}>
            <label>
              이메일
              <input
                required
                type="email"
                placeholder="buyer@example.com"
                value={referralForm.email}
                onChange={(event) =>
                  setReferralForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </label>
            <div className="fieldGrid">
              <label>
                구매 상황
                <select
                  value={referralForm.persona}
                  onChange={(event) =>
                    setReferralForm((current) => ({
                      ...current,
                      persona: event.target.value,
                    }))
                  }
                >
                  <option value="first_pc_buyer">첫 PC 구매</option>
                  <option value="creator">크리에이터</option>
                  <option value="developer">개발/AI 실험</option>
                  <option value="team_purchase">팀 장비 구매</option>
                </select>
              </label>
              <label>
                추천 코드
                <input
                  placeholder="선택 입력"
                  value={referralForm.referredByCode}
                  onChange={(event) =>
                    setReferralForm((current) => ({
                      ...current,
                      referredByCode: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <label>
              필요한 구매 도움
              <textarea
                value={referralForm.useCase}
                onChange={(event) =>
                  setReferralForm((current) => ({
                    ...current,
                    useCase: event.target.value,
                  }))
                }
              />
            </label>
            <label className="toggleLabel">
              <input
                type="checkbox"
                checked={referralForm.contactConsent}
                onChange={(event) =>
                  setReferralForm((current) => ({
                    ...current,
                    contactConsent: event.target.checked,
                  }))
                }
              />
              오픈 알림과 추천 코드 안내에 동의
            </label>
            <button
              type="submit"
              disabled={referralStatus === "sending" || !referralForm.contactConsent}
            >
              {referralStatus === "sending" ? (
                <Loader2 className="spin" size={18} />
              ) : (
                <MailPlus size={18} />
              )}
              대기열 등록
            </button>
            <p className="formStatus">
              {statusText(
                referralStatus,
                "추천 대기열에 등록됐습니다.",
                "대기열 등록에 실패했습니다.",
              )}
            </p>
          </form>
          {referral ? (
            <div className="launchConversionResult">
              <span>추천 코드</span>
              <strong>{referral.referral_code}</strong>
              <p>{referralShareUrl || referral.referral_url}</p>
              <div className="launchReferralActions">
                <button type="button" onClick={() => void copyReferralUrl()}>
                  <ClipboardCheck size={16} />
                  초대 링크 복사
                </button>
                <button type="button" onClick={() => void shareReferralUrl()}>
                  <Send size={16} />
                  바로 공유
                </button>
              </div>
              <small>
                {shareStatus === "copied"
                  ? "초대 링크를 복사했습니다."
                  : shareStatus === "shared"
                    ? "초대 링크 공유를 실행했습니다."
                    : shareStatus === "error"
                      ? "공유에 실패했습니다. 링크를 직접 복사해 주세요."
                      : `추천 ${referral.referred_signup_count}명 · 우선순위 ${referral.priority_score}점`}
              </small>
            </div>
          ) : null}
        </article>

        <article className="launchConversionCard">
          <div className="sectionLabel">
            <CreditCard size={16} />
            유료 수요
          </div>
          <h3>요금제 관심을 바로 등록합니다</h3>
          <p>
            Premium 또는 Team 관심을 저장해 예상 MRR과 상위 요금제 신호를
            런칭룸 proof에 연결합니다.
          </p>
          <form className="conversionForm" onSubmit={submitPricing}>
            <label>
              이메일
              <input
                required
                type="email"
                placeholder="buyer@example.com"
                value={pricingForm.email}
                onChange={(event) =>
                  setPricingForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </label>
            <div className="fieldGrid">
              <label>
                요금제
                <select
                  value={pricingForm.planId}
                  onChange={(event) => {
                    const planId = event.target.value as "premium" | "team";
                    setPricingForm((current) => ({
                      ...current,
                      planId,
                      teamSize: planId === "team" ? "3" : "1",
                      maxBudget: planId === "team" ? "150000" : "20000",
                    }));
                  }}
                >
                  <option value="premium">Premium 구매 코치</option>
                  <option value="team">Team 구매 보조</option>
                </select>
              </label>
              <label>
                결제 주기
                <select
                  value={pricingForm.billingCycle}
                  onChange={(event) =>
                    setPricingForm((current) => ({
                      ...current,
                      billingCycle: event.target.value as "monthly" | "annual",
                    }))
                  }
                >
                  <option value="monthly">월 결제</option>
                  <option value="annual">연 결제</option>
                </select>
              </label>
            </div>
            <div className="fieldGrid">
              <label>
                사용자/팀 수
                <input
                  inputMode="numeric"
                  value={pricingForm.teamSize}
                  onChange={(event) =>
                    setPricingForm((current) => ({
                      ...current,
                      teamSize: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                월 최대 예산
                <input
                  inputMode="numeric"
                  value={pricingForm.maxBudget}
                  onChange={(event) =>
                    setPricingForm((current) => ({
                      ...current,
                      maxBudget: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <label>
              구매 시점
              <input
                value={pricingForm.purchaseTiming}
                onChange={(event) =>
                  setPricingForm((current) => ({
                    ...current,
                    purchaseTiming: event.target.value,
                  }))
                }
              />
            </label>
            <label className="toggleLabel">
              <input
                type="checkbox"
                checked={pricingForm.contactConsent}
                onChange={(event) =>
                  setPricingForm((current) => ({
                    ...current,
                    contactConsent: event.target.checked,
                  }))
                }
              />
              요금제 안내와 전환 실험 연락에 동의
            </label>
            <button
              type="submit"
              disabled={pricingStatus === "sending" || !pricingForm.contactConsent}
            >
              {pricingStatus === "sending" ? (
                <Loader2 className="spin" size={18} />
              ) : (
                <CreditCard size={18} />
              )}
              관심 등록
            </button>
            <p className="formStatus">
              {intent
                ? `${intent.plan_name} 등록 완료 · 예상 MRR ${won(
                    intent.estimated_mrr_krw,
                  )}`
                : statusText(
                    pricingStatus,
                    "요금제 관심이 저장됐습니다.",
                    "요금제 관심 저장에 실패했습니다.",
                  )}
            </p>
          </form>
          {pricingBundle ? (
            <div className="launchConversionResult">
              <span>수익화 신호</span>
              <strong>{pricingBundle.dashboard.intent_count}건</strong>
              <p>{pricingBundle.dashboard.summary}</p>
              <small>예상 MRR {won(pricingBundle.dashboard.estimated_mrr_krw)}</small>
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
