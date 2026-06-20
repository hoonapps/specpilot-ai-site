import { NextResponse } from "next/server";
import { getJson, patchJson, postJson } from "../_client";
import type {
  BetaBacklogAction,
  BetaBacklogItem,
  BetaBacklogStatus,
  BetaBacklogSummary,
  BetaCohort,
  BetaCohortReport,
  BetaCohortRequest,
  BetaOpsBundle,
} from "../../../types";

async function loadBundle(limit: string): Promise<BetaOpsBundle> {
  const safeLimit = encodeURIComponent(limit || "20");
  const [cohorts, backlog, backlogSummary] = await Promise.all([
    getJson<BetaCohort[]>(`/beta/cohorts?limit=${safeLimit}`),
    getJson<BetaBacklogItem[]>(`/beta/backlog?limit=${safeLimit}`),
    getJson<BetaBacklogSummary>("/beta/backlog/summary"),
  ]);

  return {
    cohorts,
    backlog,
    backlog_summary: backlogSummary,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || "20";

  try {
    return NextResponse.json({
      ok: true,
      bundle: await loadBundle(limit),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "베타 운영 상태 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    action: "create_cohort" | "cohort_report" | "update_backlog";
    limit?: number;
    cohort?: BetaCohortRequest;
    cohort_id?: string;
    backlog_id?: string;
    backlog_status?: BetaBacklogStatus;
    assignee?: string;
    note?: string;
    sla_due_at?: string | null;
    completion_summary?: string;
  };

  try {
    let createdCohort: BetaCohort | null = null;
    let cohortReport: BetaCohortReport | null = null;
    let backlogAction: BetaBacklogAction | null = null;

    if (payload.action === "create_cohort" && payload.cohort) {
      createdCohort = await postJson<BetaCohort>("/beta/cohorts", payload.cohort);
      cohortReport = await getJson<BetaCohortReport>(
        `/beta/cohorts/${encodeURIComponent(createdCohort.cohort_id)}/report`,
      );
    }

    if (payload.action === "cohort_report" && payload.cohort_id) {
      cohortReport = await getJson<BetaCohortReport>(
        `/beta/cohorts/${encodeURIComponent(payload.cohort_id)}/report`,
      );
    }

    if (payload.action === "update_backlog" && payload.backlog_id) {
      backlogAction = await patchJson<BetaBacklogAction>(
        `/beta/backlog/${encodeURIComponent(payload.backlog_id)}`,
        {
          status: payload.backlog_status || "in_progress",
          assignee: payload.assignee || "growth-ops",
          note: payload.note || "웹사이트 베타 운영 콘솔에서 상태 갱신",
          sla_due_at: payload.sla_due_at || null,
          completion_summary: payload.completion_summary || "",
        },
      );
    }

    return NextResponse.json({
      ok: true,
      bundle: {
        ...(await loadBundle(String(payload.limit || 20))),
        created_cohort: createdCohort,
        cohort_report: cohortReport,
        backlog_action: backlogAction,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "베타 운영 작업에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
