import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  PublicSellerNegotiationKit,
  SellerNegotiationRequest,
} from "../../../types";

export async function POST(request: Request) {
  let payload: SellerNegotiationRequest;

  try {
    payload = (await request.json()) as SellerNegotiationRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "판매자 조건 협상 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicSellerNegotiationKit>(
      "/public/seller-negotiation-kit",
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
            : "공개 판매자 조건 협상 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
