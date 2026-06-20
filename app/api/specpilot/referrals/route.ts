import { NextResponse } from "next/server";
import { getJson, postJson } from "../_client";
import type {
  ReferralShareKit,
  WaitlistReferral,
  WaitlistReferralDashboard,
  WaitlistReferralRequest,
} from "../../../types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "20";

  try {
    const dashboard = await getJson<WaitlistReferralDashboard>(
      `/growth/referral-dashboard?limit=${encodeURIComponent(limit)}`,
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
            : "추천 대기열 대시보드 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as WaitlistReferralRequest;

  try {
    const referral = await postJson<WaitlistReferral>(
      "/growth/waitlist-referrals",
      payload,
    );
    const dashboard = await getJson<WaitlistReferralDashboard>(
      "/growth/referral-dashboard?limit=20",
    );
    const shareKit = await getJson<ReferralShareKit>(
      `/growth/referral-share-kit/${encodeURIComponent(referral.referral_code)}`,
    );
    return NextResponse.json({
      ok: true,
      referral,
      dashboard,
      share_kit: shareKit,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "추천 대기열 가입에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
