import { NextResponse } from "next/server";
import { getJson } from "../_client";
import type { Category, CategoryMarketReport } from "../../../types";

function categoryParam(value: string | null): Category | null {
  if (value === "desktop_pc" || value === "laptop") {
    return value;
  }
  return null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = categoryParam(url.searchParams.get("category"));
  const path = category
    ? `/market/category-reports?category=${encodeURIComponent(category)}`
    : "/market/category-reports";

  try {
    const report = await getJson<CategoryMarketReport>(path);
    return NextResponse.json({
      ok: true,
      report,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "카테고리 리포트 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
