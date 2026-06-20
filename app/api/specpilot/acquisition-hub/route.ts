import { NextResponse } from "next/server";
import type { PublicAcquisitionHub } from "../../../types";
import { getJson } from "../_client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "12";

  try {
    const hub = await getJson<PublicAcquisitionHub>(
      `/growth/acquisition-hub?limit=${encodeURIComponent(limit)}`,
    );
    return NextResponse.json({ ok: true, hub });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "공개 유입 허브 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
