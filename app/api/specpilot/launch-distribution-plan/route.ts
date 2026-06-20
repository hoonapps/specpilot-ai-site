import { NextResponse } from "next/server";
import { getJson } from "../_client";
import type { LaunchDistributionPlan } from "../../../types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const audience = url.searchParams.get("audience") || "creator";
  const limit = url.searchParams.get("limit") || "12";
  const params = new URLSearchParams({ audience, limit });
  if (category === "desktop_pc" || category === "laptop") {
    params.set("category", category);
  }

  try {
    const plan = await getJson<LaunchDistributionPlan>(
      `/growth/launch-distribution-plan?${params.toString()}`,
    );
    return NextResponse.json({
      ok: true,
      plan,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "출시 배포 플랜 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
