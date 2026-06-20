import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type { AnalyzePayload, IntakeDiagnosisResponse } from "../../../types";

export async function POST(request: Request) {
  const payload = (await request.json()) as AnalyzePayload;

  try {
    const diagnosis = await postJson<IntakeDiagnosisResponse>(
      "/intake/diagnose",
      payload,
    );
    return NextResponse.json({
      ok: true,
      diagnosis,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "구매 조건 진단에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
