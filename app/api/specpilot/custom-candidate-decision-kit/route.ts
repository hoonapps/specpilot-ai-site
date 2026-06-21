import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  CustomCandidateDecisionRequest,
  PublicCustomCandidateDecisionKit,
} from "../../../types";

export async function POST(request: Request) {
  let payload: CustomCandidateDecisionRequest;

  try {
    payload = (await request.json()) as CustomCandidateDecisionRequest;
  } catch {
    return NextResponse.json(
      { ok: false, error: "커스텀 후보 비교 요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const kit = await postJson<PublicCustomCandidateDecisionKit>(
      "/public/custom-candidate-decision-kit",
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
            : "공개 커스텀 후보 비교 결정 키트 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
