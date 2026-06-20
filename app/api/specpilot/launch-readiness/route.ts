import { NextResponse } from "next/server";
import { getJson } from "../_client";
import type {
  BetaBacklogSummary,
  BetaReadinessDashboard,
  LaunchGateDashboard,
  LaunchReadinessBundle,
} from "../../../types";

export async function GET() {
  try {
    const [readiness, launchGate, backlogSummary] = await Promise.all([
      getJson<BetaReadinessDashboard>("/beta/readiness"),
      getJson<LaunchGateDashboard>("/beta/launch-gate"),
      getJson<BetaBacklogSummary>("/beta/backlog/summary"),
    ]);

    return NextResponse.json<{
      ok: true;
      dashboard: LaunchReadinessBundle;
    }>({
      ok: true,
      dashboard: {
        readiness,
        launch_gate: launchGate,
        backlog_summary: backlogSummary,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "출시 준비도 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
