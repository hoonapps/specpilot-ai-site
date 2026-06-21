import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type { PublicReviewRiskKit, ReviewRiskRequest } from "../../../types";

export async function POST(request: Request) {
  let payload: ReviewRiskRequest;

  try {
    payload = (await request.json()) as ReviewRiskRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "리뷰 리스크 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicReviewRiskKit>("/public/review-risk-kit", payload);
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
            : "공개 리뷰 리스크 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
