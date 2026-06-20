import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type { PurchaseOutcome, PurchaseOutcomeRequest } from "../../../types";

export async function POST(request: Request) {
  const { report_id, ...payload } = (await request.json()) as PurchaseOutcomeRequest;

  if (!report_id) {
    return NextResponse.json(
      {
        ok: false,
        error: "저장 리포트가 있어야 구매 결과를 기록할 수 있습니다.",
      },
      { status: 400 },
    );
  }

  try {
    const outcome = await postJson<PurchaseOutcome>(
      `/reports/${report_id}/purchase-outcomes`,
      payload,
    );
    return NextResponse.json({
      ok: true,
      outcome,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "구매 결과 저장에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
