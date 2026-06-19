import { NextResponse } from "next/server";
import { postJson } from "../_client";
import type {
  SubscriptionIntent,
  SubscriptionIntentRequest,
} from "../../../types";

export async function POST(request: Request) {
  const payload = (await request.json()) as SubscriptionIntentRequest;

  try {
    const intent = await postJson<SubscriptionIntent>(
      "/billing/subscription-intents",
      payload,
    );
    return NextResponse.json({
      ok: true,
      intent,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "요금제 관심 등록에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
