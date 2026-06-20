"use client";

import { useState } from "react";
import { ArrowRight, Gauge, LoaderCircle, Sparkles } from "lucide-react";
import type { AnalyzePayload, Category, PurchaseStartConcierge } from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  query: string;
  category: Category;
  budget: string;
  purpose: string;
  mustHaves: string;
  exclusions: string;
};

const demoForm: FormState = {
  query: "영상 편집과 QHD 게임용 데스크톱을 220만원 안에서 사고 싶어요.",
  category: "desktop_pc",
  budget: "2200000",
  purpose: "Premiere Pro, QHD gaming",
  mustHaves: "32GB RAM\nRTX 4070급\nSSD 1TB 이상",
  exclusions: "중고\n리퍼\n출처 없는 최저가",
};

function parseList(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBudget(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function tone(status: string) {
  if (status === "ok" || status === "ready") {
    return "ok";
  }
  return status === "blocker" || status === "hold" ? "danger" : "warn";
}

function actionTone(actionType: string) {
  if (actionType === "run_analysis") {
    return "ok";
  }
  if (actionType === "complete_intake") {
    return "danger";
  }
  return "warn";
}

function payloadFromForm(form: FormState): AnalyzePayload {
  return {
    query: form.query,
    category: form.category,
    budget_krw: parseBudget(form.budget),
    purpose: form.purpose,
    must_haves: parseList(form.mustHaves),
    exclusions: parseList(form.exclusions),
    channels: [],
  };
}

export function StartConciergePanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [result, setResult] = useState<PurchaseStartConcierge | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function runConcierge() {
    setStatus("loading");
    try {
      const response = await fetch("/api/specpilot/start-concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`start concierge ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        concierge?: PurchaseStartConcierge;
      };
      if (!payload.ok || !payload.concierge) {
        throw new Error("start concierge rejected");
      }
      setResult(payload.concierge);
      setStatus("idle");
    } catch {
      setStatus("error");
      setResult(null);
    }
  }

  return (
    <section className="launchPublicSection launchStartConcierge" id="start-concierge">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Gauge size={16} />
            첫 구매 진단 콘시어지
          </div>
          <h2>첫 문장을 분석 가능한 구매 여정으로 바꿉니다.</h2>
          <p>
            예산, 목적, 필수 조건이 덜 정리된 방문자도 바로 진단하고 맞춤
            플레이북, 누락 질문, 분석 실행 CTA까지 이어줍니다.
          </p>
        </div>
        <span className={`pill ${result ? actionTone(result.primary_action.action_type) : "muted"}`}>
          {result ? `${result.readiness_score}점` : "즉시 진단"}
        </span>
      </div>

      <div className="launchStartConciergeGrid">
        <article className="launchStartConciergeForm">
          <label>
            첫 구매 문장
            <textarea
              value={form.query}
              onChange={(event) => update("query", event.target.value)}
            />
          </label>
          <div className="launchStartConciergeControls">
            <label>
              카테고리
              <select
                value={form.category}
                onChange={(event) => update("category", event.target.value as Category)}
              >
                <option value="desktop_pc">데스크톱 PC</option>
                <option value="laptop">노트북</option>
              </select>
            </label>
            <label>
              예산
              <input
                inputMode="numeric"
                value={form.budget}
                onChange={(event) => update("budget", event.target.value)}
              />
            </label>
          </div>
          <label>
            목적
            <input value={form.purpose} onChange={(event) => update("purpose", event.target.value)} />
          </label>
          <div className="launchStartConciergeControls">
            <label>
              필수 조건
              <textarea
                value={form.mustHaves}
                onChange={(event) => update("mustHaves", event.target.value)}
              />
            </label>
            <label>
              제외 조건
              <textarea
                value={form.exclusions}
                onChange={(event) => update("exclusions", event.target.value)}
              />
            </label>
          </div>
          <button type="button" onClick={runConcierge} disabled={status === "loading"}>
            {status === "loading" ? (
              <LoaderCircle className="spinIcon" size={16} />
            ) : (
              <Sparkles size={16} />
            )}
            진단 실행
          </button>
          {status === "error" ? (
            <p className="launchStartConciergeError">
              첫 구매 진단을 불러오지 못했습니다. 잠시 후 다시 시도하세요.
            </p>
          ) : null}
        </article>

        <article className="launchStartConciergeResult" aria-live="polite">
          {result ? (
            <>
              <div>
                <span className={`pill ${actionTone(result.primary_action.action_type)}`}>
                  {result.primary_action.label}
                </span>
                <h3>{result.headline}</h3>
                <p>{result.summary}</p>
                <strong>{result.conversion_prompt}</strong>
              </div>
              <div className="launchStartConciergeMetrics">
                <div>
                  <span>준비도</span>
                  <strong>{result.readiness_score}점</strong>
                </div>
                <div>
                  <span>플레이북</span>
                  <strong>{result.matched_playbook.title}</strong>
                </div>
              </div>
              <div className="launchStartConciergeMilestones">
                {result.milestones.map((milestone) => (
                  <div key={milestone.step}>
                    <span className={`pill ${tone(milestone.status)}`}>{milestone.step}</span>
                    <strong>{milestone.title}</strong>
                    <p>{milestone.detail}</p>
                    <small>{milestone.next_action}</small>
                  </div>
                ))}
              </div>
              <div className="launchStartConciergeProof">
                {result.proof_points.slice(0, 4).map((point) => (
                  <span key={point}>{point}</span>
                ))}
              </div>
              <div className="launchStartConciergeActions">
                {result.quick_actions.slice(0, 3).map((action) => {
                  const diagnosed = result.diagnosis.normalized_request;
                  if (action.action_type === "run_analysis") {
                    return (
                      <LaunchAnalysisLink
                        handoff={{
                          source: "start-concierge",
                          label: action.label,
                          query: diagnosed.query,
                          category: diagnosed.category,
                          budget_krw: diagnosed.budget_krw ?? undefined,
                          purpose: diagnosed.purpose,
                          must_haves: diagnosed.must_haves,
                          exclusions: diagnosed.exclusions,
                        }}
                        key={action.action_type}
                      >
                        <span>{action.label}</span>
                        <small>{action.reason}</small>
                        <ArrowRight size={15} />
                      </LaunchAnalysisLink>
                    );
                  }
                  return (
                    <a href={action.target} key={action.action_type}>
                      <span>{action.label}</span>
                      <small>{action.reason}</small>
                      <ArrowRight size={15} />
                    </a>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="launchStartConciergeEmpty">
              <Sparkles size={22} />
              <strong>조건이 흐릿할수록 먼저 진단합니다.</strong>
              <p>
                예산, 목적, 필수 조건, 제외 조건을 점검해 바로 분석할지,
                누락 질문부터 받을지 결정합니다.
              </p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
