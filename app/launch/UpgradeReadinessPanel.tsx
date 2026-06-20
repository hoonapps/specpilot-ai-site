"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  LoaderCircle,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import type {
  Category,
  PublicUpgradeReadinessKit,
  UpgradeReadinessRequest,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  cpuPlatform: string;
  gpuName: string;
  ramGb: string;
  ramSlotsTotal: string;
  ramSlotsUsed: string;
  storageSlotsTotal: string;
  storageSlotsUsed: string;
  psuWatt: string;
  caseFormFactor: string;
  laptopRamUpgradeable: string;
  laptopStorageUpgradeable: string;
  targetYears: string;
  plannedUpgrades: string;
  constraints: string;
  budgetKrw: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  cpuPlatform: "AM5",
  gpuName: "RTX 4070 SUPER",
  ramGb: "32",
  ramSlotsTotal: "4",
  ramSlotsUsed: "2",
  storageSlotsTotal: "3",
  storageSlotsUsed: "1",
  psuWatt: "750",
  caseFormFactor: "ATX mid tower",
  laptopRamUpgradeable: "unknown",
  laptopStorageUpgradeable: "unknown",
  targetYears: "4",
  plannedUpgrades: "RAM 64GB\nSSD 2TB\nGPU 교체",
  constraints: "QHD 144Hz 유지",
  budgetKrw: "2200000",
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseBool(value: string): boolean | null {
  if (value === "yes") {
    return true;
  }
  if (value === "no") {
    return false;
  }
  return null;
}

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function payloadFromForm(form: FormState): UpgradeReadinessRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    cpu_platform: form.cpuPlatform,
    gpu_name: form.gpuName,
    ram_gb: parseNumber(form.ramGb) ?? 16,
    ram_slots_total: parseNumber(form.ramSlotsTotal) ?? 2,
    ram_slots_used: parseNumber(form.ramSlotsUsed) ?? 2,
    storage_slots_total: parseNumber(form.storageSlotsTotal) ?? 2,
    storage_slots_used: parseNumber(form.storageSlotsUsed) ?? 1,
    psu_watt: parseNumber(form.psuWatt),
    case_form_factor: form.caseFormFactor,
    laptop_ram_upgradeable: parseBool(form.laptopRamUpgradeable),
    laptop_storage_upgradeable: parseBool(form.laptopStorageUpgradeable),
    target_years: parseNumber(form.targetYears) ?? 3,
    planned_upgrades: lines(form.plannedUpgrades),
    constraints: lines(form.constraints),
    budget_krw: parseNumber(form.budgetKrw),
    source: "launch_upgrade_readiness",
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

function won(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function UpgradeReadinessPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicUpgradeReadinessKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/upgrade-readiness-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`upgrade readiness ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicUpgradeReadinessKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("upgrade readiness rejected");
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
    <section className="launchPublicSection launchUpgradeReadiness" id="upgrade-readiness">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Wrench size={16} />
            업그레이드 수명
          </div>
          <h2>지금 사도 몇 년 버틸지 RAM, SSD, 파워, 플랫폼 여지를 계산합니다.</h2>
          <p>
            구매 후보의 슬롯, 파워, 케이스, 노트북 온보드 조건을 장기 보유 기간과 연결해
            초기 옵션 상향 또는 결제 보류를 판단합니다.
          </p>
        </div>
        <span className="pill ok">장기 사용</span>
      </div>

      <div className="launchUpgradeGrid">
        <article className="launchUpgradeForm">
          <div className="launchUpgradeControls">
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
              <input
                value={form.productTitle}
                onChange={(event) => update("productTitle", event.target.value)}
              />
            </label>
          </div>
          <div className="launchUpgradeControls">
            <label>
              CPU 플랫폼
              <input value={form.cpuPlatform} onChange={(event) => update("cpuPlatform", event.target.value)} />
            </label>
            <label>
              GPU
              <input value={form.gpuName} onChange={(event) => update("gpuName", event.target.value)} />
            </label>
          </div>
          <div className="launchUpgradeControls dense">
            <label>
              RAM GB
              <input inputMode="numeric" value={form.ramGb} onChange={(event) => update("ramGb", event.target.value)} />
            </label>
            <label>
              RAM 슬롯
              <input
                inputMode="numeric"
                value={form.ramSlotsTotal}
                onChange={(event) => update("ramSlotsTotal", event.target.value)}
              />
            </label>
            <label>
              사용 슬롯
              <input
                inputMode="numeric"
                value={form.ramSlotsUsed}
                onChange={(event) => update("ramSlotsUsed", event.target.value)}
              />
            </label>
          </div>
          <div className="launchUpgradeControls dense">
            <label>
              SSD 슬롯
              <input
                inputMode="numeric"
                value={form.storageSlotsTotal}
                onChange={(event) => update("storageSlotsTotal", event.target.value)}
              />
            </label>
            <label>
              사용 슬롯
              <input
                inputMode="numeric"
                value={form.storageSlotsUsed}
                onChange={(event) => update("storageSlotsUsed", event.target.value)}
              />
            </label>
            <label>
              파워 W
              <input
                inputMode="numeric"
                value={form.psuWatt}
                onChange={(event) => update("psuWatt", event.target.value)}
              />
            </label>
          </div>
          <div className="launchUpgradeControls">
            <label>
              케이스/폼팩터
              <input
                value={form.caseFormFactor}
                onChange={(event) => update("caseFormFactor", event.target.value)}
              />
            </label>
            <label>
              목표 보유 연수
              <input
                inputMode="numeric"
                value={form.targetYears}
                onChange={(event) => update("targetYears", event.target.value)}
              />
            </label>
          </div>
          <div className="launchUpgradeControls dense">
            <label>
              노트북 RAM
              <select
                value={form.laptopRamUpgradeable}
                onChange={(event) => update("laptopRamUpgradeable", event.target.value)}
              >
                <option value="unknown">불명</option>
                <option value="yes">업그레이드 가능</option>
                <option value="no">온보드/불가</option>
              </select>
            </label>
            <label>
              노트북 SSD
              <select
                value={form.laptopStorageUpgradeable}
                onChange={(event) => update("laptopStorageUpgradeable", event.target.value)}
              >
                <option value="unknown">불명</option>
                <option value="yes">교체/추가 가능</option>
                <option value="no">교체 제한</option>
              </select>
            </label>
            <label>
              예산
              <input
                inputMode="numeric"
                value={form.budgetKrw}
                onChange={(event) => update("budgetKrw", event.target.value)}
              />
            </label>
          </div>
          <label>
            계획한 업그레이드
            <textarea
              rows={3}
              value={form.plannedUpgrades}
              onChange={(event) => update("plannedUpgrades", event.target.value)}
            />
          </label>
          <label>
            제약 조건
            <textarea
              rows={2}
              value={form.constraints}
              onChange={(event) => update("constraints", event.target.value)}
            />
          </label>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void buildKit()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <Wrench size={18} />}
            업그레이드 수명 계산
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              업그레이드 수명 검수 키트를 만들지 못했습니다. 슬롯과 파워 입력을 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchUpgradeResult" aria-live="polite">
          {kit ? (
            <>
              <span className={`pill ${tone(kit.priority)}`}>{kit.priority}</span>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchUpgradeScore">
                <strong>{kit.readiness_score}점</strong>
                <span>{kit.horizon_months}개월 보유 기준</span>
              </div>
              <div className="launchUpgradeItemGrid">
                {kit.readiness_items.map((item) => (
                  <article className={item.status} key={item.item_id}>
                    <span>{iconFor(item.status)} {item.label}</span>
                    <p>{item.finding}</p>
                    <small>{item.recommendation}</small>
                  </article>
                ))}
              </div>
              <div className="launchUpgradePathGrid">
                {kit.upgrade_paths.slice(0, 3).map((path) => (
                  <article className={path.priority} key={path.path_id}>
                    <span>{path.timing}</span>
                    <strong>{path.label}</strong>
                    <p>{path.expected_gain}</p>
                    <small>{won(path.estimated_cost_krw)}</small>
                  </article>
                ))}
              </div>
              <div className="launchUpgradeColumns">
                <div>
                  <strong>판매자 질문</strong>
                  <ul>
                    {kit.seller_questions.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>수명 리스크</strong>
                  <ul>
                    {kit.lifecycle_risks.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "upgrade-readiness-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: payloadFromForm(form).budget_krw ?? undefined,
                    purpose: kit.product_title,
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" onClick={() => void copyText(kit.share_copy)}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "수명 요약 복사"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 업그레이드 수명 문구를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill ok">2-4년 보유</span>
              <h3>업그레이드가 막힌 후보는 싸게 사도 빨리 다시 사게 됩니다.</h3>
              <p>
                RAM, SSD, 파워, 케이스, 노트북 온보드 조건을 목표 보유 기간과 함께 계산합니다.
              </p>
              <ul>
                <li>빈 슬롯과 파워 여유로 장기 사용 가능성을 점수화합니다.</li>
                <li>노트북은 온보드 RAM/SSD 제약을 구매 전 확인합니다.</li>
                <li>판매자에게 물어볼 확장성 질문을 바로 만듭니다.</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
