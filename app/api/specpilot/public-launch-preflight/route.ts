import { NextResponse } from "next/server";
import { getCachedJson } from "../_client";
import type { PublicLaunchPreflightDashboard } from "../../../types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "8";

  try {
    const dashboard = await getCachedJson<PublicLaunchPreflightDashboard>(
      `/ops/public-launch-preflight?limit=${encodeURIComponent(limit)}`,
    );
    return NextResponse.json({ ok: true, dashboard });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "공개 출시 최종 체크 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}

