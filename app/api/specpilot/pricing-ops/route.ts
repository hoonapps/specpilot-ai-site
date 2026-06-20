import { NextResponse } from "next/server";
import { getJson, postJson } from "../_client";
import type {
  PricingDashboard,
  PricingOpsBundle,
  PricingPlan,
  SubscriptionIntent,
  SubscriptionIntentRequest,
} from "../../../types";

async function loadBundle(limit = "20"): Promise<PricingOpsBundle> {
  const safeLimit = encodeURIComponent(limit);
  const [dashboard, plans, intents] = await Promise.all([
    getJson<PricingDashboard>("/ops/pricing-dashboard"),
    getJson<PricingPlan[]>("/pricing/plans"),
    getJson<SubscriptionIntent[]>(`/billing/subscription-intents?limit=${safeLimit}`),
  ]);

  return {
    dashboard,
    plans,
    intents,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || "20";

  try {
    return NextResponse.json({
      ok: true,
      bundle: await loadBundle(limit),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "수익화 준비도 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as SubscriptionIntentRequest & {
    limit?: number;
  };

  try {
    const createdIntent = await postJson<SubscriptionIntent>(
      "/billing/subscription-intents",
      payload,
    );
    return NextResponse.json({
      ok: true,
      bundle: {
        ...(await loadBundle(String(payload.limit || 20))),
        created_intent: createdIntent,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "요금제 관심 등록과 수익화 준비도 갱신에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
