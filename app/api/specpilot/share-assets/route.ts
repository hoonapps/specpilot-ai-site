import { NextResponse } from "next/server";
import type { ReportShareAssets } from "../../../types";
import { getJson } from "../_client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get("report_id");

  if (!reportId) {
    return NextResponse.json(
      { ok: false, error: "저장 리포트가 있어야 공유 자산을 만들 수 있습니다." },
      { status: 400 },
    );
  }

  try {
    const share_assets = await getJson<ReportShareAssets>(
      `/reports/${encodeURIComponent(reportId)}/share-assets`,
    );
    return NextResponse.json({ ok: true, share_assets });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "공유 자산 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
