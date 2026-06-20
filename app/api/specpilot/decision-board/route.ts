import { NextResponse } from "next/server";
import { getJson } from "../_client";
import type { PurchaseDecisionBoard } from "../../../types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "12";

  try {
    const board = await getJson<PurchaseDecisionBoard>(
      `/reports/decision-board?limit=${encodeURIComponent(limit)}`,
    );
    return NextResponse.json({
      ok: true,
      board,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "구매 의사결정 보드 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
