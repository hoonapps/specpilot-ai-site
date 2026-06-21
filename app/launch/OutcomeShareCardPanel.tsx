"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  LoaderCircle,
  Share2,
  ShieldAlert,
  Trophy,
} from "lucide-react";
import type {
  Category,
  OutcomeShareCardRequest,
  PublicOutcomeShareCardKit,
  PurchaseOutcomeStatus,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  outcomeStatus: PurchaseOutcomeStatus;
  plannedPrice: string;
  finalPaidPrice: string;
  budget: string;
  satisfactionScore: string;
  timeToDecideHours: string;
  issues: string;
  savedReasons: string;
  regrets: string;
  nextRecommendation: string;
  shareAudience: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  outcomeStatus: "purchased",
  plannedPrice: "2200000",
  finalPaidPrice: "2165000",
  budget: "2200000",
  satisfactionScore: "9",
  timeToDecideHours: "18",
  issues: "",
  savedReasons: "최종 결제 금액 캡처\nAS 조건 확인",
  regrets: "",
  nextRecommendation: "반품 조건과 최종 결제 금액을 먼저 캡처",
  shareAudience: "community",
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseScore(value: string) {
  const parsed = parseNumber(value);
  if (parsed === null) {
    return 8;
  }
  return Math.max(0, Math.min(10, parsed));
}

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function payloadFromForm(form: FormState): OutcomeShareCardRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    outcome_status: form.outcomeStatus,
    planned_price_krw: parseNumber(form.plannedPrice),
    final_paid_price_krw: parseNumber(form.finalPaidPrice),
    budget_krw: parseNumber(form.budget),
    satisfaction_score: parseScore(form.satisfactionScore),
    time_to_decide_hours: parseNumber(form.timeToDecideHours),
    issues: lines(form.issues),
    saved_reasons: lines(form.savedReasons),
    regrets: lines(form.regrets),
    next_recommendation: form.nextRecommendation,
    share_audience: form.shareAudience,
    source: "launch_outcome_share_card",
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

function money(value: number | null) {
  if (value === null) {
    return "미입력";
  }
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toLocaleString("ko-KR")}원`;
}

function outcomeLabel(status: PurchaseOutcomeStatus) {
  const labels: Record<PurchaseOutcomeStatus, string> = {
    purchased: "구매 완료",
    abandoned: "구매 이탈",
    delayed: "구매 지연",
    returned: "반품/취소",
  };
  return labels[status];
}

export function OutcomeShareCardPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicOutcomeShareCardKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/outcome-share-card-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`outcome share card ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicOutcomeShareCardKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("outcome share card rejected");
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
    <section className="launchPublicSection launchOutcomeShare" id="outcome-share-card">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Trophy size={16} />
            구매 결과 공유
          </div>
          <h2>실제 구매 결과를 개인정보 없는 proof 카드로 바꿉니다.</h2>
          <p>
            구매 완료, 지연, 이탈, 반품 결과를 최종가 차이와 만족도, 이슈, 배운 점으로 정리해
            커뮤니티와 다음 추천 학습에 연결합니다.
          </p>
        </div>
        <span className="pill ok">공유 proof</span>
      </div>

      <div className="launchOutcomeShareGrid">
        <article className="launchOutcomeShareForm">
          <div className="launchOutcomeShareControls">
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
              결과
              <select
                value={form.outcomeStatus}
                onChange={(event) =>
                  update("outcomeStatus", event.target.value as PurchaseOutcomeStatus)
                }
              >
                <option value="purchased">구매 완료</option>
                <option value="delayed">구매 지연</option>
                <option value="abandoned">구매 이탈</option>
                <option value="returned">반품/취소</option>
              </select>
            </label>
            <label>
              공유 대상
              <input
                value={form.shareAudience}
                onChange={(event) => update("shareAudience", event.target.value)}
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
          <div className="launchOutcomeShareControls dense">
            <label>
              계획가
              <input
                inputMode="numeric"
                value={form.plannedPrice}
                onChange={(event) => update("plannedPrice", event.target.value)}
              />
            </label>
            <label>
              최종 결제 금액
              <input
                inputMode="numeric"
                value={form.finalPaidPrice}
                onChange={(event) => update("finalPaidPrice", event.target.value)}
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
            <label>
              만족도
              <input
                inputMode="numeric"
                value={form.satisfactionScore}
                onChange={(event) => update("satisfactionScore", event.target.value)}
              />
            </label>
          </div>
          <label>
            결정 시간
            <input
              inputMode="numeric"
              value={form.timeToDecideHours}
              onChange={(event) => update("timeToDecideHours", event.target.value)}
            />
          </label>
          <div className="launchOutcomeShareColumns">
            <label>
              확인 근거
              <textarea
                rows={4}
                value={form.savedReasons}
                onChange={(event) => update("savedReasons", event.target.value)}
                placeholder="최종 결제 금액 캡처&#10;AS 조건 확인"
              />
            </label>
            <label>
              이슈
              <textarea
                rows={4}
                value={form.issues}
                onChange={(event) => update("issues", event.target.value)}
                placeholder="초기 불량, 옵션 상이"
              />
            </label>
          </div>
          <label>
            아쉬움
            <textarea
              rows={3}
              value={form.regrets}
              onChange={(event) => update("regrets", event.target.value)}
              placeholder="다음에는 해외 판매자 AS 조건을 먼저 확인"
            />
          </label>
          <label>
            다음 추천 기준
            <input
              value={form.nextRecommendation}
              onChange={(event) => update("nextRecommendation", event.target.value)}
            />
          </label>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void buildKit()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <Share2 size={18} />}
            결과 공유 카드 만들기
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              구매 결과 공유 카드를 만들지 못했습니다. 금액과 만족도를 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchOutcomeShareResult" aria-live="polite">
          {kit ? (
            <>
              <div className="launchOutcomeShareScore">
                <span className={`pill ${tone(kit.proof_status)}`}>{kit.proof_status}</span>
                <strong>{kit.proof_score}</strong>
                <small>proof score</small>
              </div>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchOutcomeShareMetrics">
                {kit.proof_metrics.map((metric) => (
                  <div className={metric.status} key={metric.metric_id}>
                    <span>{iconFor(metric.status)} {metric.label}</span>
                    <strong>{metric.value}</strong>
                    <small>{metric.detail}</small>
                  </div>
                ))}
              </div>
              <div className="launchOutcomeShareColumns">
                <div>
                  <strong>공유 근거</strong>
                  <ul>
                    {kit.proof_points.slice(0, 5).map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>주의점</strong>
                  <ul>
                    {kit.caution_notes.slice(0, 5).map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchOutcomeShareVariants">
                {kit.share_variants.map((variant) => (
                  <button
                    type="button"
                    key={variant.channel}
                    onClick={() => void copyText(variant.copy_text)}
                  >
                    <Copy size={16} />
                    <span>{variant.label}</span>
                    <small>{variant.cta_label}</small>
                  </button>
                ))}
              </div>
              <div className="launchOutcomeShareSignals">
                {kit.learning_signals.slice(0, 6).map((signal) => (
                  <span key={signal}>{signal}</span>
                ))}
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "outcome-share-card-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: payloadFromForm(form).final_paid_price_krw ?? undefined,
                    purpose: kit.product_title,
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" onClick={() => void copyText(kit.share_copy)}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "공유 요약 복사"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 구매 결과 공유 문구를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill warn">{outcomeLabel(form.outcomeStatus)}</span>
              <h3>최종가 {money(parseNumber(form.finalPaidPrice))} 결과를 공유 가능한 근거로 닫으세요.</h3>
              <p>
                실제 구매 결과를 남기면 공개 proof가 되고, 다음 컴퓨터·노트북 추천에서 같은
                가격 차이와 이슈를 더 빨리 걸러낼 수 있습니다.
              </p>
              <ul>
                <li>계획가 대비 최종 결제 금액 차이를 계산합니다.</li>
                <li>만족도, 확인 근거, 이슈, 아쉬움을 분리합니다.</li>
                <li>커뮤니티, 카카오톡, 팀 기록, 이메일 공유 문구를 만듭니다.</li>
              </ul>
              <button className="secondaryButton" type="button" onClick={() => void buildKit()}>
                <ClipboardCheck size={16} />
                데모 결과 만들기
              </button>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
