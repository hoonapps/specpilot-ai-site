"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, LoaderCircle, MousePointer2, Route } from "lucide-react";
import type {
  GrowthEventRequest,
  GrowthEventType,
  OpsStatus,
  PublicLaunchActionRoute,
  PublicLaunchActionRouter,
} from "../types";

type Status = "loading" | "ready" | "error";

const fallbackRouter: PublicLaunchActionRouter = {
  router_version: "specpilot.public_launch_action_router.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  routing_score: 62,
  headline: "방문자별 다음 행동을 바로 고릅니다.",
  summary:
    "첫 구매자, 공유받은 검토자, 팀 구매자, 유료 관심자를 분석/공유/대기열/팀 상담/요금제 관심으로 분기합니다.",
  default_route_key: "first_purchase_analysis",
  routes: [
    {
      key: "first_purchase_analysis",
      persona: "첫 PC/노트북 구매자",
      trigger: "예산과 용도는 있지만 후보를 고르지 못함",
      recommended_action: "첫 문장 진단 후 분석 시작",
      cta_label: "내 조건으로 분석 시작",
      cta_path: "/#start-concierge",
      priority_score: 78,
      status: "ok",
      why_now: "가장 빠른 가치 경험은 자기 조건으로 TOP 3와 제외 후보를 보는 것입니다.",
      proof_points: ["첫 구매 진단 콘시어지", "공개 후보 비교 스냅샷", "구매 타이밍 윈도우"],
      fallback_action: "구매 실패 방지 체크리스트부터 확인",
      tracking_event: "launch_action_analysis_start",
    },
    {
      key: "shared_review",
      persona: "공유받고 들어온 검토자",
      trigger: "서비스 신뢰성을 확인 중",
      recommended_action: "반박 FAQ 확인 후 공유 문구 복사",
      cta_label: "공유 문구 복사",
      cta_path: "/#launch-share-pack",
      priority_score: 68,
      status: "warning",
      why_now: "의심이 풀린 직후 바로 공유해야 공개 반응이 확산됩니다.",
      proof_points: ["런칭 반박 FAQ", "공개 proof strip", "채널별 공유 확산팩"],
      fallback_action: "Trust Center와 공개 검증 허브 확인",
      tracking_event: "launch_action_share_copy",
    },
  ],
  quick_filters: ["처음 구매합니다", "공유받고 들어왔습니다", "팀 장비 구매입니다"],
  measurement_events: ["launch_action_route_click"],
  next_actions: ["각 route 클릭을 성장 퍼널 이벤트로 저장하세요."],
};

function tone(status: OpsStatus) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function growthEventTypeForRoute(route: PublicLaunchActionRoute): GrowthEventType {
  if (route.key === "first_purchase_analysis") {
    return "analysis_view";
  }
  if (route.key === "shared_review" || route.key === "waitlist_referral") {
    return "share_cta";
  }
  if (route.key === "team_purchase" || route.key === "paid_intent") {
    return "subscription_cta";
  }
  return "recommendation_click";
}

function buildRouteEvent(
  route: PublicLaunchActionRoute,
  interaction: "select" | "cta",
): GrowthEventRequest {
  return {
    event_type: growthEventTypeForRoute(route),
    source: "launch-action-router",
    surface: "launch-action-router",
    label: `${route.persona} ${interaction === "cta" ? "CTA 클릭" : "경로 선택"}`,
    metadata: {
      route_key: route.key,
      tracking_event: route.tracking_event,
      interaction,
      cta_path: route.cta_path,
      priority_score: Math.round(route.priority_score),
    },
  };
}

export function LaunchActionRouterPanel() {
  const [router, setRouter] = useState<PublicLaunchActionRouter>(fallbackRouter);
  const [status, setStatus] = useState<Status>("loading");
  const [activeKey, setActiveKey] = useState(fallbackRouter.default_route_key);
  const [eventMessage, setEventMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadRouter() {
      setStatus("loading");
      try {
        const response = await fetch("/api/specpilot/launch-action-router?limit=8");
        if (!response.ok) {
          throw new Error(`launch action router ${response.status}`);
        }
        const payload = (await response.json()) as {
          ok: boolean;
          router?: PublicLaunchActionRouter;
        };
        if (!payload.ok || !payload.router) {
          throw new Error("launch action router rejected");
        }
        if (alive) {
          setRouter(payload.router);
          setActiveKey(payload.router.default_route_key);
          setStatus("ready");
        }
      } catch {
        if (alive) {
          setRouter(fallbackRouter);
          setActiveKey(fallbackRouter.default_route_key);
          setStatus("error");
        }
      }
    }

    void loadRouter();
    return () => {
      alive = false;
    };
  }, []);

  const activeRoute = useMemo(
    () => router.routes.find((route) => route.key === activeKey) ?? router.routes[0],
    [activeKey, router.routes],
  );

  async function recordRouteEvent(
    route: PublicLaunchActionRoute,
    interaction: "select" | "cta",
  ) {
    try {
      const response = await fetch("/api/specpilot/growth-funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          limit: 8,
          event: buildRouteEvent(route, interaction),
        }),
      });
      if (!response.ok) {
        throw new Error(`growth funnel ${response.status}`);
      }
      setEventMessage(
        interaction === "cta"
          ? "CTA 클릭이 성장 퍼널에 기록되었습니다."
          : "방문자 경로 선택이 성장 퍼널에 기록되었습니다.",
      );
    } catch {
      setEventMessage("액션 이벤트 기록을 다시 시도하세요.");
    }
  }

  return (
    <section className="launchPublicSection launchActionRouter" id="launch-action-router">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Route size={16} />
            방문자 액션 라우터
          </div>
          <h2>{router.headline}</h2>
          <p>{router.summary}</p>
        </div>
        <div className="launchActionRouterStatus">
          <span className={`pill ${tone(router.status)}`}>
            {Math.round(router.routing_score)}점
          </span>
          {status === "loading" ? (
            <small>
              <LoaderCircle className="spin" size={14} />
              조회 중
            </small>
          ) : null}
          {status === "error" ? <small>제품 API 폴백</small> : null}
        </div>
      </div>

      <div className="launchActionRouterBody">
        <div className="launchActionRouterList">
          {router.routes.map((route) => (
            <button
              className={route.key === activeRoute?.key ? "active" : ""}
              key={route.key}
              type="button"
              onClick={() => {
                setActiveKey(route.key);
                void recordRouteEvent(route, "select");
              }}
            >
              <span className={`pill ${tone(route.status)}`}>
                {Math.round(route.priority_score)}점
              </span>
              <strong>{route.persona}</strong>
              <small>{route.trigger}</small>
            </button>
          ))}
        </div>

        {activeRoute ? (
          <article className="launchActionRouterDetail">
            <div>
              <span className={`pill ${tone(activeRoute.status)}`}>
                {activeRoute.status}
              </span>
              <span className="pill muted">{activeRoute.tracking_event}</span>
            </div>
            <h3>{activeRoute.recommended_action}</h3>
            <p>{activeRoute.why_now}</p>
            <ul>
              {activeRoute.proof_points.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="launchActionRouterCtaRow">
              <a
                className="primaryButton"
                href={activeRoute.cta_path}
                onClick={() => {
                  void recordRouteEvent(activeRoute, "cta");
                }}
              >
                {activeRoute.cta_label}
                <ArrowRight size={17} />
              </a>
              <span>
                <MousePointer2 size={14} />
                {activeRoute.fallback_action}
              </span>
            </div>
            {eventMessage ? (
              <small className="launchActionRouterEvent">{eventMessage}</small>
            ) : null}
          </article>
        ) : null}
      </div>

      <div className="launchActionRouterFooter">
        <div>
          <strong>빠른 필터</strong>
          <div className="launchPublicPills">
            {router.quick_filters.map((item) => (
              <span className="pill muted" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
        <div>
          <strong>측정 이벤트</strong>
          <ul>
            {router.measurement_events.slice(0, 5).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
