import type { Category } from "./types";

export const launchAnalysisHandoffKey = "specpilot.launchAnalysisHandoff";

export type LaunchAnalysisHandoff = {
  version: 1;
  created_at: string;
  source: string;
  label: string;
  query: string;
  category?: Category;
  budget_krw?: number;
  purpose?: string;
  must_haves?: string[];
  exclusions?: string[];
};

export type LaunchAnalysisHandoffInput = Omit<
  LaunchAnalysisHandoff,
  "version" | "created_at"
>;

export function saveLaunchAnalysisHandoff(input: LaunchAnalysisHandoffInput) {
  if (typeof window === "undefined") {
    return;
  }
  const payload: LaunchAnalysisHandoff = {
    version: 1,
    created_at: new Date().toISOString(),
    ...input,
  };
  window.sessionStorage.setItem(launchAnalysisHandoffKey, JSON.stringify(payload));
}
