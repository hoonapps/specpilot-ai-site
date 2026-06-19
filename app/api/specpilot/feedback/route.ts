import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type { FeedbackRecord, FeedbackRequest } from "../../../types";

export async function POST(request: Request) {
  const payload = (await request.json()) as FeedbackRequest;

  try {
    const feedback = await postJson<FeedbackRecord>("/feedback", payload);
    return NextResponse.json({
      ok: true,
      feedback,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "피드백 저장에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
