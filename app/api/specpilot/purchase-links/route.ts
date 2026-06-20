import { NextResponse } from "next/server";
import { getJson, postJson } from "../_client";
import type {
  PurchaseLink,
  PurchaseLinkGovernance,
  PurchaseLinkRequest,
} from "../../../types";

type PurchaseLinkPayload = PurchaseLinkRequest & {
  report_id?: string;
};

function reportIdFromRequest(request: Request) {
  return new URL(request.url).searchParams.get("report_id") || "";
}

async function loadGovernance(reportId: string) {
  return await getJson<PurchaseLinkGovernance>(
    `/reports/${encodeURIComponent(reportId)}/purchase-link-governance`,
  );
}

export async function GET(request: Request) {
  const reportId = reportIdFromRequest(request);

  if (!reportId) {
    return NextResponse.json(
      { ok: false, error: "저장 리포트가 있어야 구매 링크 거버넌스를 조회할 수 있습니다." },
      { status: 400 },
    );
  }

  try {
    const governance = await loadGovernance(reportId);
    return NextResponse.json({
      ok: true,
      governance,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "구매 링크 거버넌스 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as PurchaseLinkPayload;
  const { report_id, ...linkPayload } = payload;

  if (!report_id) {
    return NextResponse.json(
      { ok: false, error: "저장 리포트가 있어야 구매 링크를 등록할 수 있습니다." },
      { status: 400 },
    );
  }

  try {
    const link = await postJson<PurchaseLink>(
      `/reports/${encodeURIComponent(report_id)}/purchase-links`,
      linkPayload,
    );
    const governance = await loadGovernance(report_id);

    return NextResponse.json({
      ok: true,
      link,
      governance,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "구매 링크 등록에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
