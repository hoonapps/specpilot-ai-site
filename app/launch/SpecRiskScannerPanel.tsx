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
  PublicCheckoutNudgeKit,
  PublicListingDecoderKit,
  PublicSpecRescueKit,
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
  const [decoderKit, setDecoderKit] = useState<PublicListingDecoderKit | null>(null);
  const [nudgeKit, setNudgeKit] = useState<PublicCheckoutNudgeKit | null>(null);
  const [rescueKit, setRescueKit] = useState<PublicSpecRescueKit | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "error">("idle");
  const [decoderStatus, setDecoderStatus] = useState<"idle" | "decoding" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [decoderCopyStatus, setDecoderCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [nudgeCopyStatus, setNudgeCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [rescueCopyStatus, setRescueCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function applyScannerPrefill(kit: PublicListingDecoderKit) {
    const prefill = kit.scanner_prefill;
    setForm((current) => ({
      ...current,
      category: prefill.category,
      productTitle: prefill.product_title,
      optionText: prefill.option_text,
      cartTotal: prefill.cart_total_krw == null ? current.cartTotal : String(prefill.cart_total_krw),
      budget: String(prefill.budget_krw),
      expectedCpu: prefill.expected_cpu,
      expectedGpu: prefill.expected_gpu,
      expectedRam: prefill.expected_ram_gb == null ? "" : String(prefill.expected_ram_gb),
      expectedStorage:
        prefill.expected_storage_gb == null ? "" : String(prefill.expected_storage_gb),
      expectedOs: prefill.expected_os,
      evidenceText: current.evidenceText || prefill.evidence_text,
    }));
  }

  async function decodeListing() {
    setDecoderStatus("decoding");
    setDecoderCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/listing-decoder-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          product_title: form.productTitle,
          option_text: form.optionText,
          budget_krw: parseNumber(form.budget) ?? 2_200_000,
          cart_total_krw: parseNumber(form.cartTotal),
          purpose: form.category === "laptop" ? "portable_creator" : "qhd_creator",
          source: "launch_spec_scanner",
        }),
      });
      if (!response.ok) {
        throw new Error(`decoder ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicListingDecoderKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("decoder rejected");
      }
      setDecoderKit(payload.kit);
      applyScannerPrefill(payload.kit);
      setDecoderStatus("idle");
    } catch {
      setDecoderStatus("error");
    }
  }

  async function scan() {
    setStatus("scanning");
    setCopyStatus("idle");
    setNudgeCopyStatus("idle");
    setRescueCopyStatus("idle");
    setNudgeKit(null);
    setRescueKit(null);
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
      void loadNudgeKit(payload.result);
      void loadRescueKit(payload.result);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function loadNudgeKit(scanResult: SpecRiskScannerResult) {
    try {
      const response = await fetch("/api/specpilot/checkout-nudge-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: scanResult.category,
          product_title: scanResult.product_title,
          verdict: scanResult.verdict,
          budget_krw: scanResult.budget_krw,
          cart_total_krw: scanResult.cart_total_krw,
          blocker_count: scanResult.blocker_count,
          warning_count: scanResult.warning_count,
          missing_evidence: scanResult.missing_evidence,
          source: "launch_spec_scanner",
        }),
      });
      if (!response.ok) {
        throw new Error(`nudge ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicCheckoutNudgeKit;
      };
      if (payload.ok && payload.kit) {
        setNudgeKit(payload.kit);
      }
    } catch {
      setNudgeKit(null);
    }
  }

  async function loadRescueKit(scanResult: SpecRiskScannerResult) {
    try {
      const response = await fetch("/api/specpilot/spec-rescue-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: scanResult.category,
          product_title: scanResult.product_title,
          verdict: scanResult.verdict,
          budget_krw: scanResult.budget_krw,
          cart_total_krw: scanResult.cart_total_krw,
          blocker_count: scanResult.blocker_count,
          warning_count: scanResult.warning_count,
          missing_evidence: scanResult.missing_evidence,
          purpose: scanResult.category === "laptop" ? "portable_creator" : "qhd_creator",
          source: "launch_spec_scanner",
        }),
      });
      if (!response.ok) {
        throw new Error(`rescue ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicSpecRescueKit;
      };
      if (payload.ok && payload.kit) {
        setRescueKit(payload.kit);
      }
    } catch {
      setRescueKit(null);
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

  async function copyDecoder() {
    if (!decoderKit) {
      return;
    }
    try {
      await navigator.clipboard.writeText(decoderKit.share_copy);
      setDecoderCopyStatus("copied");
    } catch {
      setDecoderCopyStatus("error");
    }
  }

  async function copyNudge() {
    if (!nudgeKit) {
      return;
    }
    try {
      await navigator.clipboard.writeText(nudgeKit.reminder_copy);
      setNudgeCopyStatus("copied");
    } catch {
      setNudgeCopyStatus("error");
    }
  }

  async function copyRescue() {
    if (!rescueKit) {
      return;
    }
    try {
      await navigator.clipboard.writeText(rescueKit.share_copy);
      setRescueCopyStatus("copied");
    } catch {
      setRescueCopyStatus("error");
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
          <div className="launchListingDecoder">
            <div>
              <span className="pill warn">상품명 해석</span>
              <strong>쇼핑몰 상품명을 먼저 구조화합니다</strong>
              <p>
                CPU/GPU/RAM/SSD/OS와 리퍼·전시·해외 조건을 먼저 뽑아 검수 폼에 채웁니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void decodeListing()}
              disabled={decoderStatus === "decoding"}
            >
              {decoderStatus === "decoding" ? (
                <LoaderCircle size={16} />
              ) : (
                <ClipboardCheck size={16} />
              )}
              상품명 해석
            </button>
            {decoderStatus === "error" ? (
              <p className="launchPersonaError">
                상품명 해석 결과를 만들지 못했습니다. 상품명과 옵션명을 확인하세요.
              </p>
            ) : null}
            {decoderKit ? (
              <div className="launchListingDecoderResult">
                <div>
                  <strong>{decoderKit.headline}</strong>
                  <p>{decoderKit.summary}</p>
                  <small>해석 신뢰도 {Math.round(decoderKit.confidence_score)}점</small>
                </div>
                <div className="launchListingFactGrid">
                  {decoderKit.decoded_specs.slice(0, 7).map((fact) => (
                    <article className={fact.status} key={fact.slot}>
                      <span>{fact.label}</span>
                      <strong>{fact.value}</strong>
                      <small>{fact.recommendation}</small>
                    </article>
                  ))}
                </div>
                <div className="launchSpecScannerActions">
                  <LaunchAnalysisLink
                    className="miniCta"
                    handoff={{
                      source: "listing-decoder-kit",
                      label: decoderKit.primary_cta_label,
                      query: decoderKit.analysis_prefill,
                      category: decoderKit.category,
                      budget_krw: decoderKit.scanner_prefill.budget_krw,
                      purpose: decoderKit.product_title,
                    }}
                  >
                    {decoderKit.primary_cta_label}
                  </LaunchAnalysisLink>
                  <button type="button" onClick={() => void applyScannerPrefill(decoderKit)}>
                    <ClipboardCheck size={16} />
                    검수 폼 채우기
                  </button>
                  <button type="button" onClick={() => void copyDecoder()}>
                    <Copy size={16} />
                    {decoderCopyStatus === "copied" ? "복사됨" : "해석 공유"}
                  </button>
                </div>
                {decoderKit.seller_questions.length ? (
                  <ul>
                    {decoderKit.seller_questions.slice(0, 3).map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                ) : null}
                {decoderCopyStatus === "error" ? (
                  <p className="launchPersonaError">
                    클립보드 권한이 없어 상품명 해석 문구를 복사하지 못했습니다.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
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
              {nudgeKit ? (
                <div className={`launchCheckoutNudge ${nudgeKit.priority}`}>
                  <div>
                    <span className={`pill ${tone(nudgeKit.priority)}`}>
                      {nudgeKit.priority === "ok" ? "후속 준비" : "후속 필요"}
                    </span>
                    <h3>{nudgeKit.headline}</h3>
                    <p>{nudgeKit.summary}</p>
                    <strong>{nudgeKit.next_best_action}</strong>
                  </div>
                  <div className="launchCheckoutNudgeSteps">
                    {nudgeKit.nudges.map((step) => (
                      <article key={step.step_id}>
                        <span>{step.timing}</span>
                        <h4>{step.label}</h4>
                        <p>{step.message}</p>
                        <small>{step.trigger}</small>
                      </article>
                    ))}
                  </div>
                  <div className="launchSpecScannerActions">
                    <LaunchAnalysisLink
                      className="miniCta"
                      handoff={{
                        source: "checkout-nudge",
                        label: nudgeKit.primary_cta_label,
                        query: nudgeKit.analysis_prefill,
                        category: nudgeKit.category,
                        budget_krw: result.budget_krw,
                        purpose: nudgeKit.product_title,
                      }}
                    >
                      {nudgeKit.primary_cta_label}
                    </LaunchAnalysisLink>
                    <button type="button" onClick={() => void copyNudge()}>
                      <Copy size={16} />
                      {nudgeCopyStatus === "copied" ? "복사됨" : "후속 알림 복사"}
                    </button>
                  </div>
                  {nudgeCopyStatus === "error" ? (
                    <p className="launchPersonaError">
                      클립보드 권한이 없어 후속 알림을 복사하지 못했습니다.
                    </p>
                  ) : null}
                </div>
              ) : null}
              {rescueKit ? (
                <div className={`launchSpecRescue ${rescueKit.rescue_priority}`}>
                  <div>
                    <span className={`pill ${tone(rescueKit.rescue_priority)}`}>
                      {rescueKit.rescue_priority === "blocker" ? "대체 우선" : "대체 비교"}
                    </span>
                    <h3>{rescueKit.headline}</h3>
                    <p>{rescueKit.summary}</p>
                    <strong>{rescueKit.decision_rule}</strong>
                  </div>
                  <div className="launchSpecRescueGrid">
                    {rescueKit.alternatives.map((alternative) => (
                      <article key={alternative.alternative_id}>
                        <span className={`pill ${tone(alternative.status)}`}>
                          {alternative.role_label}
                        </span>
                        <h4>{alternative.model_name}</h4>
                        <strong>{won(alternative.effective_price_krw)}</strong>
                        <p>{alternative.rescue_reason}</p>
                        <small>{alternative.tradeoff}</small>
                        <code>{alternative.search_query}</code>
                      </article>
                    ))}
                  </div>
                  <div className="launchSpecScannerPrefill compact">
                    <strong>판매자 확인 메시지</strong>
                    <p>{rescueKit.seller_message}</p>
                  </div>
                  <div className="launchSpecScannerActions">
                    <LaunchAnalysisLink
                      className="miniCta"
                      handoff={{
                        source: "spec-rescue-kit",
                        label: rescueKit.primary_cta_label,
                        query: rescueKit.analysis_prefill,
                        category: rescueKit.category,
                        budget_krw: result.budget_krw,
                        purpose: rescueKit.product_title,
                      }}
                    >
                      {rescueKit.primary_cta_label}
                    </LaunchAnalysisLink>
                    <button type="button" onClick={() => void copyRescue()}>
                      <Copy size={16} />
                      {rescueCopyStatus === "copied" ? "복사됨" : "대체 후보 복사"}
                    </button>
                  </div>
                  {rescueCopyStatus === "error" ? (
                    <p className="launchPersonaError">
                      클립보드 권한이 없어 대체 후보를 복사하지 못했습니다.
                    </p>
                  ) : null}
                </div>
              ) : null}
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
