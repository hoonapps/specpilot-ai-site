import { NextResponse } from "next/server";
import { getJson } from "../_client";
import type { DemoScenarioGallery } from "../../../types";

export async function GET() {
  try {
    const gallery = await getJson<DemoScenarioGallery>("/demo/scenarios");
    return NextResponse.json({
      ok: true,
      gallery,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "공개 데모 시나리오 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
