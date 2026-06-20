import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  PriceBreakdownRequest,
  PublicPriceBreakdownKit,
} from "../../../types";

export async function POST(request: Request) {
  let payload: PriceBreakdownRequest;

  try {
    payload = (await request.json()) as PriceBreakdownRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "실구매가 분해 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicPriceBreakdownKit>(
      "/public/price-breakdown-kit",
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
            : "공개 실구매가 분해 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
