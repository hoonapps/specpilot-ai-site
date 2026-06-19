import { NextResponse } from "next/server";
import { postJson } from "../../_client";
import type {
  AlertEvaluationRequest,
  AlertEvaluationResponse,
} from "../../../../types";

export async function POST(request: Request) {
  const payload = (await request.json()) as AlertEvaluationRequest;

  try {
    const evaluation = await postJson<AlertEvaluationResponse>(
      "/alerts/evaluate",
      payload,
    );
    return NextResponse.json({
      ok: true,
      evaluation,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "목표가 도달 평가에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
