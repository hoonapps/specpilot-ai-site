"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  LoaderCircle,
  ShieldAlert,
  ShoppingCart,
} from "lucide-react";
import type {
  Category,
  PublicSpecRiskScanner,
  SpecRiskScannerRequest,
  SpecRiskScannerResult,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type SpecRiskScannerPanelProps = {
  scanner: PublicSpecRiskScanner;
  isFallback?: boolean;
};

type FormState = {
  category: Category;
  productTitle: string;
  optionText: string;
  cartTotal: string;
  budget: string;
  expectedCpu: string;
  expectedGpu: string;
  expectedRam: string;
  expectedStorage: string;
  expectedOs: string;
  evidenceText: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  optionText:
    "장바구니 옵션: Ryzen 7 7800X3D / RTX 4070 SUPER / RAM 32GB / SSD 1TB / Windows 11 Pro",
  cartTotal: "2185000",
  budget: "2200000",
  expectedCpu: "Ryzen 7 7800X3D",
  expectedGpu: "RTX 4070 SUPER",
  expectedRam: "32",
  expectedStorage: "1000",
  expectedOs: "Windows 11 Pro",
  evidenceText:
    "최종 결제 총액 2,185,000원, 배송 내일 출고, 반품 7일, AS 1년, 판매자 문의 답변 확보",
};

function won(value: number | null | undefined) {
  if (value == null) {
    return "미입력";
  }
  return `${value.toLocaleString("ko-KR")}원`;
}

function tone(status: string) {
  if (status === "ok" || status === "ready") {
    return "ok";
  }
  return status === "blocker" || status === "hold" ? "danger" : "warn";
}

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function payloadFromForm(form: FormState): SpecRiskScannerRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    option_text: form.optionText,
    cart_total_krw: parseNumber(form.cartTotal),
    budget_krw: parseNumber(form.budget) ?? 2_200_000,
    expected_cpu: form.expectedCpu,
    expected_gpu: form.expectedGpu,
    expected_ram_gb: parseNumber(form.expectedRam),
    expected_storage_gb: parseNumber(form.expectedStorage),
    expected_os: form.expectedOs,
    evidence_text: form.evidenceText,
    source: "launch_page",
  };
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

export function SpecRiskScannerPanel({
  scanner,
  isFallback = false,
}: SpecRiskScannerPanelProps) {
  const [form, setForm] = useState<FormState>(demoForm);
  const [result, setResult] = useState<SpecRiskScannerResult | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function scan() {
    setStatus("scanning");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/spec-risk-scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`scanner ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        result?: SpecRiskScannerResult;
      };
      if (!payload.ok || !payload.result) {
        throw new Error("scanner rejected");
      }
      setResult(payload.result);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function copyShare() {
    if (!result) {
      return;
    }
    try {
      await navigator.clipboard.writeText(result.share_copy);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <section className="launchPublicSection launchSpecScanner" id="spec-scanner">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <ClipboardCheck size={16} />
            옵션/사양 빠른 검수기
          </div>
          <h2>{scanner.headline}</h2>
          <p>{scanner.summary}</p>
        </div>
        <span className="pill ok">
          {isFallback ? "검수기 폴백" : "30초 검수"}
        </span>
      </div>

      <div className="launchSpecScannerGrid">
        <article className="launchSpecScannerForm">
          <div className="launchSpecScannerControls">
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
              상품명
              <input
                value={form.productTitle}
                onChange={(event) => update("productTitle", event.target.value)}
              />
            </label>
            <label>
              최종가
              <input
                inputMode="numeric"
                value={form.cartTotal}
                onChange={(event) => update("cartTotal", event.target.value)}
              />
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
            장바구니 옵션명
            <textarea
              value={form.optionText}
              onChange={(event) => update("optionText", event.target.value)}
            />
          </label>
          <div className="launchSpecScannerControls dense">
            <label>
              기대 CPU
              <input
                value={form.expectedCpu}
                onChange={(event) => update("expectedCpu", event.target.value)}
              />
            </label>
            <label>
              기대 GPU
              <input
                value={form.expectedGpu}
                onChange={(event) => update("expectedGpu", event.target.value)}
              />
            </label>
            <label>
              RAM GB
              <input
                inputMode="numeric"
                value={form.expectedRam}
                onChange={(event) => update("expectedRam", event.target.value)}
              />
            </label>
            <label>
              SSD GB
              <input
                inputMode="numeric"
                value={form.expectedStorage}
                onChange={(event) => update("expectedStorage", event.target.value)}
              />
            </label>
          </div>
          <label>
            OS와 결제 증거
            <textarea
              value={`${form.expectedOs}\n${form.evidenceText}`}
              onChange={(event) => {
                const [expectedOs = "", ...evidenceLines] =
                  event.target.value.split("\n");
                update("expectedOs", expectedOs);
                update("evidenceText", evidenceLines.join("\n"));
              }}
            />
          </label>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void scan()}
            disabled={status === "scanning"}
          >
            {status === "scanning" ? (
              <LoaderCircle size={18} />
            ) : (
              <ShoppingCart size={18} />
            )}
            결제 전 검수 실행
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              검수 결과를 만들지 못했습니다. 잠시 후 다시 시도하세요.
            </p>
          ) : null}
        </article>

        <article className="launchSpecScannerResult" aria-live="polite">
          {result ? (
            <>
              <span className={`pill ${tone(result.verdict)}`}>
                {verdictLabel(result.verdict)}
              </span>
              <h3>{result.headline}</h3>
              <p>{result.summary}</p>
              <div className="launchSpecScannerNumbers">
                <div>
                  <span>준비도</span>
                  <strong>{Math.round(result.readiness_score)}점</strong>
                </div>
                <div>
                  <span>최종가</span>
                  <strong>{won(result.cart_total_krw)}</strong>
                </div>
                <div>
                  <span>Blocker</span>
                  <strong>{result.blocker_count}개</strong>
                </div>
                <div>
                  <span>Warning</span>
                  <strong>{result.warning_count}개</strong>
                </div>
              </div>
              <div className={`launchSpecSafetyBrief ${result.verdict}`}>
                <strong>구매 세이프티 브리프</strong>
                <p>{result.purchase_safety_brief}</p>
                <small>{result.checkout_next_step}</small>
              </div>
              <div className="launchSpecBriefGrid">
                <div>
                  <strong>판매자 확인 질문</strong>
                  <ul>
                    {result.seller_questions.slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>결제 전 캡처</strong>
                  <ul>
                    {result.capture_checklist.slice(0, 6).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchSpecScannerChecks">
                {result.checks.slice(0, 8).map((check) => (
                  <div className={check.status} key={check.check_id}>
                    <span>
                      {check.status === "ok" ? (
                        <CheckCircle2 size={15} />
                      ) : check.status === "blocker" ? (
                        <ShieldAlert size={15} />
                      ) : (
                        <AlertTriangle size={15} />
                      )}
                      {check.label}
                    </span>
                    <strong>{check.observed}</strong>
                    <p>{check.recommendation}</p>
                  </div>
                ))}
              </div>
              <div className="launchSpecScannerPrefill">
                <strong>승인/공유 요약</strong>
                <p>{result.approval_brief}</p>
                <strong>분석 요청 prefill</strong>
                <p>{result.analysis_prefill}</p>
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "spec-risk-scanner",
                    label: result.primary_cta_label,
                    query: result.analysis_prefill,
                    category: result.category,
                    budget_krw: result.budget_krw,
                    purpose: result.product_title,
                  }}
                >
                  {result.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" onClick={() => void copyShare()}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "공유 문구 복사"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill warn">결제 직전 검수</span>
              <h3>장바구니 문구를 붙여 넣으면 보류 사유가 바로 보입니다</h3>
              <p>
                옵션명이 기대 사양과 다르거나 최종가가 예산을 넘으면 결제 전에
                blocker로 표시합니다.
              </p>
              <ul>
                {scanner.required_evidence.slice(0, 4).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
