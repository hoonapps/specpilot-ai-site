"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  FileQuestion,
  LoaderCircle,
  ShieldAlert,
} from "lucide-react";
import type {
  Category,
  PublicSpecTermDecoderKit,
  SpecTermDecoderRequest,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  listingText: string;
  terms: string;
  buyerLevel: string;
  primaryPurpose: string;
  budget: string;
};

const demoForm: FormState = {
  category: "laptop",
  productTitle: "CreatorBook Pro 16 RTX 4060 RAM 32GB SSD 1TB FreeDOS",
  listingText:
    "RTX 4060 TGP 75W / RAM 온보드 16GB+슬롯 16GB / SSD 1TB / FreeDOS / USB-C PD충전 / 국내 AS",
  terms: "FreeDOS, TGP, 온보드, PD충전",
  buyerLevel: "beginner",
  primaryPurpose: "portable_creator",
  budget: "2200000",
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function splitTerms(value: string) {
  return value
    .split(/[,|\n]/)
    .map((term) => term.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function payloadFromForm(form: FormState): SpecTermDecoderRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    listing_text: form.listingText,
    terms: splitTerms(form.terms),
    buyer_level: form.buyerLevel,
    primary_purpose: form.primaryPurpose,
    budget_krw: parseNumber(form.budget) ?? 2_200_000,
    source: "launch_spec_term_decoder",
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

export function SpecTermDecoderPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicSpecTermDecoderKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function decodeTerms() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/spec-term-decoder-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`term decoder ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicSpecTermDecoderKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("term decoder rejected");
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
    <section className="launchPublicSection launchSpecTerm" id="spec-term-decoder">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <FileQuestion size={16} />
            사양 용어 해석
          </div>
          <h2>FreeDOS, TGP, 온보드 같은 문구를 쉬운 구매 언어로 바꿉니다.</h2>
          <p>
            상품 페이지의 어려운 용어를 붙여 넣으면 구매 영향, 위험도, 판매자 질문,
            검수 prefill을 한 번에 만듭니다.
          </p>
        </div>
        <span className="pill warn">beginner proof</span>
      </div>

      <div className="launchSpecTermGrid">
        <article className="launchSpecTermForm">
          <div className="launchSpecTermControls">
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
            제품명
            <input
              value={form.productTitle}
              onChange={(event) => update("productTitle", event.target.value)}
            />
          </label>
          <label>
            상품 문구
            <textarea
              value={form.listingText}
              onChange={(event) => update("listingText", event.target.value)}
            />
          </label>
          <div className="launchSpecTermControls">
            <label>
              해석할 용어
              <input value={form.terms} onChange={(event) => update("terms", event.target.value)} />
            </label>
            <label>
              구매 목적
              <input
                value={form.primaryPurpose}
                onChange={(event) => update("primaryPurpose", event.target.value)}
              />
            </label>
          </div>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void decodeTerms()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <FileQuestion size={18} />}
            용어 해석
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              사양 용어 해석 키트를 만들지 못했습니다. 상품 문구와 용어를 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchSpecTermResult" aria-live="polite">
          {kit ? (
            <>
              <div className="launchSpecTermScore">
                <span className={`pill ${tone(kit.decoder_status)}`}>{kit.decoder_status}</span>
                <strong>{Math.round(kit.clarity_score)}</strong>
                <small>{kit.risk_terms.length ? `위험 용어 ${kit.risk_terms.join(", ")}` : "위험 용어 없음"}</small>
              </div>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchSpecTermExplanations">
                {kit.explanations.slice(0, 6).map((item) => (
                  <article className={tone(item.status)} key={`${item.term}-${item.evidence}`}>
                    <span>
                      {iconFor(item.status)}
                      {item.term}
                    </span>
                    <strong>{item.plain_meaning}</strong>
                    <p>{item.purchase_impact}</p>
                    <small>{item.seller_question}</small>
                  </article>
                ))}
              </div>
              <div className="launchSpecTermColumns">
                <div>
                  <strong>초보 체크</strong>
                  <ul>
                    {kit.beginner_checklist.slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>판매자 질문</strong>
                  <ul>
                    {kit.seller_questions.slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchSpecTermBrief">
                <FileQuestion size={18} />
                <p>{kit.plain_language_brief}</p>
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "spec-term-decoder-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: kit.scanner_prefill.budget_krw,
                    purpose: kit.product_title,
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" onClick={() => void copyText(kit.share_copy)}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "해석 공유"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 사양 용어 해석 문구를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill warn">용어 먼저 해석</span>
              <h3>상품명은 맞아 보여도 FreeDOS, TGP, 온보드, 병행수입에서 실수가 납니다.</h3>
              <p>
                어려운 용어를 구매 영향과 판매자 질문으로 바꾼 뒤 옵션/사양 빠른 검수로 이어갑니다.
              </p>
              <ul>
                <li>Windows 미포함, 업그레이드 제한, AS 제한 조건을 먼저 드러냅니다.</li>
                <li>초보 구매자가 판매자에게 바로 물어볼 문장으로 바꿉니다.</li>
                <li>해석 결과는 분석 시작과 장바구니 검수 prefill로 이어집니다.</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
