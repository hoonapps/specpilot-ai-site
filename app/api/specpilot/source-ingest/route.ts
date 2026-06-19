import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  SourceUrlIngestRequest,
  SourceUrlIngestResponse,
} from "../../../types";

export async function POST(request: Request) {
  const payload = (await request.json()) as SourceUrlIngestRequest;

  try {
    const result = await postJson<SourceUrlIngestResponse>(
      "/sources/ingest-url",
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
            : "상품 페이지 근거 검수에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
