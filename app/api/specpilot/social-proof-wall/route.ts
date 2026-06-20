import { NextResponse } from "next/server";
import type { PublicSocialProofWall } from "../../../types";
import { getJson } from "../_client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "8";

  try {
    const wall = await getJson<PublicSocialProofWall>(
      `/public/social-proof-wall?limit=${encodeURIComponent(limit)}`,
    );
    return NextResponse.json({ ok: true, wall });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "공개 소셜 proof wall 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
