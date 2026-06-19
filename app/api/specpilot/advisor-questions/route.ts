import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  ReportAdvisorAnswer,
  ReportAdvisorQuestionRequest,
} from "../../../types";

export async function POST(request: Request) {
  const { report_id, ...payload } =
    (await request.json()) as ReportAdvisorQuestionRequest;

  if (!report_id) {
    return NextResponse.json(
      {
        ok: false,
        error: "저장 리포트가 있어야 구매 상담을 요청할 수 있습니다.",
      },
      { status: 400 },
    );
  }

  try {
    const answer = await postJson<ReportAdvisorAnswer>(
      `/reports/${report_id}/advisor-questions`,
      payload,
    );
    return NextResponse.json({
      ok: true,
      answer,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "구매 상담 답변 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
