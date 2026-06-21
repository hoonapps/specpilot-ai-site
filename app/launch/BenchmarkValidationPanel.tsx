"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Gauge,
  LoaderCircle,
  ShieldAlert,
  Thermometer,
} from "lucide-react";
import type {
  BenchmarkValidationRequest,
  Category,
  PublicBenchmarkValidationKit,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  primaryPurpose: string;
  cpuName: string;
  gpuName: string;
  ramGb: string;
  expectedCpuScore: string;
  observedCpuScore: string;
  expectedGpuScore: string;
  observedGpuScore: string;
  expectedSsdRead: string;
  observedSsdRead: string;
  maxCpuTemp: string;
  maxGpuTemp: string;
  fanNoiseNote: string;
  throttlingObserved: boolean;
  crashes: string;
  driverVersionsChecked: boolean;
  evidenceLinks: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  primaryPurpose: "QHD 영상 편집",
  cpuName: "Ryzen 7 7800X3D",
  gpuName: "RTX 4070 SUPER",
  ramGb: "32",
  expectedCpuScore: "18000",
  observedCpuScore: "17400",
  expectedGpuScore: "28000",
  observedGpuScore: "27200",
  expectedSsdRead: "7000",
  observedSsdRead: "6850",
  maxCpuTemp: "82",
  maxGpuTemp: "78",
  fanNoiseNote: "부하 시 정상 팬 소음",
  throttlingObserved: false,
  crashes: "",
  driverVersionsChecked: true,
  evidenceLinks: "benchmark://capture-1",
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function payloadFromForm(form: FormState): BenchmarkValidationRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    primary_purpose: form.primaryPurpose,
    cpu_name: form.cpuName,
    gpu_name: form.gpuName,
    ram_gb: parseNumber(form.ramGb) ?? 16,
    expected_cpu_score: parseNumber(form.expectedCpuScore),
    observed_cpu_score: parseNumber(form.observedCpuScore),
    expected_gpu_score: parseNumber(form.expectedGpuScore),
    observed_gpu_score: parseNumber(form.observedGpuScore),
    expected_ssd_read_mbps: parseNumber(form.expectedSsdRead),
    observed_ssd_read_mbps: parseNumber(form.observedSsdRead),
    max_cpu_temp_c: parseNumber(form.maxCpuTemp),
    max_gpu_temp_c: parseNumber(form.maxGpuTemp),
    fan_noise_note: form.fanNoiseNote,
    throttling_observed: form.throttlingObserved,
    crashes: lines(form.crashes),
    driver_versions_checked: form.driverVersionsChecked,
    evidence_links: lines(form.evidenceLinks),
    source: "launch_benchmark_validation",
  };
}

function tone(status: string) {
  if (status === "ok" || status === "ready") {
    return "ok";
  }
  return status === "blocker" || status === "hold" ? "danger" : "warn";
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

export function BenchmarkValidationPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicBenchmarkValidationKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/benchmark-validation-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`benchmark validation ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicBenchmarkValidationKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("benchmark validation rejected");
      }
      setKit(payload.kit);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function copyText(text: string | undefined) {
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <section className="launchPublicSection launchBenchmarkValidation" id="benchmark-validation">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Gauge size={16} />
            성능 벤치마크 검수
          </div>
          <h2>첫날 벤치마크를 정상 기준값과 반품 증거로 분리합니다.</h2>
          <p>
            CPU/GPU/SSD 점수, 최고 온도, 팬 소음, 스로틀링, 꺼짐 증상을 같은 기준으로 판정하고
            판매자 문의 문구까지 만듭니다.
          </p>
        </div>
        <span className="pill warn">성능 proof</span>
      </div>

      <div className="launchBenchmarkGrid">
        <article className="launchBenchmarkForm">
          <div className="launchBenchmarkControls">
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
              RAM
              <input inputMode="numeric" value={form.ramGb} onChange={(event) => update("ramGb", event.target.value)} />
            </label>
          </div>
          <label>
            제품명
            <input value={form.productTitle} onChange={(event) => update("productTitle", event.target.value)} />
          </label>
          <label>
            사용 목적
            <input
              value={form.primaryPurpose}
              onChange={(event) => update("primaryPurpose", event.target.value)}
            />
          </label>
          <div className="launchBenchmarkControls">
            <label>
              CPU
              <input value={form.cpuName} onChange={(event) => update("cpuName", event.target.value)} />
            </label>
            <label>
              GPU
              <input value={form.gpuName} onChange={(event) => update("gpuName", event.target.value)} />
            </label>
          </div>
          <div className="launchBenchmarkControls dense">
            <label>
              CPU 기대
              <input
                inputMode="numeric"
                value={form.expectedCpuScore}
                onChange={(event) => update("expectedCpuScore", event.target.value)}
              />
            </label>
            <label>
              CPU 실제
              <input
                inputMode="numeric"
                value={form.observedCpuScore}
                onChange={(event) => update("observedCpuScore", event.target.value)}
              />
            </label>
            <label>
              GPU 기대
              <input
                inputMode="numeric"
                value={form.expectedGpuScore}
                onChange={(event) => update("expectedGpuScore", event.target.value)}
              />
            </label>
            <label>
              GPU 실제
              <input
                inputMode="numeric"
                value={form.observedGpuScore}
                onChange={(event) => update("observedGpuScore", event.target.value)}
              />
            </label>
          </div>
          <div className="launchBenchmarkControls dense">
            <label>
              SSD 기대
              <input
                inputMode="numeric"
                value={form.expectedSsdRead}
                onChange={(event) => update("expectedSsdRead", event.target.value)}
              />
            </label>
            <label>
              SSD 실제
              <input
                inputMode="numeric"
                value={form.observedSsdRead}
                onChange={(event) => update("observedSsdRead", event.target.value)}
              />
            </label>
            <label>
              CPU 온도
              <input
                inputMode="numeric"
                value={form.maxCpuTemp}
                onChange={(event) => update("maxCpuTemp", event.target.value)}
              />
            </label>
            <label>
              GPU 온도
              <input
                inputMode="numeric"
                value={form.maxGpuTemp}
                onChange={(event) => update("maxGpuTemp", event.target.value)}
              />
            </label>
          </div>
          <div className="launchBenchmarkSwitches">
            <label>
              <input
                type="checkbox"
                checked={form.driverVersionsChecked}
                onChange={(event) => update("driverVersionsChecked", event.target.checked)}
              />
              드라이버 확인
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.throttlingObserved}
                onChange={(event) => update("throttlingObserved", event.target.checked)}
              />
              스로틀링 관찰
            </label>
          </div>
          <label>
            팬/소음 메모
            <input
              value={form.fanNoiseNote}
              onChange={(event) => update("fanNoiseNote", event.target.value)}
            />
          </label>
          <label>
            꺼짐/오류
            <textarea
              rows={3}
              value={form.crashes}
              onChange={(event) => update("crashes", event.target.value)}
              placeholder="렌더링 중 꺼짐&#10;블루스크린"
            />
          </label>
          <label>
            증거 링크/메모
            <textarea
              rows={2}
              value={form.evidenceLinks}
              onChange={(event) => update("evidenceLinks", event.target.value)}
            />
          </label>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void buildKit()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <Activity size={18} />}
            벤치마크 검수 만들기
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              성능 벤치마크 검수 키트를 만들지 못했습니다. 점수와 온도를 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchBenchmarkResult" aria-live="polite">
          {kit ? (
            <>
              <div className="launchBenchmarkScore">
                <span className={`pill ${tone(kit.performance_status)}`}>{kit.performance_status}</span>
                <strong>{kit.performance_score}</strong>
                <small>{kit.bottleneck_summary}</small>
              </div>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchBenchmarkCheckGrid">
                {kit.checks.slice(0, 8).map((check) => (
                  <article className={check.status} key={check.check_id}>
                    <span>{iconFor(check.status)} {check.label}</span>
                    <strong>{check.observed}</strong>
                    <small>{check.expected}</small>
                    <p>{check.action}</p>
                  </article>
                ))}
              </div>
              <div className="launchBenchmarkColumns">
                <div>
                  <strong>증거 체크</strong>
                  <ul>
                    {kit.evidence_checklist.slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>이슈 대응</strong>
                  <ul>
                    {kit.issue_triage.slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchBenchmarkSeller">
                <Thermometer size={18} />
                <p>{kit.seller_message}</p>
                <button type="button" onClick={() => void copyText(kit.seller_message)}>
                  <Copy size={16} />
                  판매자 문의 복사
                </button>
              </div>
              <div className="launchBenchmarkMessages">
                {kit.messages.map((message) => (
                  <button
                    type="button"
                    key={message.channel}
                    onClick={() => void copyText(message.copy_text)}
                  >
                    <Copy size={16} />
                    <span>{message.label}</span>
                    <small>{message.cta_label}</small>
                  </button>
                ))}
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "benchmark-validation-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    purpose: kit.product_title,
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" onClick={() => void copyText(kit.share_copy)}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "검수 요약 복사"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 성능 벤치마크 문구를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill warn">수령 첫날 성능</span>
              <h3>점수와 온도가 정상인지 모르면 불량 접수 타이밍을 놓칩니다.</h3>
              <p>
                기대 점수 대비 실제 성능, 최고 온도, 스로틀링, 꺼짐 증상을 함께 판정해
                정상 기준값 또는 반품/AS 증거로 남깁니다.
              </p>
              <ul>
                <li>CPU/GPU/SSD 점수를 기대값 대비 비율로 판정합니다.</li>
                <li>온도와 스로틀링은 반품/AS 우선순위로 분리합니다.</li>
                <li>판매자/제조사 문의 문구와 증거 체크리스트를 만듭니다.</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
