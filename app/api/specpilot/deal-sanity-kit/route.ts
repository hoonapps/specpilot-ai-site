import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type { DealSanityRequest, PublicDealSanityKit } from "../../../types";

export async function POST(request: Request) {
  let payload: DealSanityRequest;

  try {
    payload = (await request.json()) as DealSanityRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "특가 안전성 검수 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicDealSanityKit>(
      "/public/deal-sanity-kit",
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
            : "공개 특가 안전성 검수 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
