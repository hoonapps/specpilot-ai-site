"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  ClipboardCheck,
  Copy,
  Factory,
  FileWarning,
  LoaderCircle,
  ShieldAlert,
} from "lucide-react";
import type { Category, DefectClaimRequest, OpsStatus, PublicDefectClaimKit } from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  sellerName: string;
  manufacturerName: string;
  purchaseDate: string;
  deliveredDate: string;
  returnDeadline: string;
  warrantyDeadline: string;
  finalPaidPrice: string;
  orderReferenceMasked: string;
  preferredResolution: string;
  issueSummary: string;
  observedIssues: string;
  failedChecks: string;
  benchmarkStatus: OpsStatus;
  evidenceItems: string;
  sellerResponses: string;
  policyText: string;
};

const demoForm: FormState = {
  category: "laptop",
  productTitle: "CreatorBook 16",
  sellerName: "Laptop Store",
  manufacturerName: "Maker",
  purchaseDate: "2026-06-01",
  deliveredDate: "2026-06-19",
  returnDeadline: "2026-06-26",
  warrantyDeadline: "2027-06-01",
  finalPaidPrice: "1780000",
  orderReferenceMasked: "ORD***123",
  preferredResolution: "exchange",
  issueSummary: "벤치마크 중 꺼짐과 화면 깜빡임",
  observedIssues: "렌더링 중 꺼짐\n화면 깜빡임\n고주파",
  failedChecks: "GPU 점수 59%\nCPU 106도",
  benchmarkStatus: "blocker",
  evidenceItems: "결제 영수증\n시리얼 사진\n꺼짐 재현 영상\n온도 그래프",
  sellerResponses: "판매자 1차 문의 접수",
  policyText: "초기 불량 교환 가능",
};

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parsePrice(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function payloadFromForm(form: FormState): DefectClaimRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    seller_name: form.sellerName,
    manufacturer_name: form.manufacturerName,
    purchase_date: form.purchaseDate,
    delivered_date: form.deliveredDate,
    return_deadline: form.returnDeadline,
    warranty_deadline: form.warrantyDeadline,
    final_paid_price_krw: parsePrice(form.finalPaidPrice),
    order_reference_masked: form.orderReferenceMasked,
    preferred_resolution: form.preferredResolution,
    issue_summary: form.issueSummary,
    observed_issues: lines(form.observedIssues),
    failed_checks: lines(form.failedChecks),
    benchmark_status: form.benchmarkStatus,
    evidence_items: lines(form.evidenceItems),
    seller_responses: lines(form.sellerResponses),
    policy_text: form.policyText,
    source: "launch_defect_claim",
  };
}

function tone(status: string) {
  if (status === "ok" || status === "ready") {
    return "ok";
  }
  return status === "blocker" || status === "hold" ? "danger" : "warn";
}

function iconFor(status: string) {
  if (status === "blocker") {
    return <ShieldAlert size={15} />;
  }
  if (status === "warning") {
    return <AlertTriangle size={15} />;
  }
  return <ClipboardCheck size={15} />;
}

export function DefectClaimPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicDefectClaimKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/defect-claim-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`defect claim ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicDefectClaimKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("defect claim rejected");
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
    <section className="launchPublicSection launchDefectClaim" id="defect-claim">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <FileWarning size={16} />
            반품·AS 증거 패키지
          </div>
          <h2>이상 증상을 접수 가능한 증거 패킷으로 정리합니다.</h2>
          <p>
            수령 후 꺼짐, 소음, 사양 불일치, 벤치마크 실패를 반품 마감과 보증 기간 기준으로 묶고
            판매자/제조사에 보낼 문구를 만듭니다.
          </p>
        </div>
        <span className="pill danger">claim ready</span>
      </div>

      <div className="launchDefectGrid">
        <article className="launchDefectForm">
          <div className="launchDefectControls">
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
              희망 처리
              <select
                value={form.preferredResolution}
                onChange={(event) => update("preferredResolution", event.target.value)}
              >
                <option value="exchange">교환</option>
                <option value="refund">환불</option>
                <option value="repair">수리</option>
                <option value="guidance">접수 기준 안내</option>
              </select>
            </label>
          </div>
          <label>
            제품명
            <input value={form.productTitle} onChange={(event) => update("productTitle", event.target.value)} />
          </label>
          <div className="launchDefectControls">
            <label>
              판매자
              <input value={form.sellerName} onChange={(event) => update("sellerName", event.target.value)} />
            </label>
            <label>
              제조사
              <input
                value={form.manufacturerName}
                onChange={(event) => update("manufacturerName", event.target.value)}
              />
            </label>
          </div>
          <div className="launchDefectControls dense">
            <label>
              구매일
              <input type="date" value={form.purchaseDate} onChange={(event) => update("purchaseDate", event.target.value)} />
            </label>
            <label>
              수령일
              <input type="date" value={form.deliveredDate} onChange={(event) => update("deliveredDate", event.target.value)} />
            </label>
            <label>
              반품 마감
              <input type="date" value={form.returnDeadline} onChange={(event) => update("returnDeadline", event.target.value)} />
            </label>
            <label>
              보증 마감
              <input type="date" value={form.warrantyDeadline} onChange={(event) => update("warrantyDeadline", event.target.value)} />
            </label>
          </div>
          <div className="launchDefectControls">
            <label>
              최종 결제 금액
              <input
                inputMode="numeric"
                value={form.finalPaidPrice}
                onChange={(event) => update("finalPaidPrice", event.target.value)}
              />
            </label>
            <label>
              마스킹 주문번호
              <input
                value={form.orderReferenceMasked}
                onChange={(event) => update("orderReferenceMasked", event.target.value)}
              />
            </label>
          </div>
          <label>
            증상 요약
            <input value={form.issueSummary} onChange={(event) => update("issueSummary", event.target.value)} />
          </label>
          <div className="launchDefectControls">
            <label>
              관찰 증상
              <textarea rows={4} value={form.observedIssues} onChange={(event) => update("observedIssues", event.target.value)} />
            </label>
            <label>
              실패 점검
              <textarea rows={4} value={form.failedChecks} onChange={(event) => update("failedChecks", event.target.value)} />
            </label>
          </div>
          <label>
            벤치마크 상태
            <select
              value={form.benchmarkStatus}
              onChange={(event) => update("benchmarkStatus", event.target.value as OpsStatus)}
            >
              <option value="ok">ok</option>
              <option value="warning">warning</option>
              <option value="blocker">blocker</option>
            </select>
          </label>
          <div className="launchDefectControls">
            <label>
              확보 증거
              <textarea rows={4} value={form.evidenceItems} onChange={(event) => update("evidenceItems", event.target.value)} />
            </label>
            <label>
              판매자 답변
              <textarea rows={4} value={form.sellerResponses} onChange={(event) => update("sellerResponses", event.target.value)} />
            </label>
          </div>
          <label>
            정책 메모
            <textarea rows={3} value={form.policyText} onChange={(event) => update("policyText", event.target.value)} />
          </label>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void buildKit()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <FileWarning size={18} />}
            반품·AS 패킷 만들기
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              반품·AS 증거 패키지를 만들지 못했습니다. 날짜와 증거 항목을 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchDefectResult" aria-live="polite">
          {kit ? (
            <>
              <div className="launchDefectScore">
                <span className={`pill ${tone(kit.claim_status)}`}>{kit.urgency_label}</span>
                <strong>{kit.claim_score}</strong>
                <small>{kit.claim_status}</small>
              </div>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchDefectTimeline">
                {kit.timeline.map((item) => (
                  <article className={item.status} key={item.item_id}>
                    <span>{iconFor(item.status)} {item.label}</span>
                    <strong>{item.due_date}</strong>
                    <p>{item.action}</p>
                  </article>
                ))}
              </div>
              <div className="launchDefectColumns">
                <div>
                  <strong>보강 증거</strong>
                  <ul>
                    {(kit.evidence_gaps.length ? kit.evidence_gaps : kit.evidence_checklist).slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>접수 단계</strong>
                  <ul>
                    {kit.claim_steps.slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchDefectMessageGrid">
                <article>
                  <Factory size={17} />
                  <strong>판매자 접수</strong>
                  <p>{kit.seller_message}</p>
                  <button type="button" onClick={() => void copyText(kit.seller_message)}>
                    <Copy size={16} />
                    문구 복사
                  </button>
                </article>
                <article>
                  <CalendarClock size={17} />
                  <strong>제조사 AS</strong>
                  <p>{kit.manufacturer_message}</p>
                  <button type="button" onClick={() => void copyText(kit.manufacturer_message)}>
                    <Copy size={16} />
                    문구 복사
                  </button>
                </article>
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "defect-claim-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    purpose: kit.product_title,
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" onClick={() => void copyText(kit.share_copy)}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "패킷 요약 복사"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">클립보드 권한이 없어 접수 문구를 복사하지 못했습니다.</p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill danger">수령 후 접수</span>
              <h3>증상은 있는데 무엇을 보내야 할지 모르면 접수가 늦어집니다.</h3>
              <p>
                주문 증거, 재현 영상, 벤치마크 실패, 정책 마감일을 한 번에 묶어 판매자와 제조사에
                같은 기준으로 문의합니다.
              </p>
              <ul>
                <li>반품/교환 마감과 보증 만료 타임라인</li>
                <li>빠진 증거와 원본 고정 체크리스트</li>
                <li>판매자/제조사별 복사용 접수 문구</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
