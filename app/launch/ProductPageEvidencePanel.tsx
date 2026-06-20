"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileSearch,
  LoaderCircle,
  ScanLine,
  ShieldAlert,
} from "lucide-react";
import type {
  Category,
  ProductPageEvidenceRequest,
  PublicProductPageEvidenceKit,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  url: string;
  productTitle: string;
  expectedModel: string;
  expectedCpu: string;
  expectedGpu: string;
  expectedRam: string;
  expectedStorage: string;
  expectedOs: string;
  budget: string;
  sellerName: string;
  pageText: string;
  riskTerms: string;
};

const demoText = [
  "Creator RTX 4070 SUPER Build Ryzen 7 7800X3D RTX 4070 SUPER",
  "RAM 32GB SSD 1TB Windows 11 판매중 재고 있음",
  "최종 결제 금액 2,165,000원 무료배송 카드 할인 40,000원",
  "국내 제조사 AS 반품 7일",
].join(" ");

const demoForm: FormState = {
  category: "desktop_pc",
  url: "https://shop.example.com/product/creator-4070-super",
  productTitle: "Creator RTX 4070 SUPER Build",
  expectedModel: "Creator RTX 4070 SUPER Build",
  expectedCpu: "Ryzen 7 7800X3D",
  expectedGpu: "RTX 4070 SUPER",
  expectedRam: "32",
  expectedStorage: "1000",
  expectedOs: "Windows 11",
  budget: "2200000",
  sellerName: "PC Mall",
  pageText: demoText,
  riskTerms: "",
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

function payloadFromForm(form: FormState): ProductPageEvidenceRequest {
  return {
    category: form.category,
    url: form.url,
    product_title: form.productTitle,
    expected_model: form.expectedModel,
    expected_cpu: form.expectedCpu,
    expected_gpu: form.expectedGpu,
    expected_ram_gb: parseNumber(form.expectedRam),
    expected_storage_gb: parseNumber(form.expectedStorage),
    expected_os: form.expectedOs,
    budget_krw: parseNumber(form.budget) ?? 2_200_000,
    seller_name: form.sellerName,
    page_text: form.pageText,
    html_snapshot: "",
    risk_terms: lines(form.riskTerms),
    source: "launch_product_page_evidence",
  };
}

function tone(status: string) {
  if (status === "ok" || status === "ready" || status === "in_stock") {
    return "ok";
  }
  return status === "blocker" || status === "sold_out" ? "danger" : "warn";
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

function money(value: number | null) {
  return value === null ? "미확인" : `${value.toLocaleString("ko-KR")}원`;
}

export function ProductPageEvidencePanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicProductPageEvidenceKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/product-page-evidence-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`product page evidence ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicProductPageEvidenceKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("product page evidence rejected");
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
    <section className="launchPublicSection launchProductEvidence" id="product-page-evidence">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <FileSearch size={16} />
            상품 페이지 근거 인입
          </div>
          <h2>상품 URL과 페이지 문구를 가격·재고·모델명 근거로 바꿉니다.</h2>
          <p>
            외부 사이트를 직접 긁지 않고 사용자가 붙여 넣은 문구만 분석해 실구매가, 재고,
            모델명 일치도, 판매자 확인 질문을 만듭니다.
          </p>
        </div>
        <span className="pill ok">safe snapshot</span>
      </div>

      <div className="launchProductEvidenceGrid">
        <article className="launchProductEvidenceForm">
          <div className="launchProductEvidenceControls">
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
              판매자
              <input value={form.sellerName} onChange={(event) => update("sellerName", event.target.value)} />
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
            상품 URL
            <input value={form.url} onChange={(event) => update("url", event.target.value)} />
          </label>
          <div className="launchProductEvidenceControls">
            <label>
              후보명
              <input
                value={form.productTitle}
                onChange={(event) => update("productTitle", event.target.value)}
              />
            </label>
            <label>
              기대 모델명
              <input
                value={form.expectedModel}
                onChange={(event) => update("expectedModel", event.target.value)}
              />
            </label>
          </div>
          <div className="launchProductEvidenceControls dense">
            <label>
              CPU
              <input value={form.expectedCpu} onChange={(event) => update("expectedCpu", event.target.value)} />
            </label>
            <label>
              GPU
              <input value={form.expectedGpu} onChange={(event) => update("expectedGpu", event.target.value)} />
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
          <div className="launchProductEvidenceControls">
            <label>
              OS
              <input value={form.expectedOs} onChange={(event) => update("expectedOs", event.target.value)} />
            </label>
            <label>
              위험 조건
              <textarea
                rows={2}
                value={form.riskTerms}
                onChange={(event) => update("riskTerms", event.target.value)}
                placeholder="리퍼, 해외, 반품 불가 등"
              />
            </label>
          </div>
          <label>
            상품 페이지 문구
            <textarea
              rows={7}
              value={form.pageText}
              onChange={(event) => update("pageText", event.target.value)}
            />
          </label>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void buildKit()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <ScanLine size={18} />}
            상품 페이지 근거 읽기
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              상품 페이지 근거 키트를 만들지 못했습니다. URL과 페이지 문구를 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchProductEvidenceResult" aria-live="polite">
          {kit ? (
            <>
              <div className="launchProductEvidenceResultTop">
                <span className={`pill ${tone(kit.priority)}`}>{kit.priority}</span>
                <a href={kit.url} target="_blank" rel="noreferrer">
                  <ExternalLink size={15} />
                  {kit.host}
                </a>
              </div>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchProductEvidenceScore">
                <strong>{Math.round(kit.evidence_score)}점</strong>
                <span>근거 점수</span>
              </div>
              <div className="launchProductEvidenceMetrics">
                <article>
                  <span>추정 실구매가</span>
                  <strong>{money(kit.effective_price_krw)}</strong>
                </article>
                <article>
                  <span>예산 차이</span>
                  <strong>{money(kit.budget_delta_krw)}</strong>
                </article>
                <article>
                  <span>재고</span>
                  <strong>{kit.availability_status}</strong>
                </article>
                <article>
                  <span>모델 일치</span>
                  <strong>{kit.model_match_status}</strong>
                </article>
              </div>
              <div className="launchProductEvidenceSignals">
                {kit.source_signals.map((signal) => (
                  <article className={tone(signal.status)} key={signal.signal_id}>
                    <span>{iconFor(signal.status)} {signal.label}</span>
                    <strong>{signal.evidence}</strong>
                    <p>{signal.recommendation}</p>
                  </article>
                ))}
              </div>
              <div className="launchProductEvidenceColumns">
                <div>
                  <strong>위험 신호</strong>
                  <ul>
                    {kit.risk_flags.slice(0, 6).map((risk) => (
                      <li key={risk}>{risk}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>판매자 질문</strong>
                  <ul>
                    {kit.seller_questions.slice(0, 5).map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchProductEvidenceActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "product-page-evidence-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: kit.scanner_prefill.budget_krw,
                    purpose: "qhd_creator",
                    must_haves: [kit.scanner_prefill.expected_gpu, kit.scanner_prefill.expected_os].filter(Boolean),
                    exclusions: kit.risk_flags.slice(0, 3),
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" onClick={() => void copyShare()}>
                  <Copy size={15} />
                  공유 문구 복사
                </button>
              </div>
              {copyStatus === "copied" ? (
                <p className="launchPersonaError">상품 페이지 근거 요약을 복사했습니다.</p>
              ) : null}
              {copyStatus === "error" ? (
                <p className="launchPersonaError">클립보드 복사 권한을 확인하세요.</p>
              ) : null}
            </>
          ) : (
            <div className="launchProductEvidenceEmpty">
              <FileSearch size={28} />
              <strong>상품 페이지 문구를 붙여 넣으면 결제 전 근거가 분해됩니다.</strong>
              <p>URL 안전성, 실구매가, 재고, 모델명 일치, 판매자 질문을 먼저 확인하세요.</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
