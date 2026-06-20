import { NextResponse } from "next/server";
import { getJson, postJson } from "../_client";
import type {
  MistakeCostCalculatorRequest,
  MistakeCostCalculatorResult,
  PublicMistakeCostCalculator,
} from "../../../types";

export async function GET() {
  try {
    const calculator = await getJson<PublicMistakeCostCalculator>(
      "/public/mistake-cost-calculator",
    );
    return NextResponse.json({
      ok: true,
      calculator,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "구매 실패 비용 계산기 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  let payload: MistakeCostCalculatorRequest;

  try {
    payload = (await request.json()) as MistakeCostCalculatorRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "구매 실패 비용 계산 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const result = await postJson<MistakeCostCalculatorResult>(
      "/public/mistake-cost-calculator/result",
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
            : "구매 실패 비용 계산 결과 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
