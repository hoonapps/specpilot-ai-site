import { NextResponse } from "next/server";
import { getJson } from "../_client";
import type { Category, PublicBuyerChecklist } from "../../../types";

function categoryParam(value: string | null): Category | null {
  if (value === "desktop_pc" || value === "laptop") {
    return value;
  }
  return null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = new URLSearchParams();
  const category = categoryParam(url.searchParams.get("category"));
  const budget = url.searchParams.get("budget_krw");
  const persona = url.searchParams.get("persona");
  if (category) {
    params.set("category", category);
  }
  if (budget) {
    params.set("budget_krw", budget);
  }
  if (persona) {
    params.set("persona", persona);
  }
  const suffix = params.size ? `?${params.toString()}` : "";

  try {
    const checklist = await getJson<PublicBuyerChecklist>(
      `/public/buyer-checklist${suffix}`,
    );
    return NextResponse.json({
      ok: true,
      checklist,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "구매 실패 방지 체크리스트 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
