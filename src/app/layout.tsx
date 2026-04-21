import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoGuide AI",
  description:
    "천안시 주민이 텍스트나 사진으로 분리배출 방법을 물으면 공식 근거와 함께 안내하는 AI 도우미입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
