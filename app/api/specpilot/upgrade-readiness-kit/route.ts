import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  PublicUpgradeReadinessKit,
  UpgradeReadinessRequest,
} from "../../../types";

export async function POST(request: Request) {
  let payload: UpgradeReadinessRequest;

  try {
    payload = (await request.json()) as UpgradeReadinessRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "업그레이드 수명 검수 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicUpgradeReadinessKit>(
      "/public/upgrade-readiness-kit",
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
            : "공개 업그레이드 수명 검수 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
