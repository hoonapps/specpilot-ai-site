"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  GitCompareArrows,
  LoaderCircle,
  Send,
  ShieldAlert,
} from "lucide-react";
import type {
  Category,
  CustomCandidateDecisionRequest,
  CustomCandidateInput,
  PublicCustomCandidateDecisionKit,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type CandidateForm = {
  title: string;
  sellerName: string;
  url: string;
  listedPrice: string;
  shippingFee: string;
  discount: string;
  cpu: string;
  gpu: string;
  ramGb: string;
  storageGb: string;
  osName: string;
  warrantyMonths: string;
  returnDays: string;
  stockStatus: string;
  riskTerms: string;
  evidenceText: string;
};

type FormState = {
  category: Category;
  budget: string;
  purpose: string;
  mustHaves: string;
  candidates: CandidateForm[];
};

const demoCandidates: CandidateForm[] = [
  {
    title: "Creator RTX 4070 SUPER Build",
    sellerName: "PC Mall",
    url: "https://shop.example.com/a",
    listedPrice: "2165000",
    shippingFee: "0",
    discount: "40000",
    cpu: "Ryzen 7 7800X3D",
    gpu: "RTX 4070 SUPER",
    ramGb: "32",
    storageGb: "1000",
    osName: "Windows 11",
    warrantyMonths: "24",
    returnDays: "14",
    stockStatus: "in_stock",
    riskTerms: "",
    evidenceText: "국내 제조사 AS, 반품 14일, 재고 있음",
  },
  {
    title: "Budget RTX 4060 Build",
    sellerName: "Budget PC",
    url: "https://shop.example.com/b",
    listedPrice: "1720000",
    shippingFee: "10000",
    discount: "0",
    cpu: "Ryzen 5 7500F",
    gpu: "RTX 4060",
    ramGb: "16",
    storageGb: "512",
    osName: "FreeDOS",
    warrantyMonths: "12",
    returnDays: "7",
    stockStatus: "in_stock",
    riskTerms: "FreeDOS",
    evidenceText: "OS 별도 구매 필요",
  },
  {
    title: "해외 리퍼 RTX 4080 PC",
    sellerName: "Open Market",
    url: "https://market.example.net/c",
    listedPrice: "2050000",
    shippingFee: "80000",
    discount: "0",
    cpu: "Core i7",
    gpu: "RTX 4080",
    ramGb: "32",
    storageGb: "1000",
    osName: "Windows 11",
    warrantyMonths: "0",
    returnDays: "0",
    stockStatus: "low_stock",
    riskTerms: "해외\n리퍼\n반품 불가",
    evidenceText: "해외 배송 리퍼 상품, 반품 불가",
  },
];

const demoForm: FormState = {
  category: "desktop_pc",
  budget: "2200000",
  purpose: "qhd_creator",
  mustHaves: "RTX 4070급 GPU\nRAM 32GB\n국내 AS",
  candidates: demoCandidates,
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

function payloadFromForm(form: FormState): CustomCandidateDecisionRequest {
  return {
    category: form.category,
    budget_krw: parseNumber(form.budget) ?? 2_200_000,
    purpose: form.purpose,
    must_haves: lines(form.mustHaves),
    candidates: form.candidates.map((candidate, index): CustomCandidateInput => ({
      candidate_id: `candidate_${index + 1}`,
      title: candidate.title,
      seller_name: candidate.sellerName,
      url: candidate.url,
      listed_price_krw: parseNumber(candidate.listedPrice) ?? 0,
      shipping_fee_krw: parseNumber(candidate.shippingFee) ?? 0,
      discount_krw: parseNumber(candidate.discount) ?? 0,
      assembly_fee_krw: 0,
      os_fee_krw: 0,
      cpu: candidate.cpu,
      gpu: candidate.gpu,
      ram_gb: parseNumber(candidate.ramGb),
      storage_gb: parseNumber(candidate.storageGb),
      os_name: candidate.osName,
      warranty_months: parseNumber(candidate.warrantyMonths),
      return_window_days: parseNumber(candidate.returnDays),
      stock_status: candidate.stockStatus,
      risk_terms: lines(candidate.riskTerms),
      evidence_text: candidate.evidenceText,
    })),
    source: "launch_custom_candidate_decision",
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

function money(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function CustomCandidateDecisionPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicCustomCandidateDecisionKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateCandidate(index: number, key: keyof CandidateForm, value: string) {
    setForm((current) => ({
      ...current,
      candidates: current.candidates.map((candidate, candidateIndex) =>
        candidateIndex === index ? { ...candidate, [key]: value } : candidate,
      ),
    }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/custom-candidate-decision-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`custom candidate decision ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicCustomCandidateDecisionKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("custom candidate decision rejected");
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
    <section className="launchPublicSection launchCustomCandidate" id="custom-candidate-decision">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <GitCompareArrows size={16} />
            실제 후보 비교
          </div>
          <h2>쇼핑몰에서 본 후보들을 직접 넣고 1순위와 제외 후보를 가릅니다.</h2>
          <p>
            가격만 비교하지 않고 사양, 보증/반품, 재고, 위험 조건을 함께 점수화해
            구매 가능, 확인 필요, 결제 보류로 나눕니다.
          </p>
        </div>
        <span className="pill ok">2~6개 후보</span>
      </div>

      <div className="launchCustomCandidateGrid">
        <article className="launchCustomCandidateForm">
          <div className="launchCustomCandidateControls">
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
            <label>
              목적
              <select value={form.purpose} onChange={(event) => update("purpose", event.target.value)}>
                <option value="qhd_creator">QHD 게임·영상 편집</option>
                <option value="portable_creator">휴대형 크리에이터</option>
                <option value="team_office">팀/사무 구매</option>
                <option value="4k_creator">4K 고성능 작업</option>
              </select>
            </label>
          </div>
          <label>
            필수 조건
            <textarea
              rows={3}
              value={form.mustHaves}
              onChange={(event) => update("mustHaves", event.target.value)}
            />
          </label>
          <div className="launchCustomCandidateInputs">
            {form.candidates.map((candidate, index) => (
              <article key={index}>
                <span>후보 {index + 1}</span>
                <input
                  value={candidate.title}
                  onChange={(event) => updateCandidate(index, "title", event.target.value)}
                  aria-label={`후보 ${index + 1} 이름`}
                />
                <div className="launchCustomCandidateMiniGrid">
                  <input
                    value={candidate.listedPrice}
                    onChange={(event) => updateCandidate(index, "listedPrice", event.target.value)}
                    inputMode="numeric"
                    aria-label={`후보 ${index + 1} 표시가`}
                  />
                  <input
                    value={candidate.gpu}
                    onChange={(event) => updateCandidate(index, "gpu", event.target.value)}
                    aria-label={`후보 ${index + 1} GPU`}
                  />
                  <input
                    value={candidate.ramGb}
                    onChange={(event) => updateCandidate(index, "ramGb", event.target.value)}
                    inputMode="numeric"
                    aria-label={`후보 ${index + 1} RAM`}
                  />
                  <input
                    value={candidate.stockStatus}
                    onChange={(event) => updateCandidate(index, "stockStatus", event.target.value)}
                    aria-label={`후보 ${index + 1} 재고`}
                  />
                </div>
                <textarea
                  rows={2}
                  value={candidate.riskTerms}
                  onChange={(event) => updateCandidate(index, "riskTerms", event.target.value)}
                  aria-label={`후보 ${index + 1} 위험 조건`}
                />
              </article>
            ))}
          </div>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void buildKit()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <Send size={18} />}
            실제 후보 비교하기
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              커스텀 후보 비교를 만들지 못했습니다. 후보는 최소 2개 이상이어야 합니다.
            </p>
          ) : null}
        </article>

        <article className="launchCustomCandidateResult" aria-live="polite">
          {kit ? (
            <>
              <span className={`pill ${tone(kit.decision)}`}>{kit.decision}</span>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchCustomCandidateScore">
                <strong>{Math.round(kit.confidence_score)}점</strong>
                <span>판정 확신도</span>
              </div>
              <div className="launchCustomCandidateRank">
                {kit.items.slice(0, 4).map((item, index) => (
                  <article className={tone(item.status)} key={item.product_id}>
                    <span>{String(index + 1).padStart(2, "0")} {iconFor(item.status)} {item.status}</span>
                    <strong>{item.model_name}</strong>
                    <p>{money(item.effective_price_krw)} · {Math.round(item.score)}점</p>
                    <small>{item.fit_summary}</small>
                  </article>
                ))}
              </div>
              <div className="launchCustomCandidateColumns">
                <div>
                  <strong>결정 규칙</strong>
                  <ul>
                    {kit.decision_rules.slice(0, 4).map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>판매자 질문</strong>
                  <ul>
                    {kit.seller_questions.slice(0, 4).map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchCustomCandidateActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "custom-candidate-decision-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: kit.budget_krw,
                    purpose: kit.purpose,
                    must_haves: lines(form.mustHaves),
                    exclusions: kit.items.flatMap((item) => item.watchouts).slice(0, 4),
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
                <p className="launchPersonaError">커스텀 후보 비교 요약을 복사했습니다.</p>
              ) : null}
            </>
          ) : (
            <div className="launchCustomCandidateEmpty">
              <GitCompareArrows size={28} />
              <strong>실제 후보 2~6개를 넣으면 1순위와 제외 후보가 나옵니다.</strong>
              <p>페이지 근거, 장바구니, 판매자 답변 전 단계에서 빠르게 후보를 줄이세요.</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
