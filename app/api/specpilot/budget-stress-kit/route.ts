import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type { BudgetStressRequest, PublicBudgetStressKit } from "../../../types";

export async function POST(request: Request) {
  let payload: BudgetStressRequest;

  try {
    payload = (await request.json()) as BudgetStressRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "예산/조건 스트레스 테스트 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicBudgetStressKit>(
      "/public/budget-stress-kit",
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
            : "공개 예산/조건 스트레스 테스트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
