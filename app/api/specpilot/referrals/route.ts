import { NextResponse } from "next/server";
import { getJson, postJson } from "../_client";
import type {
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
    return NextResponse.json({
      ok: true,
      referral,
      dashboard,
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
