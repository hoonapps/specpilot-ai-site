import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type { DefectClaimRequest, PublicDefectClaimKit } from "../../../types";

export async function POST(request: Request) {
  let payload: DefectClaimRequest;

  try {
    payload = (await request.json()) as DefectClaimRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "반품·AS 증거 패키지 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicDefectClaimKit>("/public/defect-claim-kit", payload);
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
            : "공개 반품·AS 증거 패키지 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
