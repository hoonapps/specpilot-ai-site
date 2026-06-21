"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Copy,
  LoaderCircle,
  Search,
  Send,
  ShieldAlert,
} from "lucide-react";
import type {
  BuildBlueprintRequest,
  Category,
  PublicBuildBlueprintKit,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  budget: string;
  purpose: string;
  priorityMode: string;
  mustHaves: string;
  exclusions: string;
  monitorResolution: string;
  portability: string;
  timing: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  budget: "2200000",
  purpose: "QHD 게임과 영상 편집",
  priorityMode: "balanced",
  mustHaves: "RTX 4070급 GPU\nRAM 32GB\n국내 AS",
  exclusions: "해외 리퍼\n반품 불가\nFreeDOS 미고지",
  monitorResolution: "QHD",
  portability: "balanced",
  timing: "within_14_days",
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 2_200_000;
}

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function payloadFromForm(form: FormState): BuildBlueprintRequest {
  return {
    category: form.category,
    budget_krw: parseNumber(form.budget),
    purpose: form.purpose,
    priority_mode: form.priorityMode,
    must_haves: lines(form.mustHaves),
    exclusions: lines(form.exclusions),
    owned_parts: [],
    monitor_resolution: form.monitorResolution,
    portability: form.portability,
    purchase_timing: form.timing,
    source: "launch_build_blueprint",
  };
}

function tone(status: string) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function iconFor(status: string) {
  if (status === "ok") {
    return <CheckCircle2 size={15} />;
  }
  if (status === "blocker") {
    return <ShieldAlert size={15} />;
  }
  return <AlertTriangle size={15} />;
}

export function BuildBlueprintPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicBuildBlueprintKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/build-blueprint-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`build blueprint ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicBuildBlueprintKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("build blueprint rejected");
      }
      setKit(payload.kit);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function copyShare() {
    if (!kit) {
      return;
    }
    try {
      await navigator.clipboard.writeText(kit.share_copy);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <section className="launchPublicSection launchBuildBlueprint" id="build-blueprint">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <ClipboardList size={16} />
            구매 설계도
          </div>
          <h2>예산을 부품과 스펙 목표로 쪼개 가격비교 검색어까지 만듭니다.</h2>
          <p>
            후보를 보기 전에 GPU, CPU, RAM, SSD, AS와 반품 조건의 예산 범위를 정하고
            피해야 할 판매 조건을 검색 단계에서 걸러냅니다.
          </p>
        </div>
        <span className="pill ok">가격비교 준비</span>
      </div>

      <div className="launchBuildBlueprintGrid">
        <article className="launchBuildBlueprintForm">
          <div className="launchBuildBlueprintControls">
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
              <input value={form.budget} onChange={(event) => update("budget", event.target.value)} />
            </label>
            <label>
              우선순위
              <select
                value={form.priorityMode}
                onChange={(event) => update("priorityMode", event.target.value)}
              >
                <option value="balanced">균형</option>
                <option value="performance">성능 우선</option>
                <option value="budget">가성비 우선</option>
              </select>
            </label>
          </div>

          <div className="launchBuildBlueprintControls compact">
            <label>
              해상도
              <select
                value={form.monitorResolution}
                onChange={(event) => update("monitorResolution", event.target.value)}
              >
                <option value="FHD">FHD</option>
                <option value="QHD">QHD</option>
                <option value="4K">4K</option>
              </select>
            </label>
            <label>
              구매 일정
              <select value={form.timing} onChange={(event) => update("timing", event.target.value)}>
                <option value="within_7_days">7일 안</option>
                <option value="within_14_days">14일 안</option>
                <option value="within_30_days">30일 안</option>
                <option value="wait_for_discount">할인 대기</option>
              </select>
            </label>
          </div>

          <label>
            용도
            <input value={form.purpose} onChange={(event) => update("purpose", event.target.value)} />
          </label>
          <label>
            필수 조건
            <textarea value={form.mustHaves} onChange={(event) => update("mustHaves", event.target.value)} />
          </label>
          <label>
            제외 조건
            <textarea value={form.exclusions} onChange={(event) => update("exclusions", event.target.value)} />
          </label>

          <button className="primaryButton" type="button" onClick={buildKit} disabled={status === "loading"}>
            {status === "loading" ? <LoaderCircle className="spin" size={16} /> : <Send size={16} />}
            구매 설계도 생성
          </button>
          {status === "error" ? <p className="formError">구매 설계도를 생성하지 못했습니다.</p> : null}
        </article>

        <article className="launchBuildBlueprintResult">
          {kit ? (
            <>
              <div className="launchBuildBlueprintScore">
                <span className={`pill ${tone(kit.blueprint_status)}`}>{kit.blueprint_status}</span>
                <strong>{kit.blueprint_score}점</strong>
                <small>{kit.component_budget_total_krw.toLocaleString("ko-KR")}원 배분</small>
              </div>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>

              <div className="launchBuildBlueprintParts">
                {kit.components.slice(0, 6).map((component) => (
                  <article key={component.component_id}>
                    <span>
                      {iconFor(component.priority)}
                      {component.label}
                    </span>
                    <strong>{component.target_spec}</strong>
                    <small>
                      {component.budget_min_krw.toLocaleString("ko-KR")}~
                      {component.budget_max_krw.toLocaleString("ko-KR")}원
                    </small>
                  </article>
                ))}
              </div>

              <div className="launchBuildBlueprintSearch">
                {kit.search_queries.slice(0, 3).map((query) => (
                  <article key={query.channel}>
                    <span>
                      <Search size={15} />
                      {query.channel}
                    </span>
                    <strong>{query.query}</strong>
                    <p>{query.intent}</p>
                  </article>
                ))}
              </div>

              <div className="launchBuildBlueprintColumns">
                <div>
                  <strong>호환성 규칙</strong>
                  <ul>
                    {kit.compatibility_rules.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>피해야 할 조건</strong>
                  <ul>
                    {kit.avoid_conditions.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="launchBuildBlueprintActions">
                <LaunchAnalysisLink
                  className="primaryButton"
                  handoff={{
                    source: "build-blueprint-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: kit.budget_krw,
                    purpose: form.purpose,
                    must_haves: lines(form.mustHaves),
                    exclusions: lines(form.exclusions),
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" className="secondaryButton" onClick={copyShare}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "설계도 복사"}
                </button>
              </div>
              {copyStatus === "error" ? <p className="formError">설계도 복사에 실패했습니다.</p> : null}
            </>
          ) : (
            <div className="emptyState">
              <ClipboardList size={24} />
              <strong>가격비교 검색 전에 부품별 예산과 제외 조건을 고정하세요.</strong>
              <p>같은 예산이라도 GPU, RAM, AS, 반품 조건을 먼저 나누면 후보 비교가 훨씬 빨라집니다.</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
