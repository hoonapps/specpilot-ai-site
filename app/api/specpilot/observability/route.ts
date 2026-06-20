import { NextResponse } from "next/server";
import { getJson, postJson } from "../_client";
import type {
  ObservabilityDispatchResponse,
  ObservabilityExportRecord,
  ObservabilityOpsBundle,
  OpsRegressionDashboard,
} from "../../../types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const windowSize = searchParams.get("window_size") || "5";

  try {
    const [regression, exports] = await Promise.all([
      getJson<OpsRegressionDashboard>(
        `/ops/regression?window_size=${encodeURIComponent(windowSize)}`,
      ),
      getJson<ObservabilityExportRecord[]>("/ops/observability/exports?limit=10"),
    ]);

    return NextResponse.json<{
      ok: true;
      bundle: ObservabilityOpsBundle;
    }>({
      ok: true,
      bundle: {
        regression,
        exports,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "관측성 운영 상태 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    trace_id: string;
    destination: string;
    include_payload: boolean;
    dispatch: boolean;
    dry_run: boolean;
    window_size?: string;
  };
  const windowSize = payload.window_size || "5";

  try {
    const createdExport = await postJson<ObservabilityExportRecord>(
      "/ops/observability/exports",
      {
        trace_id: payload.trace_id,
        destination: payload.destination,
        include_payload: payload.include_payload,
      },
    );
    const dispatch = payload.dispatch
      ? await postJson<ObservabilityDispatchResponse>("/ops/observability/dispatch", {
          export_ids: [createdExport.export_id],
          dry_run: payload.dry_run,
        })
      : null;
    const [regression, exports] = await Promise.all([
      getJson<OpsRegressionDashboard>(
        `/ops/regression?window_size=${encodeURIComponent(windowSize)}`,
      ),
      getJson<ObservabilityExportRecord[]>("/ops/observability/exports?limit=10"),
    ]);

    return NextResponse.json<{
      ok: true;
      bundle: ObservabilityOpsBundle;
    }>({
      ok: true,
      bundle: {
        regression,
        exports,
        created_export: createdExport,
        dispatch,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "관측성 export 처리에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
