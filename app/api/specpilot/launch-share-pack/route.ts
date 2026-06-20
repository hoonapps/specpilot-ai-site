import { NextResponse } from "next/server";
import type { PublicLaunchSharePack } from "../../../types";
import { getJson } from "../_client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "8";

  try {
    const pack = await getJson<PublicLaunchSharePack>(
      `/public/launch-share-pack?limit=${encodeURIComponent(limit)}`,
    );
    return NextResponse.json({ ok: true, pack });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "런칭 공유 확산팩 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
