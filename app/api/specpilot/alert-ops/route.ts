import { NextResponse } from "next/server";
import { getJson, postJson } from "../_client";
import type {
  AlertDeliveryAttempt,
  AlertDeliveryEvent,
  AlertDispatchResponse,
  AlertNotificationChannel,
  AlertNotificationChannelRequest,
  AlertOpsBundle,
} from "../../../types";

async function loadBundle(limit = 20): Promise<AlertOpsBundle> {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
  const [channels, events, deliveries] = await Promise.all([
    getJson<AlertNotificationChannel[]>("/alerts/channels?limit=20"),
    getJson<AlertDeliveryEvent[]>(`/alerts/events?limit=${safeLimit}`),
    getJson<AlertDeliveryAttempt[]>(`/alerts/deliveries?limit=${safeLimit}`),
  ]);

  return {
    channels,
    events,
    deliveries,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || 20);

  try {
    return NextResponse.json({
      ok: true,
      bundle: await loadBundle(limit),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "알림 운영 상태 조회에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    action: "upsert_channel" | "dispatch";
    channel?: AlertNotificationChannelRequest;
    event_ids?: string[];
    dry_run?: boolean;
    limit?: number;
  };
  const limit = Math.max(1, Math.min(Number(payload.limit) || 20, 100));

  try {
    if (payload.action === "upsert_channel" && payload.channel) {
      const createdChannel = await postJson<AlertNotificationChannel>(
        "/alerts/channels",
        payload.channel,
      );
      return NextResponse.json({
        ok: true,
        bundle: {
          ...(await loadBundle(limit)),
          created_channel: createdChannel,
        },
      });
    }

    if (payload.action === "dispatch") {
      const dispatch = await postJson<AlertDispatchResponse>("/alerts/dispatch", {
        event_ids: payload.event_ids || [],
        dry_run: Boolean(payload.dry_run),
        limit,
      });
      return NextResponse.json({
        ok: true,
        bundle: {
          ...(await loadBundle(limit)),
          dispatch,
        },
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error: "지원하지 않는 알림 운영 작업입니다.",
      },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "알림 운영 작업에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
