import { NextResponse } from "next/server";
import { getJson, postJson } from "../_client";
import type {
  PublicReferralLeaderboard,
  ReferralRewardProgress,
  ReferralShareKit,
  WaitlistReferral,
  WaitlistReferralDashboard,
  WaitlistReferralRequest,
} from "../../../types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "20";
  const referralCode = url.searchParams.get("referral_code") || "";

  try {
    const dashboard = await getJson<WaitlistReferralDashboard>(
      `/growth/referral-dashboard?limit=${encodeURIComponent(limit)}`,
    );
    const leaderboardParams = new URLSearchParams({
      limit,
    });
    if (referralCode) {
      leaderboardParams.set("referral_code", referralCode);
    }
    const leaderboard = await getJson<PublicReferralLeaderboard>(
      `/growth/referral-leaderboard?${leaderboardParams.toString()}`,
    );
    return NextResponse.json({
      ok: true,
      dashboard,
      leaderboard,
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
    const leaderboard = await getJson<PublicReferralLeaderboard>(
      `/growth/referral-leaderboard?limit=10&referral_code=${encodeURIComponent(
        referral.referral_code,
      )}`,
    );
    const shareKit = await getJson<ReferralShareKit>(
      `/growth/referral-share-kit/${encodeURIComponent(referral.referral_code)}`,
    );
    const rewards = await getJson<ReferralRewardProgress>(
      `/growth/referral-rewards/${encodeURIComponent(referral.referral_code)}`,
    );
    return NextResponse.json({
      ok: true,
      referral,
      dashboard,
      leaderboard,
      share_kit: shareKit,
      rewards,
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
