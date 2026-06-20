const canvas = {
  width: 1200,
  height: 630,
};

const colors = {
  ink: "#10201b",
  muted: "#5f6f67",
  teal: "#0b7c71",
  tealDark: "#083f3a",
  mint: "#dff6ec",
  amber: "#d28a1f",
  cream: "#f7faf6",
  white: "#ffffff",
  line: "#cfe3d8",
};

type LaunchSocialImageProps = {
  label?: string;
};

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: 192,
        padding: "16px 18px",
        border: `2px solid ${colors.line}`,
        borderRadius: 18,
        background: "rgba(255,255,255,0.82)",
      }}
    >
      <span style={{ color: colors.teal, fontSize: 22, fontWeight: 800 }}>
        {label}
      </span>
      <strong style={{ color: colors.ink, fontSize: 38, lineHeight: 1 }}>
        {value}
      </strong>
      <span style={{ color: colors.muted, fontSize: 16, lineHeight: 1.28 }}>
        {note}
      </span>
    </div>
  );
}

function SignalPill({ children }: { children: string }) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 14px",
        borderRadius: 999,
        background: colors.mint,
        color: colors.tealDark,
        fontSize: 20,
        fontWeight: 800,
      }}
    >
      {children}
    </span>
  );
}

export function LaunchSocialImage({
  label = "PUBLIC LAUNCH ROOM",
}: LaunchSocialImageProps) {
  return (
    <div
      style={{
        width: canvas.width,
        height: canvas.height,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: colors.cream,
        color: colors.ink,
        fontFamily:
          "Apple SD Gothic Neo, Noto Sans KR, Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background:
            "linear-gradient(135deg, rgba(223,246,236,0.92), rgba(255,255,255,0.96) 46%, rgba(245,238,220,0.62))",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -70,
          bottom: -72,
          width: 560,
          height: 280,
          display: "flex",
          border: `3px solid ${colors.line}`,
          borderRadius: 36,
          transform: "rotate(-6deg)",
          background: "rgba(255,255,255,0.68)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 70,
          top: 108,
          width: 330,
          height: 248,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: 24,
          border: `2px solid ${colors.line}`,
          borderRadius: 26,
          background: "rgba(255,255,255,0.78)",
          boxShadow: "0 24px 70px rgba(16,32,27,0.12)",
        }}
      >
        {[
          ["조건 진단", "예산·용도·필수 조건 보강"],
          ["가격 타이밍", "목표가와 대기 사유 분리"],
          ["결제 전 검수", "옵션·사양·판매자 답변 확인"],
        ].map(([title, note]) => (
          <div
            key={title}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 16,
              background: title === "가격 타이밍" ? "#fff5de" : "#eef8f2",
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                background: title === "가격 타이밍" ? colors.amber : colors.teal,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <strong style={{ fontSize: 20 }}>{title}</strong>
              <span style={{ fontSize: 15, color: colors.muted }}>{note}</span>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "54px 64px 42px",
          width: "100%",
          height: "100%",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 58,
                height: 58,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 16,
                background: colors.ink,
                color: colors.mint,
                fontSize: 22,
                fontWeight: 900,
              }}
            >
              SP
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <strong style={{ fontSize: 28 }}>SpecPilot AI</strong>
              <span style={{ color: colors.muted, fontSize: 18 }}>
                Computer buying agent
              </span>
            </div>
          </div>
          <SignalPill>{label}</SignalPill>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <SignalPill>최저가보다 실패 비용 절감</SignalPill>
            <SignalPill>데스크톱 PC · 노트북</SignalPill>
          </div>
          <h1
            style={{
              width: 650,
              margin: 0,
              color: colors.ink,
              fontSize: 59,
              lineHeight: 1.08,
              letterSpacing: 0,
              fontWeight: 950,
            }}
          >
            컴퓨터·노트북 구매 실패를 줄이는 AI 구매 리포트
          </h1>
          <p
            style={{
              width: 660,
              margin: 0,
              color: colors.muted,
              fontSize: 25,
              lineHeight: 1.34,
              fontWeight: 650,
            }}
          >
            예산과 용도를 넣으면 추천, 제외 후보, 가격 타이밍, 공유 검토,
            결제 전 체크까지 한 번에 정리합니다.
          </p>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <MetricCard label="공개 데모" value="3개" note="바로 적용할 구매 상황" />
          <MetricCard label="시장 리포트" value="2개" note="데스크톱 PC와 노트북" />
          <MetricCard label="공유 문구" value="3개" note="커뮤니티·팀 승인·지인 검토" />
        </div>
      </div>
    </div>
  );
}
