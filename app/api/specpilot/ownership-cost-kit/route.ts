import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  OwnershipCostRequest,
  PublicOwnershipCostKit,
} from "../../../types";

export async function POST(request: Request) {
  let payload: OwnershipCostRequest;

  try {
    payload = (await request.json()) as OwnershipCostRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "총소유비용 검수 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicOwnershipCostKit>(
      "/public/ownership-cost-kit",
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
            : "공개 총소유비용 검수 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
