import { NextResponse } from "next/server";
import { getCachedJson } from "../_client";
import type { LaunchIncidentCenter } from "../../../types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "8";

  try {
    const center = await getCachedJson<LaunchIncidentCenter>(
      `/growth/launch-incident-center?limit=${encodeURIComponent(limit)}`,
    );
    return NextResponse.json({ ok: true, center });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "런칭 인시던트 센터 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
