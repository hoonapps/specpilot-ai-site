"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  LoaderCircle,
  ShieldAlert,
  Split,
} from "lucide-react";
import type {
  Category,
  FinalDecisionKitRequest,
  OpsStatus,
  PublicFinalDecisionKit,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  sellerName: string;
  budget: string;
  finalPrice: string;
  selectedReason: string;
  priceStatus: OpsStatus;
  compatibilityStatus: OpsStatus;
  reviewStatus: OpsStatus;
  warrantyStatus: OpsStatus;
  checkoutStatus: OpsStatus;
  evidenceStatus: OpsStatus;
  priceScore: string;
  compatibilityScore: string;
  reviewScore: string;
  warrantyScore: string;
  checkoutScore: string;
  readyEvidence: string;
  missingEvidence: string;
  blockerReasons: string;
  warningReasons: string;
  sellerQuestions: string;
  deadline: string;
  shareAudience: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  sellerName: "PC Mall",
  budget: "2200000",
  finalPrice: "2165000",
  selectedReason: "QHD 편집과 게임 목적에 CPU/GPU/RAM 균형이 좋음",
  priceStatus: "ok",
  compatibilityStatus: "ok",
  reviewStatus: "warning",
  warrantyStatus: "warning",
  checkoutStatus: "warning",
  evidenceStatus: "warning",
  priceScore: "88",
  compatibilityScore: "84",
  reviewScore: "68",
  warrantyScore: "72",
  checkoutScore: "76",
  readyEvidence: "최종 결제 금액\n옵션명\nCPU/GPU/RAM/SSD",
  missingEvidence: "AS 조건\n배송 예정일",
  blockerReasons: "",
  warningReasons: "팬 소음 반복 후기 확인 필요",
  sellerQuestions: "실제 출고 사양이 장바구니 옵션과 같은가요?",
  deadline: "오늘 22시 전",
  shareAudience: "family",
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function clampScore(value: string, fallback: number) {
  const parsed = parseNumber(value);
  if (parsed === null) {
    return fallback;
  }
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function lines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function payloadFromForm(form: FormState): FinalDecisionKitRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    seller_name: form.sellerName,
    budget_krw: parseNumber(form.budget) ?? 2_200_000,
    final_price_krw: parseNumber(form.finalPrice),
    selected_reason: form.selectedReason,
    price_status: form.priceStatus,
    compatibility_status: form.compatibilityStatus,
    review_status: form.reviewStatus,
    warranty_status: form.warrantyStatus,
    checkout_status: form.checkoutStatus,
    evidence_status: form.evidenceStatus,
    price_score: clampScore(form.priceScore, 72),
    compatibility_score: clampScore(form.compatibilityScore, 72),
    review_score: clampScore(form.reviewScore, 72),
    warranty_score: clampScore(form.warrantyScore, 72),
    checkout_score: clampScore(form.checkoutScore, 72),
    ready_evidence: lines(form.readyEvidence),
    missing_evidence: lines(form.missingEvidence),
    blocker_reasons: lines(form.blockerReasons),
    warning_reasons: lines(form.warningReasons),
    seller_questions: lines(form.sellerQuestions),
    decision_deadline: form.deadline,
    share_audience: form.shareAudience,
    source: "launch_final_decision",
  };
}

function tone(status: string) {
  if (status === "ok" || status === "go") {
    return "ok";
  }
  return status === "blocker" || status === "hold" ? "danger" : "warn";
}

function iconFor(status: string) {
  if (status === "ok" || status === "go") {
    return <CheckCircle2 size={15} />;
  }
  if (status === "blocker" || status === "hold") {
    return <ShieldAlert size={15} />;
  }
  return <AlertTriangle size={15} />;
}

function labelFor(decision: string) {
  if (decision === "go") {
    return "구매 가능";
  }
  if (decision === "hold") {
    return "구매 보류";
  }
  return "확인 후 구매";
}

function signed(value: number | null) {
  if (value === null) {
    return "미입력";
  }
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toLocaleString("ko-KR")}원`;
}

export function FinalDecisionPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicFinalDecisionKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/final-decision-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`final decision ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicFinalDecisionKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("final decision rejected");
      }
      setKit(payload.kit);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function copyShare() {
    if (!kit?.share_copy) {
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
    <section className="launchPublicSection launchFinalDecision" id="final-decision">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <ClipboardCheck size={16} />
            최종 구매 판정
          </div>
          <h2>여러 검수 결과를 결제 직전 go, verify, hold로 압축합니다.</h2>
          <p>
            가격, 체크아웃, 호환성, 리뷰, 보증, 증거 상태를 합쳐 지금 결제할지, 더
            확인할지, 멈출지를 한 장으로 정리합니다.
          </p>
        </div>
        <span className="pill warn">go/no-go</span>
      </div>

      <div className="launchFinalDecisionGrid">
        <article className="launchFinalDecisionForm">
          <div className="launchFinalDecisionControls">
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
          <div className="launchFinalDecisionControls">
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
          <div className="launchFinalDecisionControls dense">
            <label>
              예산
              <input inputMode="numeric" value={form.budget} onChange={(event) => update("budget", event.target.value)} />
            </label>
            <label>
              최종가
              <input
                inputMode="numeric"
                value={form.finalPrice}
                onChange={(event) => update("finalPrice", event.target.value)}
              />
            </label>
            <label>
              마감
              <input value={form.deadline} onChange={(event) => update("deadline", event.target.value)} />
            </label>
          </div>
          <label>
            선택 이유
            <textarea
              rows={2}
              value={form.selectedReason}
              onChange={(event) => update("selectedReason", event.target.value)}
            />
          </label>

          <div className="launchFinalDecisionStatusGrid">
            {[
              ["priceStatus", "가격", "priceScore"],
              ["compatibilityStatus", "호환성", "compatibilityScore"],
              ["reviewStatus", "리뷰", "reviewScore"],
              ["warrantyStatus", "보증", "warrantyScore"],
              ["checkoutStatus", "체크아웃", "checkoutScore"],
            ].map(([statusKey, label, scoreKey]) => (
              <div className="launchFinalDecisionStatusPair" key={statusKey}>
                <label>
                  {label}
                  <select
                    value={form[statusKey as keyof FormState]}
                    onChange={(event) =>
                      update(statusKey as keyof FormState, event.target.value as FormState[keyof FormState])
                    }
                  >
                    <option value="ok">ok</option>
                    <option value="warning">warning</option>
                    <option value="blocker">blocker</option>
                  </select>
                </label>
                <label>
                  점수
                  <input
                    inputMode="numeric"
                    value={form[scoreKey as keyof FormState]}
                    onChange={(event) =>
                      update(scoreKey as keyof FormState, event.target.value as FormState[keyof FormState])
                    }
                  />
                </label>
              </div>
            ))}
            <label>
              증거 상태
              <select
                value={form.evidenceStatus}
                onChange={(event) => update("evidenceStatus", event.target.value as OpsStatus)}
              >
                <option value="ok">ok</option>
                <option value="warning">warning</option>
                <option value="blocker">blocker</option>
              </select>
            </label>
          </div>

          <div className="launchFinalDecisionControls">
            <label>
              준비 증거
              <textarea
                rows={4}
                value={form.readyEvidence}
                onChange={(event) => update("readyEvidence", event.target.value)}
              />
            </label>
            <label>
              누락 증거
              <textarea
                rows={4}
                value={form.missingEvidence}
                onChange={(event) => update("missingEvidence", event.target.value)}
              />
            </label>
          </div>
          <div className="launchFinalDecisionControls">
            <label>
              차단 사유
              <textarea
                rows={3}
                value={form.blockerReasons}
                onChange={(event) => update("blockerReasons", event.target.value)}
              />
            </label>
            <label>
              확인 사유
              <textarea
                rows={3}
                value={form.warningReasons}
                onChange={(event) => update("warningReasons", event.target.value)}
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

          <button className="primaryButton" type="button" onClick={buildKit} disabled={status === "loading"}>
            {status === "loading" ? <LoaderCircle size={17} className="spinIcon" /> : <Split size={17} />}
            최종 판정 만들기
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">최종 구매 판정을 만들지 못했습니다. 상태와 점수를 확인하세요.</p>
          ) : null}
        </article>

        <article className="launchFinalDecisionResult" aria-live="polite">
          {kit ? (
            <>
              <div className={`launchFinalDecisionScore ${tone(kit.final_decision)}`}>
                <span>{labelFor(kit.final_decision)}</span>
                <strong>{Math.round(kit.decision_score)}점</strong>
                <small>{signed(kit.price_delta_krw)}</small>
              </div>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchFinalDecisionPrimary">
                <strong>다음 행동</strong>
                <span>{kit.primary_action}</span>
              </div>
              <div className="launchFinalDecisionSignals">
                {kit.signals.map((signal) => (
                  <article className={tone(signal.status)} key={signal.signal_id}>
                    <span>
                      {iconFor(signal.status)}
                      {signal.label}
                    </span>
                    <strong>{signal.score}점</strong>
                    <small>{signal.evidence}</small>
                  </article>
                ))}
              </div>
              <div className="launchFinalDecisionColumns">
                <div>
                  <strong>결정 게이트</strong>
                  <ul>
                    {kit.decision_gates.map((gate) => (
                      <li key={gate.gate_id}>
                        {gate.label}: {gate.pass_rule}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>증거 체크리스트</strong>
                  <ul>
                    {kit.evidence_checklist.slice(0, 6).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchFinalDecisionColumns">
                <div>
                  <strong>판매자 질문</strong>
                  <ul>
                    {kit.seller_questions.slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>남은 확인</strong>
                  <ul>
                    {[...kit.blocker_reasons, ...kit.warning_reasons].slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="primaryButton"
                  handoff={{
                    source: "final-decision-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: payloadFromForm(form).budget_krw,
                    purpose: "final_checkout_decision",
                    must_haves: kit.evidence_checklist.slice(0, 3),
                    exclusions: kit.blocker_reasons,
                  }}
                  eventLabel="launch_final_decision_analysis"
                  eventSurface="launch_final_decision"
                >
                  분석으로 넘기기
                </LaunchAnalysisLink>
                <button className="secondaryLaunchButton" type="button" onClick={copyShare}>
                  <Copy size={16} />
                  공유 문구 복사
                </button>
              </div>
              {copyStatus === "copied" ? <p className="launchPersonaError success">복사했습니다.</p> : null}
              {copyStatus === "error" ? (
                <p className="launchPersonaError">클립보드 권한이 없어 최종 판정 문구를 복사하지 못했습니다.</p>
              ) : null}
            </>
          ) : (
            <div className="launchFinalDecisionEmpty">
              <ClipboardCheck size={32} />
              <h3>결제 직전의 마지막 한 장을 만듭니다.</h3>
              <p>
                가격은 좋아도 리뷰, 보증, 증거가 약하면 verify 또는 hold로 낮추고 실행/검토
                prefill을 함께 제공합니다.
              </p>
              <ul>
                <li>개별 키트 결과를 최종 go/no-go 판단으로 압축합니다.</li>
                <li>구매 실행 패키지와 30초 검토 카드로 바로 이어집니다.</li>
                <li>blocker가 남으면 가격보다 결제 보류를 우선합니다.</li>
              </ul>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
