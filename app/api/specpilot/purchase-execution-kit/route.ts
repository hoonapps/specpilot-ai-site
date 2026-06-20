import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  PublicPurchaseExecutionKit,
  PurchaseExecutionKitRequest,
} from "../../../types";

export async function POST(request: Request) {
  let payload: PurchaseExecutionKitRequest;

  try {
    payload = (await request.json()) as PurchaseExecutionKitRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "구매 실행 패키지 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicPurchaseExecutionKit>(
      "/public/purchase-execution-kit",
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
            : "공개 구매 실행 패키지 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
