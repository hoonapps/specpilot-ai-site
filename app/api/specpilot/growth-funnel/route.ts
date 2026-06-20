import { NextResponse } from "next/server";
import { getJson, postJson } from "../_client";
import type {
  GrowthEventRecord,
  GrowthEventRequest,
  GrowthFunnelDashboard,
} from "../../../types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "20";

  try {
    const dashboard = await getJson<GrowthFunnelDashboard>(
      `/growth/funnel?limit=${encodeURIComponent(limit)}`,
    );
    return NextResponse.json({ ok: true, dashboard });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "성장 퍼널 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    event?: GrowthEventRequest;
    limit?: number;
  };

  try {
    const event = await postJson<GrowthEventRecord>("/growth/events", {
      ...payload.event,
      source: payload.event?.source || "specpilot-ai-site",
      surface: payload.event?.surface || "home",
    });
    const dashboard = await getJson<GrowthFunnelDashboard>(
      `/growth/funnel?limit=${encodeURIComponent(String(payload.limit || 20))}`,
    );
    return NextResponse.json({ ok: true, event, dashboard });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "성장 이벤트 저장에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
