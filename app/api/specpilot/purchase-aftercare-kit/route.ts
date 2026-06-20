import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  PublicPurchaseAftercareKit,
  PurchaseAftercareRequest,
} from "../../../types";

export async function POST(request: Request) {
  let payload: PurchaseAftercareRequest;

  try {
    payload = (await request.json()) as PurchaseAftercareRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "구매 후 케어 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicPurchaseAftercareKit>(
      "/public/purchase-aftercare-kit",
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
            : "공개 구매 후 케어 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
