import { NextResponse } from "next/server";
import { getJson } from "../_client";
import type { LaunchPulseDashboard } from "../../../types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "12";

  try {
    const pulse = await getJson<LaunchPulseDashboard>(
      `/growth/launch-pulse?limit=${encodeURIComponent(limit)}`,
    );
    return NextResponse.json({
      ok: true,
      pulse,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "런치 반응 Pulse 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
