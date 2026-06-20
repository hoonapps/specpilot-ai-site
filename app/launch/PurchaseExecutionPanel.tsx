"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Copy,
  LoaderCircle,
  PlayCircle,
  ShieldAlert,
} from "lucide-react";
import type {
  Category,
  PublicPurchaseExecutionKit,
  PurchaseExecutionKitRequest,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  sellerName: string;
  verdict: "ready" | "verify" | "hold";
  finalPrice: string;
  budget: string;
  blockerCount: string;
  warningCount: string;
  missingEvidence: string;
  sellerQuestions: string;
  evidenceReady: string;
  deadline: string;
  paymentMethod: string;
  shareAudience: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  sellerName: "PC Mall",
  verdict: "verify",
  finalPrice: "2165000",
  budget: "2200000",
  blockerCount: "0",
  warningCount: "2",
  missingEvidence: "AS 조건\n배송 예정일",
  sellerQuestions: "실제 출고 사양이 장바구니 옵션과 같은가요?",
  evidenceReady: "최종 결제 금액\n옵션명",
  deadline: "오늘 22시 전",
  paymentMethod: "카드 결제",
  shareAudience: "family",
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function lines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function payloadFromForm(form: FormState): PurchaseExecutionKitRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    seller_name: form.sellerName,
    verdict: form.verdict,
    final_price_krw: parseNumber(form.finalPrice),
    budget_krw: parseNumber(form.budget),
    blocker_count: parseNumber(form.blockerCount) ?? 0,
    warning_count: parseNumber(form.warningCount) ?? 0,
    missing_evidence: lines(form.missingEvidence),
    seller_questions: lines(form.sellerQuestions),
    evidence_ready: lines(form.evidenceReady),
    decision_deadline: form.deadline,
    payment_method: form.paymentMethod,
    share_audience: form.shareAudience,
    source: "launch_purchase_execution",
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

function won(value: number | null) {
  if (value === null) {
    return "미입력";
  }
  return `${value.toLocaleString("ko-KR")}원`;
}

function signed(value: number | null) {
  if (value === null) {
    return "미입력";
  }
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toLocaleString("ko-KR")}원`;
}

export function PurchaseExecutionPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicPurchaseExecutionKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/purchase-execution-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`purchase execution ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicPurchaseExecutionKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("purchase execution rejected");
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
    <section className="launchPublicSection launchExecution" id="purchase-execution">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <ClipboardList size={16} />
            구매 실행 패키지
          </div>
          <h2>결제 버튼을 누르기 전 실행 순서와 중단 조건을 고정합니다.</h2>
          <p>
            최종가, 누락 증거, 판매자 질문, 공유 대상을 넣으면 결제 전 단계, 증거 게이트,
            중단 조건, 가족/팀/커뮤니티 공유 문구를 만듭니다.
          </p>
        </div>
        <span className="pill warn">실행 게이트</span>
      </div>

      <div className="launchExecutionGrid">
        <article className="launchExecutionForm">
          <div className="launchExecutionControls">
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
              판정
              <select
                value={form.verdict}
                onChange={(event) => update("verdict", event.target.value as FormState["verdict"])}
              >
                <option value="ready">실행 가능</option>
                <option value="verify">확인 후 실행</option>
                <option value="hold">보류</option>
              </select>
            </label>
            <label>
              공유 대상
              <select
                value={form.shareAudience}
                onChange={(event) => update("shareAudience", event.target.value)}
              >
                <option value="family">가족/지인</option>
                <option value="team">팀 승인</option>
                <option value="community">커뮤니티</option>
                <option value="self">본인</option>
              </select>
            </label>
          </div>
          <div className="launchExecutionControls">
            <label>
              제품명
              <input
                value={form.productTitle}
                onChange={(event) => update("productTitle", event.target.value)}
              />
            </label>
            <label>
              판매자
              <input
                value={form.sellerName}
                onChange={(event) => update("sellerName", event.target.value)}
              />
            </label>
          </div>
          <div className="launchExecutionControls dense">
            <label>
              최종가
              <input
                inputMode="numeric"
                value={form.finalPrice}
                onChange={(event) => update("finalPrice", event.target.value)}
              />
            </label>
            <label>
              예산
              <input inputMode="numeric" value={form.budget} onChange={(event) => update("budget", event.target.value)} />
            </label>
            <label>
              Blocker
              <input
                inputMode="numeric"
                value={form.blockerCount}
                onChange={(event) => update("blockerCount", event.target.value)}
              />
            </label>
            <label>
              Warning
              <input
                inputMode="numeric"
                value={form.warningCount}
                onChange={(event) => update("warningCount", event.target.value)}
              />
            </label>
          </div>
          <div className="launchExecutionControls">
            <label>
              결제 마감
              <input value={form.deadline} onChange={(event) => update("deadline", event.target.value)} />
            </label>
            <label>
              결제 수단
              <input
                value={form.paymentMethod}
                onChange={(event) => update("paymentMethod", event.target.value)}
              />
            </label>
          </div>
          <div className="launchExecutionControls dense">
            <label>
              누락 증거
              <textarea
                rows={4}
                value={form.missingEvidence}
                onChange={(event) => update("missingEvidence", event.target.value)}
              />
            </label>
            <label>
              확보한 증거
              <textarea
                rows={4}
                value={form.evidenceReady}
                onChange={(event) => update("evidenceReady", event.target.value)}
              />
            </label>
          </div>
          <label>
            판매자 질문
            <textarea
              rows={3}
              value={form.sellerQuestions}
              onChange={(event) => update("sellerQuestions", event.target.value)}
            />
          </label>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void buildKit()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <PlayCircle size={18} />}
            실행 패키지 생성
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              구매 실행 패키지를 만들지 못했습니다. 최종가와 판정 값을 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchExecutionResult" aria-live="polite">
          {kit ? (
            <>
              <span className={`pill ${tone(kit.priority)}`}>{kit.priority}</span>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchExecutionScore">
                <strong>{kit.execution_score}점</strong>
                <span>최종가 {won(parseNumber(form.finalPrice))}</span>
              </div>
              <div className="launchExecutionMetrics">
                <article>
                  <span>예산 차이</span>
                  <strong>{signed(kit.price_delta_krw)}</strong>
                </article>
                <article>
                  <span>1차 행동</span>
                  <strong>{kit.primary_action}</strong>
                </article>
              </div>
              <div className="launchExecutionCheckpoint">
                <strong>판단 기준</strong>
                <p>{kit.decision_checkpoint}</p>
              </div>
              <div className="launchExecutionSteps">
                {kit.checkout_steps.map((step) => (
                  <article className={tone(step.status)} key={step.step_id}>
                    <span className={`pill ${tone(step.status)}`}>
                      {iconFor(step.status)}
                      {step.label}
                    </span>
                    <strong>{step.timing}</strong>
                    <p>{step.instruction}</p>
                    <small>{step.evidence_required}</small>
                  </article>
                ))}
              </div>
              <div className="launchExecutionColumns">
                <div>
                  <strong>증거 게이트</strong>
                  <ul>
                    {kit.evidence_gates.map((gate) => (
                      <li key={gate.gate_id}>
                        <span className={`pill ${tone(gate.status)}`}>{gate.label}</span>
                        {gate.pass_rule}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>중단 조건</strong>
                  <ul>
                    {kit.stop_conditions.map((condition) => (
                      <li key={condition}>{condition}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchExecutionQuestions">
                <strong>판매자 질문</strong>
                <ul>
                  {kit.seller_questions.slice(0, 4).map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </div>
              <div className="launchExecutionShare">
                {kit.share_messages.map((message) => (
                  <button
                    key={message.channel}
                    type="button"
                    onClick={() => void copyText(message.copy_text)}
                  >
                    <Copy size={15} />
                    <span>{message.label}</span>
                  </button>
                ))}
              </div>
              <div className="launchExecutionActions">
                <button type="button" onClick={() => void copyText(kit.share_copy)}>
                  <Copy size={15} />
                  공유 요약 복사
                </button>
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "purchase-execution-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: payloadFromForm(form).budget_krw ?? 2200000,
                    purpose: "checkout_execution",
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
              </div>
              {copyStatus === "copied" ? <small>복사했습니다.</small> : null}
              {copyStatus === "error" ? <small>복사 권한을 확인하세요.</small> : null}
            </>
          ) : (
            <div className="launchExecutionEmpty">
              <ClipboardList size={32} />
              <strong>결제 전 실행 순서를 먼저 고정하세요.</strong>
              <p>최종가를 계산한 뒤 누락 증거와 판매자 질문을 넣으면 실행 패키지가 생성됩니다.</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
