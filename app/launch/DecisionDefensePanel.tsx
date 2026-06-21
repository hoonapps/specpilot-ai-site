"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  LoaderCircle,
  MessageSquareQuote,
  Send,
  ShieldAlert,
} from "lucide-react";
import type {
  Category,
  DecisionDefenseRequest,
  PublicDecisionDefenseKit,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  title: string;
  seller: string;
  decision: string;
  budget: string;
  finalPrice: string;
  confidence: string;
  purpose: string;
  audience: string;
  reasons: string;
  watchouts: string;
  evidence: string;
  alternativeTitle: string;
  alternativePrice: string;
  alternativeReason: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  title: "Creator RTX 4070 SUPER Build",
  seller: "PC Mall",
  decision: "verify",
  budget: "2200000",
  finalPrice: "2150000",
  confidence: "86",
  purpose: "QHD 게임과 영상 편집",
  audience: "community",
  reasons:
    "RTX 4070 SUPER와 RAM 32GB가 목적에 맞음\n예산 안에서 Windows 11과 국내 AS가 포함됨\n해외 리퍼 후보보다 반품/보증 조건이 안전함",
  watchouts: "배송 예정일 캡처 필요\n쿠폰 적용 후 최종가 재확인",
  evidence: "최종 결제 금액\n옵션명\nAS 24개월\n반품 14일",
  alternativeTitle: "Budget RTX 4060 Build",
  alternativePrice: "1730000",
  alternativeReason: "GPU와 RAM이 목적 대비 부족하고 FreeDOS 추가 비용이 있음",
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

function payloadFromForm(form: FormState): DecisionDefenseRequest {
  return {
    category: form.category,
    product_title: form.title,
    seller_name: form.seller,
    decision: form.decision,
    budget_krw: parseNumber(form.budget) ?? 2_200_000,
    final_price_krw: parseNumber(form.finalPrice),
    confidence_score: parseNumber(form.confidence) ?? 78,
    purpose: form.purpose,
    audience: form.audience,
    key_reasons: lines(form.reasons),
    watchouts: lines(form.watchouts),
    evidence_ready: lines(form.evidence),
    alternatives: form.alternativeTitle.trim()
      ? [
          {
            title: form.alternativeTitle,
            price_krw: parseNumber(form.alternativePrice),
            reason_not_selected: form.alternativeReason,
          },
        ]
      : [],
    objection_focus: ["price", "cheaper_alternative", "risk"],
    source: "launch_decision_defense",
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

export function DecisionDefensePanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicDecisionDefenseKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/decision-defense-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`decision defense ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicDecisionDefenseKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("decision defense rejected");
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
    <section className="launchPublicSection launchDecisionDefense" id="decision-defense">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <MessageSquareQuote size={16} />
            결정 방어 브리프
          </div>
          <h2>1순위 후보를 공유했을 때 나올 반대 질문까지 먼저 답합니다.</h2>
          <p>
            가격, 더 싼 후보, 용도 적합도, 리스크, 구매 타이밍 질문에 대한 답변과
            채널별 복사 문구를 만들어 결제 전 검토 대화를 짧게 끝냅니다.
          </p>
        </div>
        <span className="pill ok">공유 설득</span>
      </div>

      <div className="launchDecisionDefenseGrid">
        <article className="launchDecisionDefenseForm">
          <div className="launchDecisionDefenseControls">
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
              <select value={form.decision} onChange={(event) => update("decision", event.target.value)}>
                <option value="ready">구매 가능</option>
                <option value="verify">확인 후 구매</option>
                <option value="hold">구매 보류</option>
              </select>
            </label>
            <label>
              예산
              <input value={form.budget} onChange={(event) => update("budget", event.target.value)} />
            </label>
            <label>
              최종가
              <input value={form.finalPrice} onChange={(event) => update("finalPrice", event.target.value)} />
            </label>
          </div>

          <div className="launchDecisionDefenseControls compact">
            <label>
              상품명
              <input value={form.title} onChange={(event) => update("title", event.target.value)} />
            </label>
            <label>
              판매자
              <input value={form.seller} onChange={(event) => update("seller", event.target.value)} />
            </label>
            <label>
              확신도
              <input value={form.confidence} onChange={(event) => update("confidence", event.target.value)} />
            </label>
            <label>
              공유 대상
              <select value={form.audience} onChange={(event) => update("audience", event.target.value)}>
                <option value="family">가족/지인</option>
                <option value="team">팀 승인자</option>
                <option value="community">커뮤니티</option>
              </select>
            </label>
          </div>

          <label>
            용도
            <input value={form.purpose} onChange={(event) => update("purpose", event.target.value)} />
          </label>
          <label>
            선택 이유
            <textarea value={form.reasons} onChange={(event) => update("reasons", event.target.value)} />
          </label>
          <label>
            남은 watchout
            <textarea value={form.watchouts} onChange={(event) => update("watchouts", event.target.value)} />
          </label>
          <label>
            확보 증거
            <textarea value={form.evidence} onChange={(event) => update("evidence", event.target.value)} />
          </label>

          <div className="launchDecisionDefenseAlt">
            <strong>비교한 대체 후보</strong>
            <div className="launchDecisionDefenseControls compact">
              <label>
                후보명
                <input
                  value={form.alternativeTitle}
                  onChange={(event) => update("alternativeTitle", event.target.value)}
                />
              </label>
              <label>
                가격
                <input
                  value={form.alternativePrice}
                  onChange={(event) => update("alternativePrice", event.target.value)}
                />
              </label>
            </div>
            <label>
              제외 이유
              <textarea
                value={form.alternativeReason}
                onChange={(event) => update("alternativeReason", event.target.value)}
              />
            </label>
          </div>

          <button className="primaryButton" type="button" onClick={buildKit} disabled={status === "loading"}>
            {status === "loading" ? <LoaderCircle className="spin" size={16} /> : <Send size={16} />}
            방어 브리프 생성
          </button>
          {status === "error" ? <p className="formError">방어 브리프를 생성하지 못했습니다.</p> : null}
        </article>

        <article className="launchDecisionDefenseResult">
          {kit ? (
            <>
              <div className="launchDecisionDefenseScore">
                <span className={`pill ${tone(kit.defense_status)}`}>{kit.defense_status}</span>
                <strong>{kit.defense_score}점</strong>
                <small>{kit.audience}</small>
              </div>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <blockquote>{kit.reviewer_brief}</blockquote>

              <div className="launchDecisionDefenseObjections">
                {kit.objections.slice(0, 4).map((item) => (
                  <article className={tone(item.status)} key={item.objection_id}>
                    <span>{iconFor(item.status)} {item.question}</span>
                    <p>{item.answer}</p>
                    <small>{item.counter_condition}</small>
                  </article>
                ))}
              </div>

              <div className="launchDecisionDefenseColumns">
                <div>
                  <strong>검토자 질문</strong>
                  <ul>
                    {kit.reviewer_questions.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>붙일 증거</strong>
                  <ul>
                    {kit.proof_checklist.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="launchDecisionDefenseCopies">
                {kit.copy_variants.slice(0, 3).map((variant) => (
                  <article key={variant.channel}>
                    <strong>{variant.label}</strong>
                    <p>{variant.copy_text}</p>
                  </article>
                ))}
              </div>

              <div className="launchDecisionDefenseActions">
                <LaunchAnalysisLink
                  className="primaryButton"
                  handoff={{
                    source: "decision-defense-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: payloadFromForm(form).budget_krw,
                    purpose: form.purpose,
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" className="secondaryButton" onClick={copyShare}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "공유 문구 복사"}
                </button>
              </div>
              {copyStatus === "error" ? <p className="formError">공유 문구 복사에 실패했습니다.</p> : null}
            </>
          ) : (
            <div className="emptyState">
              <MessageSquareQuote size={24} />
              <strong>공유받은 사람이 물어볼 반대 질문을 먼저 정리하세요.</strong>
              <p>가격, 더 싼 후보, 리스크, 구매 타이밍 질문에 답할 수 있어야 결제 전 검토가 빨라집니다.</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
