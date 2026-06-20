import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type { PublicSpecRescueKit, SpecRescueRequest } from "../../../types";

export async function POST(request: Request) {
  let payload: SpecRescueRequest;

  try {
    payload = (await request.json()) as SpecRescueRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "대체 후보 rescue 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicSpecRescueKit>(
      "/public/spec-rescue-kit",
      payload,
    );
    return NextResponse.json({ ok: true, kit });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "대체 후보 rescue 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
