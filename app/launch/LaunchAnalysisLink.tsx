"use client";

import type { ReactNode } from "react";
import { saveLaunchAnalysisHandoff } from "../analysis-handoff";
import type { LaunchAnalysisHandoffInput } from "../analysis-handoff";

type EventMetadataValue = string | number | boolean;

type LaunchAnalysisLinkProps = {
  handoff: LaunchAnalysisHandoffInput;
  className?: string;
  href?: string;
  eventLabel?: string;
  eventSurface?: string;
  eventMetadata?: Record<string, EventMetadataValue | null | undefined>;
  children: ReactNode;
};

function compactMetadata(
  metadata: Record<string, EventMetadataValue | null | undefined>,
) {
  return Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => value !== null && value !== undefined),
  ) as Record<string, EventMetadataValue>;
}

function recordLaunchAnalysisClick(
  handoff: LaunchAnalysisHandoffInput,
  eventLabel?: string,
  eventSurface?: string,
  eventMetadata?: Record<string, EventMetadataValue | null | undefined>,
) {
  if (typeof window === "undefined") {
    return;
  }

  const metadata = compactMetadata({
    handoff_source: handoff.source,
    category: handoff.category,
    budget_krw: handoff.budget_krw,
    purpose: handoff.purpose,
    must_have_count: handoff.must_haves?.length,
    exclusion_count: handoff.exclusions?.length,
    ...eventMetadata,
  });

  void fetch("/api/specpilot/growth-funnel", {
    method: "POST",
    headers: { "content-type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      event: {
        event_type: "analysis_view",
        source: "specpilot-launch-page",
        surface: eventSurface ?? handoff.source,
        label: eventLabel ?? handoff.label,
        metadata,
      },
      limit: 20,
    }),
  }).catch(() => undefined);
}

export function LaunchAnalysisLink({
  handoff,
  className,
  href = "/#analysis",
  eventLabel,
  eventSurface,
  eventMetadata,
  children,
}: LaunchAnalysisLinkProps) {
  return (
    <a
      className={className}
      href={href}
      onClick={() => {
        saveLaunchAnalysisHandoff(handoff);
        recordLaunchAnalysisClick(handoff, eventLabel, eventSurface, eventMetadata);
      }}
    >
      {children}
    </a>
  );
}
