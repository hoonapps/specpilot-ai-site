import { NextResponse } from "next/server";
import { getJson } from "../_client";
import type { PublicReferralLaunchKit } from "../../../types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = encodeURIComponent(searchParams.get("limit") || "8");

  try {
    const kit = await getJson<PublicReferralLaunchKit>(
      `/growth/referral-launch-kit?limit=${limit}`,
    );
    return NextResponse.json({
      ok: true,
      kit,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "추천 확산 키트 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
