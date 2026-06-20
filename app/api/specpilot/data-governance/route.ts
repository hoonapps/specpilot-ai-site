import { NextResponse } from "next/server";
import { getJson } from "../_client";
import type { DataGovernanceBundle, DataGovernanceDashboard } from "../../../types";

export async function GET() {
  try {
    const dashboard = await getJson<DataGovernanceDashboard>("/ops/data-governance");

    return NextResponse.json<{
      ok: true;
      bundle: DataGovernanceBundle;
    }>({
      ok: true,
      bundle: {
        dashboard,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "데이터 거버넌스 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
