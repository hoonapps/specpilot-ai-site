import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  PublicSetupCompatibilityKit,
  SetupCompatibilityRequest,
} from "../../../types";

export async function POST(request: Request) {
  let payload: SetupCompatibilityRequest;

  try {
    payload = (await request.json()) as SetupCompatibilityRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "세팅 호환성 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicSetupCompatibilityKit>(
      "/public/setup-compatibility-kit",
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
            : "공개 세팅 호환성 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
