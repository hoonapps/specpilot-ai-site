import { NextResponse } from "next/server";
import type {
  Category,
  LaunchExperiment,
  LaunchExperimentDashboard,
  LaunchExperimentEvent,
  LaunchExperimentEventRequest,
  LaunchExperimentRequest,
} from "../../../types";
import { getJson, postJson } from "../_client";

async function loadDashboard(limit: string): Promise<LaunchExperimentDashboard> {
  return getJson<LaunchExperimentDashboard>(
    `/growth/launch-experiment-dashboard?limit=${encodeURIComponent(limit)}`,
  );
}

function seedExperiment(category: Category | "all"): LaunchExperimentRequest {
  const categoryValue = category === "all" ? null : category;
  const productLabel = category === "laptop" ? "노트북" : "컴퓨터";
  return {
    name: `${productLabel} 구매 실패 방지 CTA`,
    channel: "community",
    audience: category === "laptop" ? "creator_laptop_buyer" : "desktop_pc_buyer",
    hypothesis: "구매 실패 방지 proof가 빠른 진단 메시지보다 유료 관심 전환이 높다.",
    primary_metric: "subscription_cta",
    target_surface: "community-post",
    category: categoryValue,
    variants: [
      {
        label: "구매 실패 방지",
        headline: `${productLabel} 견적, 결제 전에 실패 가능성을 줄이세요`,
        body: "가격 타이밍, 호환성, 옵션 검수, 구매 결과 학습까지 한 번에 확인합니다.",
        cta_label: "구매 전 검수하기",
        cta_path: "/#start-concierge",
        allocation_percent: 50,
      },
      {
        label: "3분 빠른 진단",
        headline: `${productLabel} 견적 고민을 3분 안에 줄이세요`,
        body: "용도와 예산을 넣으면 후보와 가격 대기 여부를 바로 보여줍니다.",
        cta_label: "3분 진단 시작",
        cta_path: "/",
        allocation_percent: 50,
      },
    ],
  };
}

async function seedEvents(experiment: LaunchExperiment): Promise<LaunchExperimentEvent[]> {
  const [winner, challenger] = experiment.variants;
  if (!winner || !challenger) {
    return [];
  }
  const events: LaunchExperimentEvent[] = [];
  for (let index = 0; index < 16; index += 1) {
    events.push(
      await postJson<LaunchExperimentEvent>(
        `/growth/launch-experiments/${encodeURIComponent(
          experiment.experiment_id,
        )}/events`,
        {
          variant_id: winner.variant_id,
          event_type: "impression",
          source: "site-launch-experiment",
          surface: experiment.target_surface,
          label: `${winner.label} 노출 ${index + 1}`,
        },
      ),
    );
  }
  for (let index = 0; index < 3; index += 1) {
    events.push(
      await postJson<LaunchExperimentEvent>(
        `/growth/launch-experiments/${encodeURIComponent(
          experiment.experiment_id,
        )}/events`,
        {
          variant_id: winner.variant_id,
          event_type: "conversion",
          source: "site-launch-experiment",
          surface: experiment.target_surface,
          label: `${winner.label} 전환 ${index + 1}`,
        },
      ),
    );
  }
  for (let index = 0; index < 14; index += 1) {
    events.push(
      await postJson<LaunchExperimentEvent>(
        `/growth/launch-experiments/${encodeURIComponent(
          experiment.experiment_id,
        )}/events`,
        {
          variant_id: challenger.variant_id,
          event_type: "impression",
          source: "site-launch-experiment",
          surface: experiment.target_surface,
          label: `${challenger.label} 노출 ${index + 1}`,
        },
      ),
    );
  }
  events.push(
    await postJson<LaunchExperimentEvent>(
      `/growth/launch-experiments/${encodeURIComponent(
        experiment.experiment_id,
      )}/events`,
      {
        variant_id: challenger.variant_id,
        event_type: "conversion",
        source: "site-launch-experiment",
        surface: experiment.target_surface,
        label: `${challenger.label} 전환 1`,
      },
    ),
  );
  return events;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || "20";

  try {
    return NextResponse.json({
      ok: true,
      dashboard: await loadDashboard(limit),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "출시 실험 허브 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    action?: "seed_experiment" | "record_event";
    category?: Category | "all";
    event_type?: LaunchExperimentEventRequest["event_type"];
    experiment_id?: string;
    label?: string;
    limit?: number;
    metadata?: Record<string, string | number | boolean>;
    source?: string;
    surface?: string;
    variant_id?: string;
  };

  try {
    if (payload.action === "record_event") {
      if (!payload.experiment_id || !payload.variant_id) {
        return NextResponse.json(
          {
            ok: false,
            error: "실험 ID와 variant ID가 필요합니다.",
          },
          { status: 400 },
        );
      }
      const event = await postJson<LaunchExperimentEvent>(
        `/growth/launch-experiments/${encodeURIComponent(payload.experiment_id)}/events`,
        {
          variant_id: payload.variant_id,
          event_type: payload.event_type || "impression",
          source: payload.source || "site-launch-page",
          surface: payload.surface || "launch-page",
          label: payload.label || "런칭 페이지 CTA 이벤트",
          metadata: payload.metadata,
        },
      );
      return NextResponse.json({
        ok: true,
        event,
        dashboard: await loadDashboard(String(payload.limit || 20)),
      });
    }

    const experiment = await postJson<LaunchExperiment>(
      "/growth/launch-experiments",
      seedExperiment(payload.category || "all"),
    );
    const events = await seedEvents(experiment);
    return NextResponse.json({
      ok: true,
      experiment,
      events,
      dashboard: await loadDashboard(String(payload.limit || 20)),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "출시 실험 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
