import { NextResponse } from "next/server";
import type { PublicConversionBoard } from "../../../types";
import { getJson } from "../_client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "12";

  try {
    const board = await getJson<PublicConversionBoard>(
      `/growth/public-conversion-board?limit=${encodeURIComponent(limit)}`,
    );
    return NextResponse.json({ ok: true, board });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "공개 전환 보드 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
