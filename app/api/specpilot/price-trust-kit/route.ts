import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type { PriceTrustRequest, PublicPriceTrustKit } from "../../../types";

export async function POST(request: Request) {
  let payload: PriceTrustRequest;

  try {
    payload = (await request.json()) as PriceTrustRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "가격 신뢰 검증 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicPriceTrustKit>("/public/price-trust-kit", payload);
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
            : "공개 가격 신뢰 검증 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
