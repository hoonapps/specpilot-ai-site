import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type { BetaLead, BetaLeadRequest } from "../../../types";

export async function POST(request: Request) {
  const payload = (await request.json()) as BetaLeadRequest;

  try {
    const lead = await postJson<BetaLead>("/beta/leads", payload);
    return NextResponse.json({
      ok: true,
      lead,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "베타 신청 저장에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
