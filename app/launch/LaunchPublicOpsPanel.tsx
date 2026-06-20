"use client";

import { useEffect, useState } from "react";
import { Activity, BarChart3, LoaderCircle, Radar } from "lucide-react";
import type {
  LaunchPulseDashboard,
  OpsStatus,
  PublicAcquisitionHub,
  PublicConversionBoard,
} from "../types";

type Status = "loading" | "ready" | "error";

type OpsBundle = {
  board: PublicConversionBoard;
  acquisition: PublicAcquisitionHub;
  pulse: LaunchPulseDashboard;
};

const generatedAt = new Date(0).toISOString();

const fallbackAcquisition: PublicAcquisitionHub = {
  hub_version: "specpilot.public_acquisition_hub.fallback",
  workspace_id: "demo",
  generated_at: generatedAt,
  status: "warning",
  launch_score: 48,
  headline: "공개 유입 표면을 먼저 정리해야 합니다.",
  summary:
    "공개 데모, 시장 리포트, 추천 대기열, Trust Center, 요금제 관심을 같은 기준으로 보고 첫 트래픽 배정을 결정합니다.",
  primary_cta: "구매 조건 분석 시작",
  primary_cta_path: "/#analysis",
  surfaces: [
    {
      key: "public_launch",
      label: "공개 런칭룸",
      path: "/launch",
      channel: "community",
      status: "warning",
      readiness_score: 62,
      primary_cta: "분석 시작",
      proof: "데모, proof, 출시 게이트가 한 화면에 있습니다.",
      metric: "런칭룸 준비",
      next_action: "첫 방문자용 추천 CTA와 공유 CTA를 함께 노출하세요.",
    },
    {
      key: "market_reports",
      label: "시장 리포트",
      path: "/market/desktop-pc",
      channel: "search",
      status: "warning",
      readiness_score: 58,
      primary_cta: "시장 리포트 보기",
      proof: "데스크톱과 노트북 SEO 페이지가 공개되어 있습니다.",
      metric: "SEO 유입 표면",
      next_action: "카테고리 리포트에서 바로 분석 handoff를 유도하세요.",
    },
  ],
  seo_paths: ["/market/desktop-pc", "/market/laptop"],
  channel_actions: [
    "community: 런칭룸 공유 문구를 첫 주 배포 슬롯에 넣으세요.",
    "search: 시장 리포트 CTA를 분석 폼 handoff로 연결하세요.",
  ],
  next_actions: ["공개 반응 표본을 만든 뒤 전환 보드에서 트래픽 배정을 조정하세요."],
  recent_growth_events: [],
};

const fallbackPulse: LaunchPulseDashboard = {
  pulse_version: "specpilot.launch_pulse.fallback",
  workspace_id: "demo",
  generated_at: generatedAt,
  pulse_score: 42,
  status: "warning",
  headline: "공개 반응 표본을 모아야 합니다.",
  summary:
    "성장 이벤트, 추천 대기열, 요금제 관심, 구매 의향을 모아 공개 확대 여부를 판단합니다.",
  metrics: [
    {
      key: "growth_events",
      label: "성장 이벤트",
      value: 0,
      unit: "건",
      status: "warning",
      detail: "첫 반응 이벤트 수집 전",
    },
    {
      key: "referrals",
      label: "추천 대기열",
      value: 0,
      unit: "명",
      status: "warning",
      detail: "추천 확산 표본 필요",
    },
    {
      key: "pricing",
      label: "요금제 관심",
      value: 0,
      unit: "건",
      status: "warning",
      detail: "유료 수요 검증 전",
    },
  ],
  signals: [
    {
      area: "reaction",
      label: "첫 반응",
      status: "warning",
      score: 42,
      evidence: "공개 런칭룸과 추천 확산 키트를 통해 첫 이벤트를 수집합니다.",
      recommendation: "첫 20개 이벤트 전까지 CTA와 공유 문구를 계속 실험하세요.",
    },
  ],
  hot_surfaces: ["아직 수집된 표면이 없습니다."],
  top_actions: ["런칭룸, 추천 확산 키트, 요금제 관심 폼을 같은 세션에서 추적하세요."],
  recent_feedback: [],
  recent_growth_events: [],
};

const fallbackBoard: PublicConversionBoard = {
  board_version: "specpilot.public_conversion_board.fallback",
  workspace_id: "demo",
  generated_at: generatedAt,
  status: "warning",
  conversion_score: 45,
  headline: "공개 전환 표본을 먼저 확보해야 합니다.",
  summary:
    "유입, 활성화, 공유, 추천, 수익화, 안정성 단계를 한 snapshot으로 묶어 출시 직후 채널 배정을 판단합니다.",
  metric_cards: {
    analysis_runs: 0,
    public_share_views: 0,
    share_rate_percent: 0,
    referral_waitlist: 0,
    pricing_intents: 0,
    estimated_mrr_krw: 0,
    pulse_score: 42,
    readiness_score: 0,
  },
  stages: [
    {
      key: "traffic",
      label: "공개 유입",
      status: "warning",
      metric: "유입 표면 준비 중",
      insight: "공개 런칭룸과 시장 리포트가 첫 유입 표면입니다.",
      next_action: "커뮤니티와 검색 채널에 다른 CTA를 배정하세요.",
    },
    {
      key: "referral",
      label: "추천 확산",
      status: "warning",
      metric: "대기열 0명",
      insight: "보상 사다리와 리더보드로 공유 동기를 만듭니다.",
      next_action: "가입 직후 추천 코드와 다음 보상을 바로 보여주세요.",
    },
  ],
  priority_surfaces: fallbackAcquisition.surfaces,
  channel_actions: fallbackAcquisition.channel_actions,
  next_actions: ["첫 반응 이벤트와 추천 대기열 가입을 우선 확보하세요."],
  recent_growth_events: [],
};

function tone(status: OpsStatus) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function metricValue(value: number | string, key: string) {
  if (key.includes("mrr") || key.includes("krw")) {
    return `${Number(value || 0).toLocaleString("ko-KR")}원`;
  }
  return typeof value === "number" ? value.toLocaleString("ko-KR") : value;
}

export function LaunchPublicOpsPanel() {
  const [bundle, setBundle] = useState<OpsBundle>({
    board: fallbackBoard,
    acquisition: fallbackAcquisition,
    pulse: fallbackPulse,
  });
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let alive = true;

    async function loadOps() {
      setStatus("loading");
      try {
        const [boardResponse, acquisitionResponse, pulseResponse] = await Promise.all([
          fetch("/api/specpilot/public-conversion-board?limit=8"),
          fetch("/api/specpilot/acquisition-hub?limit=8"),
          fetch("/api/specpilot/launch-pulse?limit=8"),
        ]);
        if (!boardResponse.ok || !acquisitionResponse.ok || !pulseResponse.ok) {
          throw new Error("public ops rejected");
        }
        const [boardPayload, acquisitionPayload, pulsePayload] = (await Promise.all([
          boardResponse.json(),
          acquisitionResponse.json(),
          pulseResponse.json(),
        ])) as [
          { ok: boolean; board?: PublicConversionBoard },
          { ok: boolean; hub?: PublicAcquisitionHub },
          { ok: boolean; pulse?: LaunchPulseDashboard },
        ];
        if (
          !boardPayload.ok ||
          !boardPayload.board ||
          !acquisitionPayload.ok ||
          !acquisitionPayload.hub ||
          !pulsePayload.ok ||
          !pulsePayload.pulse
        ) {
          throw new Error("public ops payload rejected");
        }
        if (alive) {
          setBundle({
            board: boardPayload.board,
            acquisition: acquisitionPayload.hub,
            pulse: pulsePayload.pulse,
          });
          setStatus("ready");
        }
      } catch {
        if (alive) {
          setBundle({
            board: fallbackBoard,
            acquisition: fallbackAcquisition,
            pulse: fallbackPulse,
          });
          setStatus("error");
        }
      }
    }

    void loadOps();
    return () => {
      alive = false;
    };
  }, []);

  const { board, acquisition, pulse } = bundle;

  return (
    <section className="launchPublicSection launchPublicOps" id="launch-public-ops">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Radar size={16} />
            공개 반응 운영 패널
          </div>
          <h2>{board.headline}</h2>
          <p>{board.summary}</p>
        </div>
        <span className={`pill ${tone(board.status)}`}>
          {status === "loading" ? "조회 중" : status === "error" ? "제품 API 폴백" : `${Math.round(board.conversion_score)}점`}
        </span>
      </div>

      <div className="launchPublicOpsScoreGrid">
        <article>
          <span>전환 보드</span>
          <strong>{Math.round(board.conversion_score)}점</strong>
          <p>{board.status}</p>
        </article>
        <article>
          <span>유입 허브</span>
          <strong>{Math.round(acquisition.launch_score)}점</strong>
          <p>{acquisition.primary_cta}</p>
        </article>
        <article>
          <span>런치 Pulse</span>
          <strong>{Math.round(pulse.pulse_score)}점</strong>
          <p>{pulse.status}</p>
        </article>
      </div>

      <div className="launchPublicOpsMetricGrid">
        {Object.entries(board.metric_cards)
          .slice(0, 6)
          .map(([key, value]) => (
            <article key={key}>
              <span>{key.replaceAll("_", " ")}</span>
              <strong>{metricValue(value, key)}</strong>
            </article>
          ))}
      </div>

      <div className="launchPublicOpsStageGrid">
        {board.stages.slice(0, 6).map((stage) => (
          <article key={stage.key}>
            <div>
              <span className={`pill ${tone(stage.status)}`}>{stage.status}</span>
              <span className="pill muted">{stage.metric}</span>
            </div>
            <h3>{stage.label}</h3>
            <p>{stage.insight}</p>
            <small>{stage.next_action}</small>
          </article>
        ))}
      </div>

      <div className="launchPublicOpsSurfaceGrid">
        <article>
          <strong>
            <BarChart3 size={16} />
            우선 유입 표면
          </strong>
          <div>
            {acquisition.surfaces.slice(0, 4).map((surface) => (
              <a href={surface.path || "/launch"} key={surface.key}>
                <span>{surface.label}</span>
                <strong>{Math.round(surface.readiness_score)}점</strong>
                <small>{surface.channel} · {surface.primary_cta}</small>
              </a>
            ))}
          </div>
        </article>
        <article>
          <strong>
            <Activity size={16} />
            Pulse 액션
          </strong>
          <ul>
            {pulse.top_actions.slice(0, 5).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="launchPublicOpsFooter">
        <div>
          <strong>채널 액션</strong>
          <ul>
            {board.channel_actions.slice(0, 5).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>최근 반응 표면</strong>
          <ul>
            {(pulse.hot_surfaces.length ? pulse.hot_surfaces : ["아직 수집된 표면이 없습니다."])
              .slice(0, 5)
              .map((item) => (
                <li key={item}>{item}</li>
              ))}
          </ul>
        </div>
        {status === "loading" ? (
          <small>
            <LoaderCircle className="spin" size={14} />
            공개 반응 운영 데이터를 불러오는 중입니다.
          </small>
        ) : null}
      </div>
    </section>
  );
}
