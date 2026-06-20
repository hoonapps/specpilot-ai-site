"use client";

import type { ReactNode } from "react";
import { saveLaunchAnalysisHandoff } from "../analysis-handoff";
import type { LaunchAnalysisHandoffInput } from "../analysis-handoff";

type LaunchAnalysisLinkProps = {
  handoff: LaunchAnalysisHandoffInput;
  className?: string;
  children: ReactNode;
};

export function LaunchAnalysisLink({
  handoff,
  className,
  children,
}: LaunchAnalysisLinkProps) {
  return (
    <a
      className={className}
      href="/#analysis"
      onClick={() => saveLaunchAnalysisHandoff(handoff)}
    >
      {children}
    </a>
  );
}
