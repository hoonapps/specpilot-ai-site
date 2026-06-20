import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  PublicShoppingCartIntakeKit,
  ShoppingCartIntakeRequest,
} from "../../../types";

export async function POST(request: Request) {
  let payload: ShoppingCartIntakeRequest;

  try {
    payload = (await request.json()) as ShoppingCartIntakeRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "장바구니 인테이크 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicShoppingCartIntakeKit>(
      "/public/shopping-cart-intake-kit",
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
            : "공개 장바구니 인테이크 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
