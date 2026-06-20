import { NextResponse } from "next/server";
import { getJson } from "../_client";
import type { LaunchCampaignKit } from "../../../types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const audience = url.searchParams.get("audience") || "creator";
  const params = new URLSearchParams({ audience });
  if (category === "desktop_pc" || category === "laptop") {
    params.set("category", category);
  }

  try {
    const kit = await getJson<LaunchCampaignKit>(
      `/growth/launch-kit?${params.toString()}`,
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
            : "출시 캠페인 키트 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
