"use client";

import { useEffect, useState } from "react";
import { Building2, ClipboardCheck, LoaderCircle, UsersRound } from "lucide-react";
import type { OpsStatus, TeamPurchaseConsultKit } from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type Status = "loading" | "ready" | "error";

const fallbackKit: TeamPurchaseConsultKit = {
  kit_version: "specpilot.team_purchase_consult_kit.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  headline: "팀 장비 구매를 승인 가능한 표준안으로 정리합니다.",
  summary:
    "반복 PC/노트북 구매에서 조건 취합, 승인자 브리프, 결제 전 검수, 구매 결과 회수까지 한 번에 묶어 팀 구매 실패 비용을 줄입니다.",
  target_plan: {
    plan_id: "team",
    name: "Team 구매 보조",
    audience: "반복 장비 구매를 처리하는 팀 리더, 운영 담당자, IT 구매 담당자",
    monthly_price_krw: 49_000,
    annual_price_krw: 490_000,
    features: [
      "팀 구매 조건 취합",
      "승인자 브리프",
      "결제 전 검수",
      "구매 결과 회수",
    ],
    recommended_for: ["3명 이상 장비 구매", "사무용 노트북 교체", "승인 문서가 필요한 구매"],
    cta_label: "Team 상담 요청",
  },
  team_intent_count: 0,
  estimated_team_mrr_krw: 0,
  recommended_team_size: 3,
  decision_maker_brief:
    "SpecPilot AI Team은 팀 구매 담당자가 예산, 사양, A/S, 납기, 승인 근거를 한 문서로 정리해 같은 기준으로 검토하게 합니다.",
  consultation_agenda: [
    "최근 장비 구매 실패 사례와 승인 병목 확인",
    "직무별 필수 사양과 제외 조건 정리",
    "결제 전 검수와 구매 결과 회수 방식 합의",
  ],
  required_inputs: [
    "구매 대상 인원과 직무",
    "인당 예산과 총 예산",
    "필수 사양, A/S, 납기 조건",
  ],
  roi_points: [
    "반복 견적 비교 시간을 줄입니다.",
    "승인자와 실사용자가 같은 근거를 봅니다.",
    "구매 후 만족도와 반품/지연 신호를 다음 추천에 반영합니다.",
  ],
  rollout_steps: [
    "1주차: 대표 구매 조건과 승인자 브리프 정리",
    "2주차: 후보 비교와 결제 전 검수 템플릿 적용",
    "3주차: 첫 구매 결과 회수와 기준 보정",
    "4주차: 팀 구매 표준안으로 반복 운영",
  ],
  email_copy:
    "SpecPilot AI Team 구매 보조 상담을 제안드립니다.\n\n최근 장비 구매에서 예산, 사양, A/S, 납기 조건을 한 문서로 정리하고 승인자와 실사용자가 같은 근거로 검토하는 흐름을 만들어 보겠습니다.",
  cta_cards: ["Team 구매 상담 예약", "팀 구매 표준안 샘플 보기", "승인자 브리프 만들기"],
  recent_team_intents: [],
  next_actions: [
    "반복 구매/팀 구매 persona에는 Team 구매 보조 CTA를 우선 노출하세요.",
    "공개 런칭 페이지에 팀 구매 표준안 preview를 고정하세요.",
  ],
};

function tone(status: OpsStatus) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function won(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function LaunchTeamConsultPreviewPanel() {
  const [kit, setKit] = useState<TeamPurchaseConsultKit>(fallbackKit);
  const [status, setStatus] = useState<Status>("loading");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    let alive = true;

    async function loadKit() {
      setStatus("loading");
      try {
        const response = await fetch("/api/specpilot/team-consult-kit?limit=8");
        if (!response.ok) {
          throw new Error(`team consult ${response.status}`);
        }
        const payload = (await response.json()) as {
          ok: boolean;
          kit?: TeamPurchaseConsultKit;
        };
        if (!payload.ok || !payload.kit) {
          throw new Error("team consult rejected");
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

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(kit.email_copy);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <section className="launchPublicSection launchTeamConsultPreview" id="team-consult-preview">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Building2 size={16} />
            Team 구매 표준안
          </div>
          <h2>{kit.headline}</h2>
          <p>{kit.summary}</p>
        </div>
        <span className={`pill ${tone(kit.status)}`}>
          {status === "loading" ? "조회 중" : status === "error" ? "제품 API 폴백" : kit.status}
        </span>
      </div>

      <div className="launchTeamConsultPreviewHero">
        <article>
          <span>승인자 브리프</span>
          <strong>{kit.target_plan.name}</strong>
          <p>{kit.decision_maker_brief}</p>
          <div className="launchPublicPills">
            {kit.cta_cards.slice(0, 3).map((item) => (
              <span className="pill ok" key={item}>
                {item}
              </span>
            ))}
          </div>
        </article>
        <div className="launchTeamConsultPreviewStats">
          <div>
            <span>Team 리드</span>
            <strong>{kit.team_intent_count}건</strong>
          </div>
          <div>
            <span>권장 규모</span>
            <strong>{kit.recommended_team_size}명</strong>
          </div>
          <div>
            <span>Team MRR</span>
            <strong>{won(kit.estimated_team_mrr_krw)}</strong>
          </div>
        </div>
      </div>

      <div className="launchTeamConsultPreviewGrid">
        <article>
          <span>상담 안건</span>
          <ul>
            {kit.consultation_agenda.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <span>필수 입력</span>
          <ul>
            {kit.required_inputs.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <span>ROI 포인트</span>
          <ul>
            {kit.roi_points.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <span>4주 롤아웃</span>
          <ul>
            {kit.rollout_steps.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="launchTeamConsultPreviewFooter">
        <div>
          <strong>상담 제안 메일</strong>
          <p>{kit.email_copy}</p>
          <button type="button" onClick={() => void copyEmail()}>
            <ClipboardCheck size={16} />
            {copyStatus === "copied"
              ? "메일 초안 복사 완료"
              : copyStatus === "error"
                ? "복사 실패"
                : "메일 초안 복사"}
          </button>
        </div>
        <div>
          <strong>
            <UsersRound size={16} />
            Team 구매 조건으로 바로 시작
          </strong>
          <p>
            팀 규모, 직무별 필수 조건, 승인자 브리프까지 포함한 구매 분석 폼으로
            이동합니다.
          </p>
          <LaunchAnalysisLink
            className="primaryButton"
            handoff={{
              source: "launch_team_consult_preview",
              label: "Team 구매 표준안",
              query:
                "팀원 3명의 업무용 노트북을 구매하려고 합니다. 예산, 필수 사양, A/S, 납기, 승인자 브리프까지 포함해서 비교해줘.",
              category: "laptop",
              budget_krw: 4_500_000,
              purpose: "팀 업무용 노트북 교체와 승인자 보고",
              must_haves: ["업무용 안정성", "A/S", "납기", "승인자 브리프"],
              exclusions: ["출처 불명 최저가", "리퍼", "A/S 불명"],
            }}
          >
            Team 조건으로 분석 시작
          </LaunchAnalysisLink>
          {status === "loading" ? (
            <small>
              <LoaderCircle className="spin" size={14} />
              Team 상담 키트를 최신 상태로 불러오는 중입니다.
            </small>
          ) : null}
        </div>
      </div>
    </section>
  );
}
