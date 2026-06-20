import { NextResponse } from "next/server";
import { getJson } from "../_client";
import type { LaunchCommunityKit } from "../../../types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "8";

  try {
    const kit = await getJson<LaunchCommunityKit>(
      `/growth/launch-community-kit?limit=${encodeURIComponent(limit)}`,
    );
    return NextResponse.json({ ok: true, kit });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "런칭 커뮤니티 대응 키트 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
