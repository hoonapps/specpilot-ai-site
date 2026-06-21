import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  PublicRequirementsConsensusKit,
  RequirementsConsensusRequest,
} from "../../../types";

export async function POST(request: Request) {
  let payload: RequirementsConsensusRequest;

  try {
    payload = (await request.json()) as RequirementsConsensusRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "구매 조건 합의 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicRequirementsConsensusKit>(
      "/public/requirements-consensus-kit",
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
            : "공개 구매 조건 합의 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
