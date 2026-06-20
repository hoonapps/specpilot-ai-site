import { NextResponse } from "next/server";
import { getJson } from "../_client";
import type { OpsLearningDashboard } from "../../../types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "8";

  try {
    const dashboard = await getJson<OpsLearningDashboard>(
      `/ops/learning-insights?limit=${encodeURIComponent(limit)}`,
    );
    return NextResponse.json({
      ok: true,
      dashboard,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "학습 인사이트 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
