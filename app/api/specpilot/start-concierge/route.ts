import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type { AnalyzePayload, PurchaseStartConcierge } from "../../../types";

export async function POST(request: Request) {
  const payload = (await request.json()) as AnalyzePayload;

  try {
    const concierge = await postJson<PurchaseStartConcierge>(
      "/public/start-concierge",
      payload,
    );
    return NextResponse.json({
      ok: true,
      concierge,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "첫 구매 진단 콘시어지 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
