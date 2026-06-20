import { NextResponse } from "next/server";
import { getJson, postJson } from "../_client";
import type {
  PublicSpecRiskScanner,
  SpecRiskScannerRequest,
  SpecRiskScannerResult,
} from "../../../types";

export async function GET() {
  try {
    const scanner = await getJson<PublicSpecRiskScanner>(
      "/public/spec-risk-scanner",
    );
    return NextResponse.json({
      ok: true,
      scanner,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "옵션/사양 빠른 검수기 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  let payload: SpecRiskScannerRequest;

  try {
    payload = (await request.json()) as SpecRiskScannerRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "옵션/사양 빠른 검수 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const result = await postJson<SpecRiskScannerResult>(
      "/public/spec-risk-scanner/result",
      payload,
    );
    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "옵션/사양 빠른 검수 결과 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
