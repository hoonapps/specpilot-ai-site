import { NextResponse } from "next/server";
import { postJson } from "../../_client";
import type {
  AlertSubscription,
  AlertSubscriptionRequest,
} from "../../../../types";

export async function POST(request: Request) {
  const payload = (await request.json()) as AlertSubscriptionRequest;

  if (!payload.trace_id || !payload.product_id) {
    return NextResponse.json(
      {
        ok: false,
        error: "분석 결과와 알림 대상 후보가 있어야 가격 알림을 만들 수 있습니다.",
      },
      { status: 400 },
    );
  }

  try {
    const subscription = await postJson<AlertSubscription>(
      "/alerts/subscribe",
      payload,
    );
    return NextResponse.json({
      ok: true,
      subscription,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "가격 알림 구독 생성에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
