"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

type LaunchDeferredPanelProps = {
  anchorId: string;
  label: string;
  title: string;
  summary: string;
  children: ReactNode;
};

export function LaunchDeferredPanel({
  anchorId,
  label,
  title,
  summary,
  children,
}: LaunchDeferredPanelProps) {
  const [shouldMount, setShouldMount] = useState(false);
  const placeholderRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (shouldMount) {
      return undefined;
    }
    if (typeof window === "undefined") {
      return undefined;
    }
    if (window.location.hash === `#${anchorId}`) {
      setShouldMount(true);
      return undefined;
    }
    const node = placeholderRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShouldMount(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      { rootMargin: "720px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [anchorId, shouldMount]);

  if (shouldMount) {
    return <>{children}</>;
  }

  return (
    <section
      aria-busy="true"
      className="launchPublicSection launchDeferredPanel"
      id={anchorId}
      ref={placeholderRef}
    >
      <div>
        <span className="sectionLabel">
          <LoaderCircle className="spin" size={16} />
          {label}
        </span>
        <h2>{title}</h2>
        <p>{summary}</p>
      </div>
      <span className="pill muted">스크롤 시 로드</span>
    </section>
  );
}

