import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  PublicReviewerQuickCardKit,
  ReviewerQuickCardRequest,
} from "../../../types";

export async function POST(request: Request) {
  let payload: ReviewerQuickCardRequest;

  try {
    payload = (await request.json()) as ReviewerQuickCardRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "30초 검토 카드 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicReviewerQuickCardKit>(
      "/public/reviewer-quick-card-kit",
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
            : "공개 30초 검토 카드 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
