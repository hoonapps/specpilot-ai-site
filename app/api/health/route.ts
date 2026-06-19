import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const productApiBase =
  process.env.SPECPILOT_API_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_SPECPILOT_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

const requireProductReady = process.env.SPECPILOT_REQUIRE_PRODUCT_READY === "true";

export async function GET() {
  const checkedAt = new Date().toISOString();
  const started = Date.now();

  try {
    const response = await fetch(`${productApiBase}/ready`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    const product = (await response.json().catch(() => null)) as unknown;
    const ready = response.ok || !requireProductReady;
    const payload = {
      ready,
      site_ready: true,
      product_api_ready: response.ok,
      product_api_base: productApiBase,
      product,
      latency_ms: Date.now() - started,
      checked_at: checkedAt,
    };
    return NextResponse.json(payload, { status: ready ? 200 : 503 });
  } catch (error) {
    const payload = {
      ready: !requireProductReady,
      site_ready: true,
      product_api_ready: false,
      product_api_base: productApiBase,
      error:
        error instanceof Error
          ? error.message
          : "제품 API 헬스체크에 실패했습니다.",
      latency_ms: Date.now() - started,
      checked_at: checkedAt,
    };
    return NextResponse.json(payload, {
      status: requireProductReady ? 503 : 200,
    });
  }
}
