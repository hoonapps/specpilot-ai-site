import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type { FinalDecisionKitRequest, PublicFinalDecisionKit } from "../../../types";

export async function POST(request: Request) {
  let payload: FinalDecisionKitRequest;

  try {
    payload = (await request.json()) as FinalDecisionKitRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "최종 구매 판정 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicFinalDecisionKit>("/public/final-decision-kit", payload);
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
            : "공개 최종 구매 판정 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
