import { NextResponse } from "next/server";
import { getJson } from "../_client";
import type { TeamPurchaseConsultKit } from "../../../types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = encodeURIComponent(searchParams.get("limit") || "8");

  try {
    const kit = await getJson<TeamPurchaseConsultKit>(
      `/ops/team-purchase-consult-kit?limit=${limit}`,
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
            : "팀 구매 상담 키트 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
