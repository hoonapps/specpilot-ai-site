import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type { CheckoutReview, CheckoutReviewRequest } from "../../../types";

export async function POST(request: Request) {
  const { report_id, ...payload } = (await request.json()) as CheckoutReviewRequest;

  if (!report_id) {
    return NextResponse.json(
      {
        ok: false,
        error: "저장 리포트가 있어야 결제 전 검수를 실행할 수 있습니다.",
      },
      { status: 400 },
    );
  }

  try {
    const review = await postJson<CheckoutReview>(
      `/reports/${report_id}/checkout-review`,
      payload,
    );
    return NextResponse.json({
      ok: true,
      review,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "결제 전 검수 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
