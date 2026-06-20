"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Laptop,
  LoaderCircle,
  PlugZap,
  ShieldAlert,
} from "lucide-react";
import type {
  Category,
  FirstBootSetupRequest,
  PublicFirstBootSetupKit,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  osName: string;
  primaryPurpose: string;
  monitorResolution: string;
  connectionType: string;
  peripherals: string;
  missingDrivers: string;
  observedIssues: string;
  warrantyRegistered: boolean;
  biosUpdated: boolean;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  osName: "Windows 11 Pro",
  primaryPurpose: "QHD 영상 편집",
  monitorResolution: "2560x1440 144Hz",
  connectionType: "DisplayPort",
  peripherals: "모니터\n키보드\n마우스",
  missingDrivers: "graphics",
  observedIssues: "",
  warrantyRegistered: false,
  biosUpdated: true,
};

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function payloadFromForm(form: FormState): FirstBootSetupRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    os_name: form.osName,
    primary_purpose: form.primaryPurpose,
    monitor_resolution: form.monitorResolution,
    connection_type: form.connectionType,
    peripherals: lines(form.peripherals),
    missing_drivers: lines(form.missingDrivers),
    observed_issues: lines(form.observedIssues),
    warranty_registered: form.warrantyRegistered,
    bios_updated: form.biosUpdated,
    source: "launch_first_boot_setup",
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

export function FirstBootSetupPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicFirstBootSetupKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/first-boot-setup-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`first boot setup ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicFirstBootSetupKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("first boot setup rejected");
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
    <section className="launchPublicSection launchFirstBoot" id="first-boot-setup">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <PlugZap size={16} />
            첫 부팅 세팅
          </div>
          <h2>받자마자 전원, 드라이버, 성능 기준값을 검수합니다.</h2>
          <p>
            제품 수령 후 OS, 포트, 디스플레이, 드라이버, 벤치마크, 보증 등록을 첫날
            기준값으로 저장합니다.
          </p>
        </div>
        <span className="pill warn">첫날 기준값</span>
      </div>

      <div className="launchFirstBootGrid">
        <article className="launchFirstBootForm">
          <div className="launchFirstBootControls">
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
          <div className="launchFirstBootControls">
            <label>
              OS
              <input value={form.osName} onChange={(event) => update("osName", event.target.value)} />
            </label>
            <label>
              사용 목적
              <input
                value={form.primaryPurpose}
                onChange={(event) => update("primaryPurpose", event.target.value)}
              />
            </label>
          </div>
          <div className="launchFirstBootControls dense">
            <label>
              해상도/주사율
              <input
                value={form.monitorResolution}
                onChange={(event) => update("monitorResolution", event.target.value)}
              />
            </label>
            <label>
              연결 방식
              <input
                value={form.connectionType}
                onChange={(event) => update("connectionType", event.target.value)}
              />
            </label>
          </div>
          <div className="launchFirstBootControls dense">
            <label>
              보증 등록
              <input
                type="checkbox"
                checked={form.warrantyRegistered}
                onChange={(event) => update("warrantyRegistered", event.target.checked)}
              />
            </label>
            <label>
              BIOS 확인
              <input
                type="checkbox"
                checked={form.biosUpdated}
                onChange={(event) => update("biosUpdated", event.target.checked)}
              />
            </label>
          </div>
          <label>
            주변기기
            <textarea
              rows={3}
              value={form.peripherals}
              onChange={(event) => update("peripherals", event.target.value)}
            />
          </label>
          <label>
            미확인 드라이버
            <textarea
              rows={2}
              value={form.missingDrivers}
              onChange={(event) => update("missingDrivers", event.target.value)}
              placeholder="graphics, network, vendor_utility"
            />
          </label>
          <label>
            관찰 이슈
            <textarea
              rows={3}
              value={form.observedIssues}
              onChange={(event) => update("observedIssues", event.target.value)}
              placeholder="부팅 중 꺼짐, 화면 깜빡임, 팬 소음"
            />
          </label>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void buildKit()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <Laptop size={18} />}
            첫 부팅 검수 만들기
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              첫 부팅 세팅 키트를 만들지 못했습니다. 입력값을 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchFirstBootResult" aria-live="polite">
          {kit ? (
            <>
              <span className={`pill ${tone(kit.priority)}`}>{kit.priority}</span>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchFirstBootScore">
                <strong>{kit.setup_score}점</strong>
                <span>첫 부팅 세팅 점수</span>
              </div>
              <div className="launchFirstBootTaskGrid">
                {[...kit.first_boot_checklist, ...kit.driver_checklist].slice(0, 7).map((task) => (
                  <article className={task.status} key={task.task_id}>
                    <span>{iconFor(task.status)} {task.label}</span>
                    <p>{task.instruction}</p>
                    <small>{task.evidence}</small>
                  </article>
                ))}
              </div>
              <div className="launchFirstBootColumns">
                <div>
                  <strong>벤치마크 기준값</strong>
                  <ul>
                    {kit.benchmark_plan.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>이슈 대응</strong>
                  <ul>
                    {kit.issue_triage.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchFirstBootMessages">
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
                    source: "first-boot-setup-kit",
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
                  {copyStatus === "copied" ? "복사됨" : "세팅 요약 복사"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 첫 부팅 세팅 문구를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill warn">수령 첫날</span>
              <h3>첫 부팅 기준값이 없으면 나중에 불량과 세팅 문제를 구분하기 어렵습니다.</h3>
              <p>
                드라이버, 해상도, 포트, 발열, 벤치마크, 보증 등록을 같은 체크리스트로 닫습니다.
              </p>
              <ul>
                <li>전원, 화면, 포트, OS 활성화를 확인합니다.</li>
                <li>드라이버와 제조사 유틸리티 누락을 표시합니다.</li>
                <li>성능 기준값과 문의 문구를 바로 복사합니다.</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
