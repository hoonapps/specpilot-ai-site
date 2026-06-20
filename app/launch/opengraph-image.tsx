import { ImageResponse } from "next/og";
import { LaunchSocialImage } from "./social-image";

export const runtime = "edge";
export const alt =
  "SpecPilot AI - 컴퓨터와 노트북 구매 실패를 줄이는 공개 AI 구매 리포트";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<LaunchSocialImage />, size);
}
