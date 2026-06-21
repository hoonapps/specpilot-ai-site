"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clipboard,
  LoaderCircle,
  MessageSquareText,
  ShieldAlert,
} from "lucide-react";
import type { Category, PublicCommunityReplyKit } from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  question: string;
  productTitle: string;
  sellerName: string;
  summary: string;
  budget: string;
  price: string;
  useCase: string;
  risks: string;
  evidence: string;
  missing: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  question: "이 RTX 4070 SUPER 견적 오늘 결제해도 될까요?",
  productTitle: "Creator RTX 4070 SUPER Build",
  sellerName: "PC Mall",
  summary:
    "RTX 4070 SUPER, Ryzen 7, RAM 32GB, SSD 1TB, Windows 11, 국내 AS 24개월, 반품 14일",
  budget: "2200000",
  price: "2165000",
  useCase: "QHD 영상 편집과 게임",
  risks: "팬 소음 후기가 일부 있음\n배송 예정일 확인 필요",
  evidence: "최종 결제 금액\n옵션명\n국내 AS 24개월",
  missing: "배송 예정일",
};

function parseNumber(value: string, fallback: number | null = null) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function lines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function tone(status?: string) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function answerLabel(status?: string) {
  if (status === "ok") {
    return "진행 가능";
  }
  if (status === "blocker") {
    return "구매 보류";
  }
  return "확인 후 결정";
}

function iconFor(status?: string) {
  if (status === "ok") {
    return <CheckCircle2 size={16} />;
  }
  if (status === "blocker") {
    return <ShieldAlert size={16} />;
  }
  return <AlertTriangle size={16} />;
}

export function LaunchQuestionAnswer() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicCommunityReplyKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [step, setStep] = useState<"question" | "answer">("question");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function ask() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/community-reply-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          community_channel: "launch",
          buyer_question: form.question,
          product_title: form.productTitle,
          seller_name: form.sellerName,
          candidate_summary: form.summary,
          budget_krw: parseNumber(form.budget, 2_200_000) ?? 2_200_000,
          final_price_krw: parseNumber(form.price),
          usage_context: form.useCase,
          risk_notes: lines(form.risks),
          ready_evidence: lines(form.evidence),
          missing_evidence: lines(form.missing),
          reply_tone: "direct",
          source: "launch_answer_first",
        }),
      });
      if (!response.ok) {
        throw new Error(`answer ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicCommunityReplyKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("answer rejected");
      }
      setKit(payload.kit);
      setStep("answer");
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function copyAnswer() {
    if (!kit?.primary_reply) {
      return;
    }
    try {
      await navigator.clipboard.writeText(kit.primary_reply);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <section className={`answerDesk ${step === "question" ? "questionStep" : "answerStep"}`} id="ask">
      {step === "question" ? (
      <div className="answerDeskForm">
        <div className="answerStepHeader">
          <span>01</span>
          <strong>질문 입력</strong>
          <p>견적이나 상품 설명을 붙여 넣으면 다음 화면에서 바로 답변을 보여줍니다.</p>
        </div>
        <div className="answerDeskHeader">
          <span>
            <MessageSquareText size={16} />
            질문
          </span>
          <strong>구매할 제품을 붙여 넣고 바로 판단받으세요.</strong>
        </div>

        <label>
          질문
          <textarea
            rows={3}
            value={form.question}
            onChange={(event) => update("question", event.target.value)}
          />
        </label>

        <div className="answerDeskGrid">
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
            제품명
            <input value={form.productTitle} onChange={(event) => update("productTitle", event.target.value)} />
          </label>
        </div>

        <label>
          상품/장바구니 요약
          <textarea rows={4} value={form.summary} onChange={(event) => update("summary", event.target.value)} />
        </label>

        <details className="answerAdvanced">
          <summary>예산, 최종가, 리스크 더 입력하기</summary>
          <div className="answerDeskGrid">
            <label>
              예산
              <input inputMode="numeric" value={form.budget} onChange={(event) => update("budget", event.target.value)} />
            </label>
            <label>
              최종가
              <input inputMode="numeric" value={form.price} onChange={(event) => update("price", event.target.value)} />
            </label>
            <label>
              판매자
              <input value={form.sellerName} onChange={(event) => update("sellerName", event.target.value)} />
            </label>
            <label>
              용도
              <input value={form.useCase} onChange={(event) => update("useCase", event.target.value)} />
            </label>
            <label>
              리스크 메모
              <textarea rows={4} value={form.risks} onChange={(event) => update("risks", event.target.value)} />
            </label>
            <label>
              누락 증거
              <textarea rows={4} value={form.missing} onChange={(event) => update("missing", event.target.value)} />
            </label>
          </div>
        </details>

        <button className="answerPrimaryButton" type="button" onClick={ask} disabled={status === "loading"}>
          {status === "loading" ? <LoaderCircle size={18} className="spinIcon" /> : <MessageSquareText size={18} />}
          답변 화면으로 넘어가기
          {status === "loading" ? null : <ArrowRight size={16} />}
        </button>
        {status === "error" ? <p className="answerError">답변을 만들지 못했습니다. 입력값이나 서버 상태를 확인하세요.</p> : null}
      </div>
      ) : null}

      {step === "answer" ? (
      <div className="answerDeskResult" aria-live="polite">
        {kit ? (
          <>
            <button className="answerBackButton" type="button" onClick={() => setStep("question")}>
              <ArrowLeft size={16} />
              질문 수정
            </button>
            <div className="answerStepHeader">
              <span>02</span>
              <strong>답변 확인</strong>
              <p>결제해도 되는지, 어떤 증거를 더 봐야 하는지 먼저 판단합니다.</p>
            </div>
            <div className={`answerVerdict ${tone(kit.reply_status)}`}>
              <span>
                {iconFor(kit.reply_status)}
                {answerLabel(kit.reply_status)}
              </span>
              <strong>{Math.round(kit.reply_score)}점</strong>
            </div>
            <h2>{kit.headline}</h2>
            <p>{kit.summary}</p>
            <div className="answerCopyBox">
              <strong>답변</strong>
              <p>{kit.primary_reply}</p>
            </div>
            <div className="answerEvidenceGrid">
              <div>
                <strong>추가로 볼 것</strong>
                <ul>
                  {kit.evidence_requests.slice(0, 4).map((item) => (
                    <li key={item.evidence_id}>{item.request_text}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>위험 신호</strong>
                <ul>
                  {(kit.risk_flags.length ? kit.risk_flags : ["큰 blocker는 아직 보이지 않습니다."]).slice(0, 4).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="answerActions">
              <button className="answerSecondaryButton" type="button" onClick={copyAnswer}>
                <Clipboard size={16} />
                답변 복사
              </button>
              <a className="answerSecondaryLink" href="/launch/tools">
                기능별 데모
              </a>
              <LaunchAnalysisLink
                className="answerPrimaryLink"
                handoff={{
                  source: "launch-answer",
                  label: kit.primary_cta_label,
                  query: kit.analysis_prefill,
                  category: kit.category,
                  budget_krw: parseNumber(form.budget) ?? undefined,
                  purpose: "portfolio_launch_answer",
                  must_haves: kit.evidence_requests.slice(0, 3).map((item) => item.label),
                  exclusions: kit.risk_flags,
                }}
                eventLabel="launch_answer_analysis"
                eventSurface="launch_answer"
              >
                분석 화면으로 넘기기
              </LaunchAnalysisLink>
            </div>
            {copyStatus === "copied" ? <p className="answerSuccess">복사했습니다.</p> : null}
            {copyStatus === "error" ? <p className="answerError">클립보드 권한 때문에 복사하지 못했습니다.</p> : null}
          </>
        ) : (
          <div className="answerEmpty">
            <MessageSquareText size={34} />
            <h2>질문하면 답변이 먼저 나옵니다.</h2>
            <p>
              추천 후보를 길게 늘어놓기 전에 지금 결제해도 되는지, 무엇을 더 확인해야 하는지,
              어떤 조건이면 보류해야 하는지 바로 보여줍니다.
            </p>
          </div>
        )}
      </div>
      ) : null}
    </section>
  );
}
