"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Copy,
  LoaderCircle,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import type {
  Category,
  PublicPurchaseAftercareKit,
  PurchaseAftercareRequest,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  sellerName: string;
  purchaseDate: string;
  deliveredDate: string;
  finalPaidPrice: string;
  expectedPrice: string;
  returnWindowDays: string;
  warrantyMonths: string;
  orderReference: string;
  issues: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  sellerName: "PC Mall",
  purchaseDate: "2026-06-01",
  deliveredDate: "2026-06-03",
  finalPaidPrice: "2185000",
  expectedPrice: "2200000",
  returnWindowDays: "7",
  warrantyMonths: "12",
  orderReference: "ORD-123456",
  issues: "",
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

function payloadFromForm(form: FormState): PurchaseAftercareRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    seller_name: form.sellerName,
    purchase_date: form.purchaseDate,
    delivered_date: form.deliveredDate,
    final_paid_price_krw: parseNumber(form.finalPaidPrice),
    expected_price_krw: parseNumber(form.expectedPrice),
    return_window_days: parseNumber(form.returnWindowDays) ?? 7,
    warranty_months: parseNumber(form.warrantyMonths) ?? 12,
    order_reference: form.orderReference,
    issues: lines(form.issues),
    source: "launch_purchase_aftercare",
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

export function PurchaseAftercarePanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicPurchaseAftercareKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/purchase-aftercare-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`purchase aftercare ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicPurchaseAftercareKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("purchase aftercare rejected");
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
    <section className="launchPublicSection launchAftercare" id="purchase-aftercare">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <RotateCcw size={16} />
            구매 후 케어
          </div>
          <h2>구매 직후 반품 마감과 보증 증거를 놓치지 않게 닫습니다.</h2>
          <p>
            결제 후에도 영수증, 시리얼, 초기 불량, 반품/교환 마감, 보증 만료, 구매 결과 회수를
            한 화면에서 정리합니다.
          </p>
        </div>
        <span className="pill ok">후속 루프</span>
      </div>

      <div className="launchAftercareGrid">
        <article className="launchAftercareForm">
          <div className="launchAftercareControls">
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
              주문번호
              <input
                value={form.orderReference}
                onChange={(event) => update("orderReference", event.target.value)}
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
          <div className="launchAftercareControls dense">
            <label>
              구매일
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(event) => update("purchaseDate", event.target.value)}
              />
            </label>
            <label>
              배송완료일
              <input
                type="date"
                value={form.deliveredDate}
                onChange={(event) => update("deliveredDate", event.target.value)}
              />
            </label>
            <label>
              반품 가능일
              <input
                inputMode="numeric"
                value={form.returnWindowDays}
                onChange={(event) => update("returnWindowDays", event.target.value)}
              />
            </label>
            <label>
              보증 개월
              <input
                inputMode="numeric"
                value={form.warrantyMonths}
                onChange={(event) => update("warrantyMonths", event.target.value)}
              />
            </label>
          </div>
          <div className="launchAftercareControls dense">
            <label>
              최종 결제 금액
              <input
                inputMode="numeric"
                value={form.finalPaidPrice}
                onChange={(event) => update("finalPaidPrice", event.target.value)}
              />
            </label>
            <label>
              예상 금액
              <input
                inputMode="numeric"
                value={form.expectedPrice}
                onChange={(event) => update("expectedPrice", event.target.value)}
              />
            </label>
          </div>
          <label>
            이슈
            <textarea
              rows={3}
              value={form.issues}
              onChange={(event) => update("issues", event.target.value)}
              placeholder="화면 불량, RAM 옵션 상이, 구성품 누락"
            />
          </label>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void buildKit()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <CalendarCheck size={18} />}
            구매 후 케어 만들기
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              구매 후 케어 키트를 만들지 못했습니다. 날짜와 금액을 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchAftercareResult" aria-live="polite">
          {kit ? (
            <>
              <span className={`pill ${tone(kit.priority)}`}>{kit.priority}</span>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchAftercareMetrics">
                <div>
                  <span>반품 마감</span>
                  <strong>{kit.return_deadline}</strong>
                </div>
                <div>
                  <span>보증 만료</span>
                  <strong>{kit.warranty_deadline}</strong>
                </div>
                <div>
                  <span>가격 차이</span>
                  <strong>{money(kit.price_delta_krw)}</strong>
                </div>
              </div>
              <div className="launchAftercareDeadlineGrid">
                {kit.deadlines.map((deadline) => (
                  <article className={deadline.status} key={deadline.deadline_id}>
                    <span>{iconFor(deadline.status)} {deadline.label}</span>
                    <strong>{deadline.due_date}</strong>
                    <p>{deadline.action}</p>
                    <small>{deadline.reminder_copy}</small>
                  </article>
                ))}
              </div>
              <div className="launchAftercareChecklist">
                <div>
                  <strong>캡처 체크</strong>
                  <ul>
                    {kit.capture_checklist.slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>이슈 대응</strong>
                  <ul>
                    {kit.issue_triage.slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchAftercareMessages">
                {kit.messages.map((message) => (
                  <button
                    type="button"
                    key={message.channel}
                    onClick={() => void copyText(message.copy_text)}
                  >
                    <Copy size={16} />
                    <span>{message.label}</span>
                    <small>{message.cta_label}</small>
                  </button>
                ))}
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "purchase-aftercare-kit",
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
                  {copyStatus === "copied" ? "복사됨" : "후속 요약 복사"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 구매 후 케어 문구를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill warn">구매 후 7일</span>
              <h3>반품 마감 전에 초기 불량과 사양 불일치를 닫으세요.</h3>
              <p>
                결제 후에도 구매 결과가 저장되어야 다음 추천이 좋아지고, 반품/AS 증거를 놓치지
                않습니다.
              </p>
              <ul>
                <li>반품/교환 마감과 보증 만료일을 계산합니다.</li>
                <li>영수증, 시리얼, 구성품, 초기 점검 증거를 체크합니다.</li>
                <li>구매 결과 prefill로 만족도와 가격 차이를 남깁니다.</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
