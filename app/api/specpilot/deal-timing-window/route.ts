import { NextResponse } from "next/server";
import { getJson } from "../_client";
import type { Category, PublicDealTimingWindow } from "../../../types";

const categories = new Set<Category>(["desktop_pc", "laptop"]);

function queryString(request: Request) {
  const url = new URL(request.url);
  const params = new URLSearchParams();
  const category = url.searchParams.get("category");
  const budget = url.searchParams.get("budget_krw");
  const purpose = url.searchParams.get("purpose");

  if (category && categories.has(category as Category)) {
    params.set("category", category);
  }
  if (budget) {
    params.set("budget_krw", budget);
  }
  if (purpose) {
    params.set("purpose", purpose);
  }

  const value = params.toString();
  return value ? `?${value}` : "";
}

export async function GET(request: Request) {
  try {
    const timing = await getJson<PublicDealTimingWindow>(
      `/public/deal-timing-window${queryString(request)}`,
    );
    return NextResponse.json({
      ok: true,
      timing,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "공개 구매 타이밍 윈도우 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
