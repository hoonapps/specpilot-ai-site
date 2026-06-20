"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Copy,
  LoaderCircle,
  Monitor,
  ShieldAlert,
  Zap,
} from "lucide-react";
import type {
  Category,
  PublicSetupCompatibilityKit,
  SetupCompatibilityRequest,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  monitorResolution: string;
  psu: string;
  formFactor: string;
  weight: string;
  battery: string;
  budget: string;
  purpose: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  cpu: "Ryzen 7 7800X3D",
  gpu: "RTX 4070 SUPER",
  ram: "32",
  storage: "1000",
  monitorResolution: "QHD 1440p",
  psu: "750",
  formFactor: "ATX tower",
  weight: "",
  battery: "",
  budget: "2200000",
  purpose: "qhd_creator",
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function payloadFromForm(form: FormState): SetupCompatibilityRequest {
  return {
    category: form.category,
    cpu: form.cpu,
    gpu: form.gpu,
    ram_gb: parseNumber(form.ram),
    storage_gb: parseNumber(form.storage),
    monitor_resolution: form.monitorResolution,
    psu_watt: parseNumber(form.psu),
    form_factor: form.formFactor,
    weight_kg: parseNumber(form.weight),
    battery_wh: parseNumber(form.battery),
    budget_krw: parseNumber(form.budget) ?? 2_200_000,
    purpose: form.purpose,
    source: "launch_setup_compatibility",
  };
}

function tone(status: string) {
  if (status === "ok" || status === "ready") {
    return "ok";
  }
  return status === "blocker" || status === "hold" ? "danger" : "warn";
}

function verdictLabel(verdict: string) {
  if (verdict === "ready") {
    return "결제 가능";
  }
  if (verdict === "verify") {
    return "확인 필요";
  }
  return "결제 보류";
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

export function SetupCompatibilityPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicSetupCompatibilityKit | null>(null);
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function checkCompatibility() {
    setStatus("checking");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/setup-compatibility-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`setup compatibility ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicSetupCompatibilityKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("setup compatibility rejected");
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
    <section className="launchPublicSection launchSetupCompatibility" id="setup-compatibility">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Cpu size={16} />
            세팅 호환성 키트
          </div>
          <h2>CPU, GPU, 모니터, 파워 조합을 먼저 걸러냅니다.</h2>
          <p>
            견적을 만들기 전 병목, 전력 여유, 메모리, 저장장치, 휴대성 리스크를 공개 화면에서
            빠르게 확인합니다.
          </p>
        </div>
        <span className="pill ok">컴퓨터 세팅 검수</span>
      </div>

      <div className="launchSetupCompatibilityGrid">
        <article className="launchSetupCompatibilityForm">
          <div className="launchSetupControls">
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
              목적
              <select
                value={form.purpose}
                onChange={(event) => update("purpose", event.target.value)}
              >
                <option value="qhd_creator">QHD 게임·영상 편집</option>
                <option value="portable_creator">휴대형 크리에이터</option>
                <option value="team_office">팀/사무 구매</option>
                <option value="4k_creator">4K 고성능 작업</option>
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
          <div className="launchSetupControls dense">
            <label>
              CPU
              <input value={form.cpu} onChange={(event) => update("cpu", event.target.value)} />
            </label>
            <label>
              GPU
              <input value={form.gpu} onChange={(event) => update("gpu", event.target.value)} />
            </label>
            <label>
              RAM GB
              <input
                inputMode="numeric"
                value={form.ram}
                onChange={(event) => update("ram", event.target.value)}
              />
            </label>
            <label>
              SSD GB
              <input
                inputMode="numeric"
                value={form.storage}
                onChange={(event) => update("storage", event.target.value)}
              />
            </label>
          </div>
          <div className="launchSetupControls dense">
            <label>
              모니터
              <input
                value={form.monitorResolution}
                onChange={(event) => update("monitorResolution", event.target.value)}
              />
            </label>
            <label>
              파워 W
              <input
                inputMode="numeric"
                value={form.psu}
                onChange={(event) => update("psu", event.target.value)}
              />
            </label>
            <label>
              케이스/폼팩터
              <input
                value={form.formFactor}
                onChange={(event) => update("formFactor", event.target.value)}
              />
            </label>
            <label>
              무게/배터리
              <input
                value={[form.weight, form.battery].filter(Boolean).join("kg / ") || ""}
                onChange={(event) => {
                  const [weight = "", battery = ""] = event.target.value.split("/");
                  update("weight", weight.replace("kg", "").trim());
                  update("battery", battery.replace("Wh", "").trim());
                }}
                placeholder="1.7 / 75"
              />
            </label>
          </div>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void checkCompatibility()}
            disabled={status === "checking"}
          >
            {status === "checking" ? <LoaderCircle size={18} /> : <Zap size={18} />}
            세팅 호환성 확인
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              세팅 호환성 결과를 만들지 못했습니다. 입력값을 확인하고 다시 시도하세요.
            </p>
          ) : null}
        </article>

        <article className="launchSetupCompatibilityResult" aria-live="polite">
          {kit ? (
            <>
              <span className={`pill ${tone(kit.verdict)}`}>{verdictLabel(kit.verdict)}</span>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchSetupMetricGrid">
                <div>
                  <Monitor size={16} />
                  <span>호환성</span>
                  <strong>{Math.round(kit.compatibility_score)}점</strong>
                </div>
                <div>
                  <ShieldAlert size={16} />
                  <span>Blocker</span>
                  <strong>{kit.blocker_count}개</strong>
                </div>
                <div>
                  <AlertTriangle size={16} />
                  <span>Warning</span>
                  <strong>{kit.warning_count}개</strong>
                </div>
              </div>
              <div className="launchSetupCheckGrid">
                {kit.checks.map((check) => (
                  <article className={check.status} key={check.check_id}>
                    <span>{iconFor(check.status)} {check.label}</span>
                    <strong>{check.observed}</strong>
                    <p>{check.recommendation}</p>
                    <small>{check.impact}</small>
                  </article>
                ))}
              </div>
              <div className="launchSetupPrefill">
                <strong>검수 prefill</strong>
                <p>{kit.scanner_prefill.option_text || kit.scanner_prefill.product_title}</p>
                <strong>다음 수정</strong>
                <ul>
                  {kit.recommended_changes.slice(0, 5).map((change) => (
                    <li key={change}>{change}</li>
                  ))}
                </ul>
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "setup-compatibility-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: kit.scanner_prefill.budget_krw,
                    purpose: kit.scanner_prefill.product_title,
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" onClick={() => void copyShare()}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "호환성 공유"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 호환성 문구를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill warn">조합 먼저 확인</span>
              <h3>비싼 부품을 사기 전에 병목과 과투자를 확인하세요.</h3>
              <p>
                QHD/4K 모니터와 GPU 등급, 파워 용량, RAM/SSD 용량, 노트북 휴대성을 한 번에
                점검합니다.
              </p>
              <ul>
                <li>RTX 4070급 이상은 파워 용량과 케이스 여유를 먼저 확인합니다.</li>
                <li>편집/개발 목적은 32GB RAM과 1TB SSD를 기준으로 봅니다.</li>
                <li>노트북은 외장 GPU, 무게, 배터리를 같은 화면에서 봅니다.</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
