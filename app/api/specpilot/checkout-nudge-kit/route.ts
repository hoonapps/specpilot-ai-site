import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type { CheckoutNudgeRequest, PublicCheckoutNudgeKit } from "../../../types";

export async function POST(request: Request) {
  let payload: CheckoutNudgeRequest;

  try {
    payload = (await request.json()) as CheckoutNudgeRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "장바구니 후속 넛지 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicCheckoutNudgeKit>(
      "/public/checkout-nudge-kit",
      payload,
    );
    return NextResponse.json({ ok: true, kit });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "장바구니 후속 넛지 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
