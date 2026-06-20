import { NextResponse } from "next/server";
import type { PublicLaunchObjectionKit } from "../../../types";
import { getJson } from "../_client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "8";

  try {
    const kit = await getJson<PublicLaunchObjectionKit>(
      `/public/launch-objection-kit?limit=${encodeURIComponent(limit)}`,
    );
    return NextResponse.json({ ok: true, kit });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "런칭 반박 FAQ 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
