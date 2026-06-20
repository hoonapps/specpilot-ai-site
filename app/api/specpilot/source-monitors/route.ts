import { NextResponse } from "next/server";
import { getJson, postJson } from "../_client";
import type {
  ReviewDecision,
  ReviewQueueItem,
  ReviewStatus,
  SourceMonitor,
  SourceMonitorOpsBundle,
  SourceMonitorRequest,
  SourceRefreshResponse,
  SourceSchedulePreview,
  SourceRefreshRun,
} from "../../../types";

async function loadBundle(limit: string): Promise<SourceMonitorOpsBundle> {
  const safeLimit = encodeURIComponent(limit || "20");
  const [monitors, schedule, runs, pendingReviews] = await Promise.all([
    getJson<SourceMonitor[]>(`/sources/monitors?limit=${safeLimit}`),
    getJson<SourceSchedulePreview>(`/sources/schedule?limit=${safeLimit}`),
    getJson<SourceRefreshRun[]>("/sources/refresh-runs?limit=12"),
    getJson<ReviewQueueItem[]>("/admin/reviews?status=pending&limit=12"),
  ]);

  return {
    monitors,
    schedule,
    runs,
    pending_reviews: pendingReviews,
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
            : "상품 URL 모니터 상태 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    action: "create" | "refresh" | "refresh_due" | "review_decision";
    monitor?: SourceMonitorRequest;
    monitor_ids?: string[];
    limit?: number;
    html_overrides?: Record<string, string>;
    review_id?: string;
    review_status?: ReviewStatus;
    reviewer?: string;
    note?: string;
  };

  try {
    let createdMonitor: SourceMonitor | null = null;
    let refresh: SourceRefreshResponse | null = null;
    let decision: ReviewDecision | null = null;

    if (payload.action === "create" && payload.monitor) {
      createdMonitor = await postJson<SourceMonitor>(
        "/sources/monitors",
        payload.monitor,
      );
    }

    if (payload.action === "refresh" || payload.action === "refresh_due") {
      const path =
        payload.action === "refresh_due" ? "/sources/refresh-due" : "/sources/refresh";
      refresh = await postJson<SourceRefreshResponse>(path, {
        monitor_ids: payload.monitor_ids || [],
        limit: payload.limit || 20,
        include_inactive: false,
        html_overrides: payload.html_overrides || {},
      });
    }

    if (
      payload.action === "review_decision" &&
      payload.review_id &&
      payload.review_status
    ) {
      decision = await postJson<ReviewDecision>(
        `/admin/reviews/${encodeURIComponent(payload.review_id)}/decision`,
        {
          status: payload.review_status,
          reviewer: payload.reviewer || "specpilot-site",
          note: payload.note || "웹사이트 모니터 운영 콘솔에서 처리",
        },
      );
    }

    return NextResponse.json({
      ok: true,
      bundle: {
        ...(await loadBundle(String(payload.limit || 20))),
        created_monitor: createdMonitor,
        refresh,
        decision,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "상품 URL 모니터 작업에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
