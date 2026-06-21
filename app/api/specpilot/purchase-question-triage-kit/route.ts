import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  PublicPurchaseQuestionTriageKit,
  PurchaseQuestionTriageRequest,
} from "../../../types";

export async function POST(request: Request) {
  let payload: PurchaseQuestionTriageRequest;

  try {
    payload = (await request.json()) as PurchaseQuestionTriageRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "구매 질문 라우팅 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicPurchaseQuestionTriageKit>(
      "/public/purchase-question-triage-kit",
      payload,
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
            : "공개 구매 질문 라우팅 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
