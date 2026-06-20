"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  LoaderCircle,
  MessageSquareMore,
  Send,
  ShieldAlert,
} from "lucide-react";
import type {
  Category,
  PublicSellerEvidenceKit,
  SellerEvidenceRequest,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  sellerName: string;
  verdict: "ready" | "verify" | "hold";
  budget: string;
  cartTotal: string;
  riskTerms: string;
  missingEvidence: string;
  mustConfirm: string;
  answerText: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  sellerName: "PC Mall",
  verdict: "verify",
  budget: "2200000",
  cartTotal: "2185000",
  riskTerms: "FreeDOS\n해외 병행",
  missingEvidence: "실제 출고 사양\n배송 예정일\n반품 조건\nAS 조건",
  mustConfirm: "파워 용량\nBIOS 업데이트",
  answerText: "",
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

function payloadFromForm(form: FormState): SellerEvidenceRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    seller_name: form.sellerName,
    verdict: form.verdict,
    budget_krw: parseNumber(form.budget) ?? 2_200_000,
    cart_total_krw: parseNumber(form.cartTotal),
    risk_terms: lines(form.riskTerms),
    missing_evidence: lines(form.missingEvidence),
    must_confirm: lines(form.mustConfirm),
    answer_text: form.answerText,
    source: "launch_seller_evidence",
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

export function SellerEvidencePanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicSellerEvidenceKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/seller-evidence-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`seller evidence ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicSellerEvidenceKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("seller evidence rejected");
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
    <section className="launchPublicSection launchSellerEvidence" id="seller-evidence">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <MessageSquareMore size={16} />
            판매자 증거 요청
          </div>
          <h2>결제 전 판매자 답변을 받을 문구와 판정 기준을 만듭니다.</h2>
          <p>
            실제 출고 사양, 배송, 반품, AS, 리퍼/해외/FreeDOS 조건을 판매자에게 묻고 답변을
            승인 증거로 쓸 수 있는지 확인합니다.
          </p>
        </div>
        <span className="pill warn">답변 캡처</span>
      </div>

      <div className="launchSellerEvidenceGrid">
        <article className="launchSellerEvidenceForm">
          <div className="launchSellerEvidenceControls">
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
              판정
              <select
                value={form.verdict}
                onChange={(event) => update("verdict", event.target.value as FormState["verdict"])}
              >
                <option value="ready">승인 가능</option>
                <option value="verify">확인 필요</option>
                <option value="hold">결제 보류</option>
              </select>
            </label>
          </div>
          <label>
            후보명
            <input
              value={form.productTitle}
              onChange={(event) => update("productTitle", event.target.value)}
            />
          </label>
          <div className="launchSellerEvidenceControls dense">
            <label>
              예산
              <input
                inputMode="numeric"
                value={form.budget}
                onChange={(event) => update("budget", event.target.value)}
              />
            </label>
            <label>
              총액
              <input
                inputMode="numeric"
                value={form.cartTotal}
                onChange={(event) => update("cartTotal", event.target.value)}
              />
            </label>
          </div>
          <div className="launchSellerEvidenceControls dense">
            <label>
              위험 조건
              <textarea
                rows={3}
                value={form.riskTerms}
                onChange={(event) => update("riskTerms", event.target.value)}
              />
            </label>
            <label>
              누락 증거
              <textarea
                rows={3}
                value={form.missingEvidence}
                onChange={(event) => update("missingEvidence", event.target.value)}
              />
            </label>
          </div>
          <div className="launchSellerEvidenceControls dense">
            <label>
              추가 확인
              <textarea
                rows={3}
                value={form.mustConfirm}
                onChange={(event) => update("mustConfirm", event.target.value)}
              />
            </label>
            <label>
              판매자 답변
              <textarea
                rows={3}
                value={form.answerText}
                onChange={(event) => update("answerText", event.target.value)}
                placeholder="답변을 받은 뒤 붙여 넣으면 판정이 바뀝니다."
              />
            </label>
          </div>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void buildKit()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <Send size={18} />}
            판매자 증거 요청 만들기
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              판매자 증거 요청 키트를 만들지 못했습니다. 입력값을 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchSellerEvidenceResult" aria-live="polite">
          {kit ? (
            <>
              <div className="launchSellerEvidenceStatus">
                <span className={`pill ${tone(kit.priority)}`}>증거 {kit.priority}</span>
                <span className={`pill ${tone(kit.answer_status)}`}>답변 {kit.answer_status}</span>
              </div>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchSellerMessage">
                <strong>판매자에게 보낼 문구</strong>
                <p>{kit.seller_message}</p>
                <button type="button" onClick={() => void copyText(kit.seller_message)}>
                  <Copy size={16} />
                  문의 문구 복사
                </button>
              </div>
              <div className="launchSellerQuestionGrid">
                {kit.questions.slice(0, 5).map((question) => (
                  <article className={question.status} key={question.question_id}>
                    <span>{iconFor(question.status)} {question.label}</span>
                    <strong>{question.question}</strong>
                    <p>{question.required_answer}</p>
                    <small>{question.why_it_matters}</small>
                  </article>
                ))}
              </div>
              <div className="launchSellerRubricGrid">
                {kit.answer_rubric.slice(0, 4).map((rubric) => (
                  <article key={rubric.rubric_id}>
                    <span className={`pill ${tone(rubric.status)}`}>{rubric.label}</span>
                    <p>{rubric.pass_signal}</p>
                    <small>{rubric.fail_signal}</small>
                  </article>
                ))}
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "seller-evidence-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: kit.approval_prefill.budget_krw,
                    purpose: kit.product_title,
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" onClick={() => void copyText(kit.share_copy)}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "증거 요약 복사"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 판매자 증거 문구를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill warn">문의 먼저</span>
              <h3>판매자 답변이 없으면 싼 가격도 승인 증거가 아닙니다.</h3>
              <p>
                실제 출고 사양, 배송, 반품, AS 조건을 한 번에 묻고 답변을 받으면 승인 브리프로
                이어집니다.
              </p>
              <ul>
                <li>리퍼, 전시, 해외, 병행, FreeDOS 조건을 별도 질문으로 분리합니다.</li>
                <li>답변을 붙여 넣으면 승인 가능, 확인 필요, 결제 보류로 판정합니다.</li>
                <li>캡처 체크리스트와 분석 prefill을 함께 만듭니다.</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
