import type { Metadata } from "next";
import LaunchWorkbench from "../LaunchWorkbench";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SpecPilot AI 기능별 데모 | 구매 의사결정 도구 모음",
  description:
    "구매 여정, 커뮤니티 답변, 질문 라우팅, 리뷰 리스크, 최종 판정, 구매 실행 등 SpecPilot AI의 기능별 공개 데모를 확인합니다.",
  alternates: {
    canonical: "/launch/tools",
  },
};

export default LaunchWorkbench;
