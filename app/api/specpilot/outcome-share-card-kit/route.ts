import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  OutcomeShareCardRequest,
  PublicOutcomeShareCardKit,
} from "../../../types";

export async function POST(request: Request) {
  let payload: OutcomeShareCardRequest;

  try {
    payload = (await request.json()) as OutcomeShareCardRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "구매 결과 공유 카드 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicOutcomeShareCardKit>(
      "/public/outcome-share-card-kit",
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
            : "공개 구매 결과 공유 카드 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
