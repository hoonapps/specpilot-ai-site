"use client";

import { useEffect, useState } from "react";
import { ExternalLink, LoaderCircle, ShieldCheck } from "lucide-react";
import type { OpsStatus, PublicProofHub } from "../types";

type Status = "loading" | "ready" | "error";

function tone(status: OpsStatus) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function pathFor(path: string) {
  if (!path || path.includes("{")) {
    return "/#analysis";
  }
  if (path === "/policy/trust-center") {
    return "/#trust-center";
  }
  if (path.startsWith("/#")) {
    return path;
  }
  if (path.startsWith("#")) {
    return `/${path}`;
  }
  return path;
}

export function LaunchProofHubPanel() {
  const [hub, setHub] = useState<PublicProofHub | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let alive = true;

    async function loadHub() {
      setStatus("loading");
      try {
        const response = await fetch("/api/specpilot/proof-hub?limit=8");
        if (!response.ok) {
          throw new Error(`proof hub ${response.status}`);
        }
        const payload = (await response.json()) as {
          ok: boolean;
          hub?: PublicProofHub;
        };
        if (!payload.ok || !payload.hub) {
          throw new Error("proof hub rejected");
        }
        if (alive) {
          setHub(payload.hub);
          setStatus("ready");
        }
      } catch {
        if (alive) {
          setStatus("error");
        }
      }
    }

    void loadHub();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="launchPublicSection launchProofHub" id="launch-proof-hub">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <ShieldCheck size={16} />
            공개 검증 허브
          </div>
          <h2>{hub?.headline ?? "추천 기준과 공개 증거를 한 화면에서 확인합니다"}</h2>
          <p>
            {hub?.summary ??
              "Trust Center, 시장 리포트, 공유 검토, 피드백, CTA 실험 증거를 묶어 공개 전 신뢰 기준을 보여줍니다."}
          </p>
        </div>
        <span className={`pill ${hub ? tone(hub.status) : status === "error" ? "warn" : "muted"}`}>
          {hub ? `${Math.round(hub.proof_score)}점` : status === "loading" ? "조회 중" : "확인 필요"}
        </span>
      </div>

      {hub ? (
        <>
          <div className="launchProofHubStrip">
            {hub.hero_proof_strip.slice(0, 5).map((item) => (
              <span className="pill ok" key={item}>
                {item}
              </span>
            ))}
          </div>

          <div className="launchProofHubMetricGrid">
            {Object.entries(hub.metric_cards)
              .slice(0, 6)
              .map(([key, value]) => (
                <article key={key}>
                  <span>{key.replaceAll("_", " ")}</span>
                  <strong>{value}</strong>
                </article>
              ))}
          </div>

          <div className="launchProofHubEvidenceGrid">
            {hub.evidence_kit.slice(0, 4).map((item) => (
              <article className="launchProofHubEvidence" key={item.title}>
                <div>
                  <span className={`pill ${tone(item.status)}`}>{item.status}</span>
                  <span className="pill muted">{item.audience}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.proof}</p>
                <a href={pathFor(item.source_path)}>
                  근거 보기
                  <ExternalLink size={14} />
                </a>
                <small>{item.reuse_hint}</small>
              </article>
            ))}
          </div>

          <div className="launchProofHubFooter">
            <div>
              <strong>신뢰 배지</strong>
              <div className="launchPublicPills">
                {hub.trust_badges.slice(0, 6).map((badge) => (
                  <span className="pill muted" key={badge}>
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <strong>구매자 반박 답변</strong>
              <ul>
                {hub.objection_answers.slice(0, 3).map((item) => (
                  <li key={item.question}>
                    <span>{item.question}</span>
                    <p>{item.answer}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="launchProofHubLoading">
          {status === "loading" ? (
            <>
              <LoaderCircle className="spin" size={18} />
              공개 검증 허브를 불러오는 중입니다.
            </>
          ) : (
            "공개 검증 허브를 불러오지 못했습니다. Trust Center와 공개 리포트 기준을 다시 확인하세요."
          )}
        </div>
      )}
    </section>
  );
}
