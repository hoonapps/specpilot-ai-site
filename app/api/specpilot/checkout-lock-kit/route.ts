import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type { CheckoutLockRequest, PublicCheckoutLockKit } from "../../../types";

export async function POST(request: Request) {
  let payload: CheckoutLockRequest;

  try {
    payload = (await request.json()) as CheckoutLockRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "체크아웃 잠금 검수 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicCheckoutLockKit>(
      "/public/checkout-lock-kit",
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
            : "공개 체크아웃 잠금 검수 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
