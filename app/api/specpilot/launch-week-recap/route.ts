import { NextResponse } from "next/server";
import { getJson } from "../_client";
import type { LaunchWeekRecapDashboard } from "../../../types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "8";

  try {
    const dashboard = await getJson<LaunchWeekRecapDashboard>(
      `/growth/launch-week-recap?limit=${encodeURIComponent(limit)}`,
    );
    return NextResponse.json({ ok: true, dashboard });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "런칭 주간 리포트 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
