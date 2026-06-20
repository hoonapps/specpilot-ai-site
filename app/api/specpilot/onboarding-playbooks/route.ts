import { NextResponse } from "next/server";
import { getJson } from "../_client";
import type { Category, PurchaseOnboardingPlaybook } from "../../../types";

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
    ? `/public/onboarding/playbooks?category=${encodeURIComponent(category)}`
    : "/public/onboarding/playbooks";

  try {
    const playbooks = await getJson<PurchaseOnboardingPlaybook[]>(path);
    return NextResponse.json({
      ok: true,
      playbooks,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "구매 온보딩 플레이북 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
