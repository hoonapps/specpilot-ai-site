"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, LoaderCircle, Send, Trophy } from "lucide-react";
import type { OpsStatus, PublicReferralLaunchKit } from "../types";

type Status = "loading" | "ready" | "error";

const fallbackKit: PublicReferralLaunchKit = {
  kit_version: "specpilot.public_referral_launch_kit.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  headline: "가입 전에도 추천 보상 사다리를 먼저 보여줍니다.",
  summary:
    "추천 코드를 만들면 카카오톡, 커뮤니티, 이메일 문구와 보상 단계가 바로 열립니다. 주변 구매 예정자를 초대할 이유를 먼저 보여줘 공개 베타 확산을 만듭니다.",
  dashboard: {
    workspace_id: "demo",
    generated_at: new Date(0).toISOString(),
    total_referrals: 0,
    referred_signup_count: 0,
    share_rate_hint: 0,
    summary: "첫 추천 코드를 만든 사용자가 리더보드 1위가 됩니다.",
    top_referrers: [],
    latest_referrals: [],
    next_actions: ["공개 리포트와 온보딩 카드에 추천 대기열 CTA를 노출하세요."],
  },
  leaderboard: {
    leaderboard_version: "specpilot.public_referral_leaderboard.fallback",
    workspace_id: "demo",
    generated_at: new Date(0).toISOString(),
    headline: "아직 추천 경쟁이 시작되지 않았습니다.",
    summary: "첫 추천 코드를 만든 사용자가 리더보드 1위가 됩니다.",
    total_referrals: 0,
    referred_signup_count: 0,
    current_rank: null,
    current_entry: null,
    entries: [],
    next_actions: ["추천 코드를 발급받으면 내 순위와 다음 보상이 표시됩니다."],
  },
  reward_tiers: [
    {
      tier_id: "first-share",
      label: "첫 공유 성취",
      required_referrals: 1,
      benefit: "공개 베타 초대 우선순위 +10점",
      status: "preview",
    },
    {
      tier_id: "early-access",
      label: "우선 초대권",
      required_referrals: 3,
      benefit: "오픈 전 우선 분석 슬롯과 새 기능 알림",
      status: "preview",
    },
    {
      tier_id: "premium-trial",
      label: "Premium 체험",
      required_referrals: 5,
      benefit: "Premium 구매 코치 1개월 체험권",
      status: "preview",
    },
    {
      tier_id: "team-session",
      label: "팀 구매 상담",
      required_referrals: 10,
      benefit: "팀 장비 구매 표준안 1회 상담",
      status: "preview",
    },
  ],
  share_examples: [
    {
      channel: "kakao",
      label: "카카오톡",
      headline: "컴퓨터·노트북 구매 전에 AI 리포트 먼저 받아보세요",
      body: "예산과 용도만 넣으면 후보 비교, 가격 대기, 결제 전 체크리스트를 정리합니다.",
      cta: "초대 링크 열기",
      copy_text:
        "컴퓨터나 노트북 살 때 모델이 너무 많으면 SpecPilot AI 공개 베타 써보세요.\n예산·용도 기준으로 후보 비교와 구매 전 확인점을 정리해줍니다.\n/join",
    },
    {
      channel: "community",
      label: "커뮤니티",
      headline: "PC/노트북 구매 조건을 AI 리포트로 검토하는 공개 베타",
      body: "최저가만 고르지 않고 호환성, 리뷰 리스크, 구매 타이밍을 같이 봅니다.",
      cta: "무료 리포트 대기열 등록",
      copy_text:
        "[공개 베타 초대]\n컴퓨터 견적이나 노트북 구매 조건을 넣으면 후보 비교표와 구매 타이밍을 리포트로 만들어줍니다.\n/join",
    },
    {
      channel: "email",
      label: "이메일",
      headline: "SpecPilot AI 공개 베타 초대",
      body: "컴퓨터와 노트북 구매 결정을 빠르게 검토할 수 있는 AI 구매 리포트 대기열입니다.",
      cta: "공개 베타 대기열 등록",
      copy_text:
        "안녕하세요.\n컴퓨터 또는 노트북 구매 전에 후보와 리스크를 정리해주는 SpecPilot AI 공개 베타를 공유드립니다.\n/join",
    },
  ],
  cta_cards: ["내 추천 코드 만들기", "카카오톡 초대 문구 복사", "추천 리더보드 보기"],
  next_actions: ["추천 대기열 가입 직후 보상 사다리를 다시 보여주세요."],
};

function tone(status: OpsStatus) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function LaunchReferralMomentumPanel() {
  const [kit, setKit] = useState<PublicReferralLaunchKit>(fallbackKit);
  const [status, setStatus] = useState<Status>("loading");
  const [copyStatus, setCopyStatus] = useState("idle");

  useEffect(() => {
    let alive = true;

    async function loadKit() {
      setStatus("loading");
      try {
        const response = await fetch("/api/specpilot/referral-launch-kit?limit=8");
        if (!response.ok) {
          throw new Error(`referral launch kit ${response.status}`);
        }
        const payload = (await response.json()) as {
          ok: boolean;
          kit?: PublicReferralLaunchKit;
        };
        if (!payload.ok || !payload.kit) {
          throw new Error("referral launch kit rejected");
        }
        if (alive) {
          setKit(payload.kit);
          setStatus("ready");
        }
      } catch {
        if (alive) {
          setKit(fallbackKit);
          setStatus("error");
        }
      }
    }

    void loadKit();
    return () => {
      alive = false;
    };
  }, []);

  async function copyShareExample(channel: string, copyText: string) {
    try {
      await navigator.clipboard.writeText(copyText.replaceAll("/join", `${window.location.origin}/join`));
      setCopyStatus(channel);
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <section className="launchPublicSection launchReferralMomentum" id="referral-momentum">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Trophy size={16} />
            추천 확산 키트
          </div>
          <h2>{kit.headline}</h2>
          <p>{kit.summary}</p>
        </div>
        <span className={`pill ${tone(kit.status)}`}>
          {status === "loading" ? "조회 중" : status === "error" ? "제품 API 폴백" : kit.status}
        </span>
      </div>

      <div className="launchReferralMomentumMetrics">
        <article>
          <span>대기열</span>
          <strong>{kit.dashboard.total_referrals}명</strong>
          <p>{kit.dashboard.summary}</p>
        </article>
        <article>
          <span>추천 유입</span>
          <strong>{kit.dashboard.referred_signup_count}명</strong>
          <p>공유 링크로 들어온 가입</p>
        </article>
        <article>
          <span>공유 유입률</span>
          <strong>{percent(kit.dashboard.share_rate_hint)}</strong>
          <p>대기열 대비 추천 유입</p>
        </article>
      </div>

      <div className="launchReferralMomentumGrid">
        <article>
          <span>보상 사다리</span>
          <div className="launchReferralRewardPreview">
            {kit.reward_tiers.map((tier) => (
              <div key={tier.tier_id}>
                <strong>{tier.required_referrals}명</strong>
                <span>{tier.label}</span>
                <small>{tier.benefit}</small>
              </div>
            ))}
          </div>
        </article>
        <article>
          <span>공개 리더보드</span>
          <div className="launchReferralRankPreview">
            {(kit.leaderboard.entries.length
              ? kit.leaderboard.entries
              : [
                  {
                    rank: 1,
                    referral_code: "첫 추천 코드",
                    referred_signup_count: 0,
                    reward_label: "첫 추천 대기",
                  },
                ]
            )
              .slice(0, 5)
              .map((entry) => (
                <div key={`${entry.rank}-${entry.referral_code}`}>
                  <strong>{entry.rank}위</strong>
                  <span>{entry.referral_code}</span>
                  <small>
                    추천 {entry.referred_signup_count}명 · {entry.reward_label}
                  </small>
                </div>
              ))}
          </div>
          <p>{kit.leaderboard.summary}</p>
        </article>
      </div>

      <div className="launchReferralSharePreview">
        {kit.share_examples.slice(0, 3).map((variant) => (
          <article key={variant.channel}>
            <div>
              <span className="pill ok">{variant.label}</span>
              <span className="pill muted">{variant.cta}</span>
            </div>
            <h3>{variant.headline}</h3>
            <p>{variant.body}</p>
            <button
              type="button"
              onClick={() => void copyShareExample(variant.channel, variant.copy_text)}
            >
              <ClipboardCheck size={15} />
              {copyStatus === variant.channel ? "문구 복사 완료" : "공유 문구 복사"}
            </button>
          </article>
        ))}
      </div>

      <div className="launchReferralMomentumFooter">
        <div className="launchPublicPills">
          {kit.cta_cards.slice(0, 4).map((item) => (
            <span className="pill muted" key={item}>
              {item}
            </span>
          ))}
        </div>
        <a className="primaryButton" href="/join?source=launch-referral-kit">
          <Send size={16} />
          내 추천 코드 만들기
        </a>
        {status === "loading" ? (
          <small>
            <LoaderCircle className="spin" size={14} />
            추천 확산 키트를 최신 상태로 불러오는 중입니다.
          </small>
        ) : null}
      </div>
    </section>
  );
}
