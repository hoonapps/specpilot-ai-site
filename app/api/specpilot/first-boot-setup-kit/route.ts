import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  FirstBootSetupRequest,
  PublicFirstBootSetupKit,
} from "../../../types";

export async function POST(request: Request) {
  let payload: FirstBootSetupRequest;

  try {
    payload = (await request.json()) as FirstBootSetupRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "첫 부팅 세팅 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicFirstBootSetupKit>(
      "/public/first-boot-setup-kit",
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
            : "공개 첫 부팅 세팅 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
