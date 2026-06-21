import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type { PublicPurchaseJourneyKit, PurchaseJourneyKitRequest } from "../../../types";

export async function POST(request: Request) {
  let payload: PurchaseJourneyKitRequest;

  try {
    payload = (await request.json()) as PurchaseJourneyKitRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "구매 여정 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicPurchaseJourneyKit>("/public/purchase-journey-kit", payload);
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
            : "공개 구매 여정 오케스트레이터 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
