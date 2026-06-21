import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  PublicSpecTermDecoderKit,
  SpecTermDecoderRequest,
} from "../../../types";

export async function POST(request: Request) {
  let payload: SpecTermDecoderRequest;

  try {
    payload = (await request.json()) as SpecTermDecoderRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "사양 용어 해석 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicSpecTermDecoderKit>(
      "/public/spec-term-decoder-kit",
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
            : "공개 사양 용어 해석 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
