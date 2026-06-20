"use client";

import Link from "next/link";
import { ClipboardCheck, Share2, UsersRound } from "lucide-react";
import type { LaunchAnalysisHandoffInput } from "../analysis-handoff";
import type { GrowthEventRequest } from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type StickyConversionBarProps = {
  handoff: LaunchAnalysisHandoffInput;
};

function recordStickyEvent(event: GrowthEventRequest) {
  void fetch("/api/specpilot/growth-funnel", {
    method: "POST",
    headers: { "content-type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      event: {
        source: "launch-sticky-conversion",
        surface: "launch-sticky-conversion",
        ...event,
      },
      limit: 8,
    }),
  }).catch(() => undefined);
}

export function LaunchStickyConversionBar({ handoff }: StickyConversionBarProps) {
  return (
    <aside className="launchStickyConversionBar" aria-label="런칭 전환 바로가기">
      <div>
        <span>지금 바로</span>
        <strong>구매 조건을 리포트로 좁히기</strong>
      </div>
      <nav>
        <LaunchAnalysisLink
          className="launchStickyPrimary"
          handoff={handoff}
          eventLabel="상시 전환 바 분석 시작"
          eventSurface="launch-sticky-conversion"
          eventMetadata={{ sticky_action: "analysis_start" }}
        >
          <ClipboardCheck size={16} />
          분석 시작
        </LaunchAnalysisLink>
        <a
          className="launchStickySecondary"
          href="#launch-share-pack"
          onClick={() =>
            recordStickyEvent({
              event_type: "share_cta",
              label: "상시 전환 바 공유 확산팩 이동",
              metadata: { sticky_action: "share_pack" },
            })
          }
        >
          <Share2 size={16} />
          공유 문구
        </a>
        <Link
          className="launchStickySecondary"
          href="/join?source=launch-sticky"
          onClick={() =>
            recordStickyEvent({
              event_type: "subscription_cta",
              label: "상시 전환 바 추천 대기열 이동",
              metadata: { sticky_action: "join_waitlist" },
            })
          }
        >
          <UsersRound size={16} />
          대기열
        </Link>
      </nav>
    </aside>
  );
}
