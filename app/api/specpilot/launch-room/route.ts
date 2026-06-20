import { NextResponse } from "next/server";
import type { PublicLaunchRoom } from "../../../types";
import { getJson } from "../_client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "8";

  try {
    const room = await getJson<PublicLaunchRoom>(
      `/public/launch-room?limit=${encodeURIComponent(limit)}`,
    );
    return NextResponse.json({ ok: true, room });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "공개 런칭룸 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
