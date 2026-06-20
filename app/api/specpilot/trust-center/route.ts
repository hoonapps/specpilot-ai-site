import { NextResponse } from "next/server";
import { getJson } from "../_client";
import type { TrustCenterDashboard } from "../../../types";

export async function GET() {
  try {
    const dashboard = await getJson<TrustCenterDashboard>("/policy/trust-center");
    return NextResponse.json({
      ok: true,
      dashboard,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Trust Center 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
