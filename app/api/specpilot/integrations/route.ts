import { NextResponse } from "next/server";
import { getJson, postJson } from "../_client";
import type {
  IntegrationProvider,
  IntegrationProviderRequest,
  IntegrationReadinessDashboard,
} from "../../../types";

export async function GET() {
  try {
    const dashboard = await getJson<IntegrationReadinessDashboard>(
      "/ops/integration-readiness",
    );
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
            : "외부 연동 준비도 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as IntegrationProviderRequest;

  try {
    const provider = await postJson<IntegrationProvider>("/ops/integrations", payload);
    const dashboard = await getJson<IntegrationReadinessDashboard>(
      "/ops/integration-readiness",
    );
    return NextResponse.json({
      ok: true,
      provider,
      dashboard,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "외부 연동 provider 등록에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
