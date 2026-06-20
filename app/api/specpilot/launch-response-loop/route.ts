import { NextResponse } from "next/server";
import { getCachedJson } from "../_client";
import type { LaunchResponseLoopDashboard } from "../../../types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "8";

  try {
    const dashboard = await getCachedJson<LaunchResponseLoopDashboard>(
      `/growth/launch-response-loop?limit=${encodeURIComponent(limit)}`,
    );
    return NextResponse.json({ ok: true, dashboard });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "런칭 반응 후속 루프 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
