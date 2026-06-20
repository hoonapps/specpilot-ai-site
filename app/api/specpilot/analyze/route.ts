import { NextResponse } from "next/server";
import { demoResponse } from "../../../demo-data";
import type {
  AnalyzeAndShareResponse,
  AnalyzePayload,
  AnalyzeResponse,
  ReportShareAssets,
  SaveReportResponse,
  ShareReportResponse,
} from "../../../types";
import { getJson, postJson } from "../_client";

function reportTitle(analysis: AnalyzeResponse) {
  const top = analysis.report.top_recommendations[0];
  return top
    ? `${top.product.model_name} 구매 검토 리포트`
    : "SpecPilot AI 구매 검토 리포트";
}

export async function POST(request: Request) {
  const payload = (await request.json()) as AnalyzePayload;

  try {
    const analysis = await postJson<AnalyzeResponse>("/analyze", payload);
    const savedReport = await postJson<SaveReportResponse>("/reports/save", {
      trace_id: analysis.graph_trace_id,
      title: reportTitle(analysis),
      owner_label: "site-user",
      notes: "Next.js 웹사이트에서 자동 저장한 공개 검토 리포트",
    });
    const share = await postJson<ShareReportResponse>(
      `/reports/${savedReport.report_id}/share`,
    );
    const shareAssets = await getJson<ReportShareAssets>(
      `/reports/${savedReport.report_id}/share-assets`,
    );
    const publicUrl = new URL(share.public_path, request.url).toString();

    return NextResponse.json<AnalyzeAndShareResponse>({
      analysis,
      saved_report: savedReport,
      share,
      share_assets: shareAssets,
      public_url: publicUrl,
      mode: "live",
    });
  } catch (error) {
    return NextResponse.json<AnalyzeAndShareResponse>({
      analysis: demoResponse,
      saved_report: null,
      share: null,
      share_assets: null,
      public_url: null,
      mode: "demo",
      warning:
        error instanceof Error
          ? error.message
          : "제품 API 연결에 실패해 데모 리포트를 표시합니다.",
    });
  }
}
