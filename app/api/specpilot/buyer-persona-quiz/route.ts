import { NextResponse } from "next/server";
import { getJson, postJson } from "../_client";
import type {
  BuyerPersonaQuizRequest,
  BuyerPersonaQuizResult,
  PublicBuyerPersonaQuiz,
} from "../../../types";

export async function GET() {
  try {
    const quiz = await getJson<PublicBuyerPersonaQuiz>(
      "/public/buyer-persona-quiz",
    );
    return NextResponse.json({
      ok: true,
      quiz,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "구매 성향 진단 퀴즈 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  let payload: BuyerPersonaQuizRequest;

  try {
    payload = (await request.json()) as BuyerPersonaQuizRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "구매 성향 진단 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const result = await postJson<BuyerPersonaQuizResult>(
      "/public/buyer-persona-quiz/result",
      payload,
    );
    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "구매 성향 진단 결과 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
