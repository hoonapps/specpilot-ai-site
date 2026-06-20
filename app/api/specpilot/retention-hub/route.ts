import { NextResponse } from "next/server";
import type { RetentionHubDashboard } from "../../../types";
import { getJson } from "../_client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "12";

  try {
    const hub = await getJson<RetentionHubDashboard>(
      `/growth/retention-hub?limit=${encodeURIComponent(limit)}`,
    );
    return NextResponse.json({ ok: true, hub });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "리텐션 허브 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
