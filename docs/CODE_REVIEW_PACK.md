# Code Review Pack

## Purpose

This document is a Notion-friendly code review package for EcoGuide AI.
It is meant for teammates who need to:

- understand the overall codebase structure
- review the implementation without opening every file manually
- discuss refactoring ideas
- prepare presentation material or reports based on the real code

## How To Use This Document

Recommended reading order:

1. Project summary
2. Architecture map
3. Review checklist
4. File inventory
5. Full source appendix

## Project Summary

EcoGuide AI is a Cheonan-focused waste disposal assistant built as a Next.js full-stack web app.
Users can ask a waste-disposal question with optional image upload, and the server returns a structured answer grounded in official sources.

Current implementation includes:

- Next.js web UI
- `GET /api/health`
- `POST /api/chat`
- OpenAI Responses API integration
- OpenAI File Search retrieval
- source ingestion script
- Vercel deployment configuration

## Architecture Map

```text
[User]
  -> [Next.js UI]
  -> [API Route: /api/chat]
  -> [OpenAI Responses API]
  -> [File Search over official sources]
  -> [Structured answer + citations]
```

## Review Checklist

- Does input validation in the API match the intended product behavior?
- Are error messages understandable and stable?
- Is citation handling tied tightly enough to authoritative sources?
- Does the ingestion flow avoid duplicate uploads and support reindexing safely?
- Are UI components easy to follow and refactor?
- Are config loading and environment assumptions explicit?
- Are there places where naming, separation of concerns, or reuse can be improved?

## File Inventory

| File | Purpose |
| --- | --- |
| `package.json` | Project scripts, dependencies, and runtime metadata. |
| `tsconfig.json` | TypeScript compiler settings for the project. |
| `vercel.json` | Vercel deployment and Korea-only access policy configuration. |
| `.env.example` | Environment variable template for local and deployed environments. |
| `src/app/layout.tsx` | Root layout for the Next.js application. |
| `src/app/page.tsx` | Home page composition for the main user experience. |
| `src/app/globals.css` | Global styles used across the application. |
| `src/app/api/health/route.ts` | Health check endpoint for runtime readiness. |
| `src/app/api/chat/route.ts` | Main chat endpoint that validates input and calls the AI layer. |
| `src/components/home-hero.tsx` | Top hero section shown on the landing page. |
| `src/components/example-questions.tsx` | Starter questions to help users understand what to ask. |
| `src/components/question-workspace.tsx` | Question form, file upload logic, and request lifecycle UI. |
| `src/components/answer-card.tsx` | Structured answer renderer for decision, reason, and prep steps. |
| `src/components/citation-list.tsx` | Citation rendering component for official sources. |
| `src/lib/api-errors.ts` | Helpers for returning stable JSON error responses. |
| `src/lib/config.ts` | Environment variable loading and public/server config access. |
| `src/lib/contracts.ts` | Shared Zod schemas and TypeScript types for API contracts. |
| `src/lib/source-catalog.ts` | Source catalog loader and authoritative source helpers. |
| `src/lib/openai/client.ts` | OpenAI client creation and reuse. |
| `src/lib/openai/prompt.ts` | System and user prompt construction logic. |
| `src/lib/openai/response-schema.ts` | Model response schema for structured output parsing. |
| `src/lib/openai/chat.ts` | Core OpenAI call flow, retrieval handling, and citation normalization. |
| `scripts/ingest-docs.ts` | Official source ingestion and vector store synchronization script. |

## Full Source Appendix


## package.json

Project scripts, dependencies, and runtime metadata.

```json
{
  "name": "bu_eco_ai",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=20.9.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint src scripts",
    "typecheck": "tsc --noEmit",
    "ingest": "tsx scripts/ingest-docs.ts",
    "export:review-pack": "tsx scripts/export-code-review-pack.ts"
  },
  "dependencies": {
    "next": "16.2.1",
    "openai": "6.32.0",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "yaml": "2.8.3",
    "zod": "4.3.6"
  },
  "devDependencies": {
    "@eslint/eslintrc": "3.3.5",
    "@tailwindcss/postcss": "4.2.2",
    "@types/node": "25.5.0",
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3",
    "eslint": "9.39.4",
    "eslint-config-next": "16.2.1",
    "tailwindcss": "4.2.2",
    "tsx": "4.21.0",
    "typescript": "5.9.3"
  }
}

```

## tsconfig.json

TypeScript compiler settings for the project.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": [
      "dom",
      "dom.iterable",
      "es2022"
    ],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}

```

## vercel.json

Vercel deployment and Korea-only access policy configuration.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "routes": [
    {
      "src": "/(.*)",
      "missing": [
        {
          "type": "header",
          "key": "x-vercel-ip-country"
        }
      ],
      "mitigate": {
        "action": "deny"
      }
    },
    {
      "src": "/(.*)",
      "has": [
        {
          "type": "header",
          "key": "x-vercel-ip-country",
          "value": {
            "ninc": [
              "KR"
            ]
          }
        }
      ],
      "mitigate": {
        "action": "deny"
      }
    }
  ]
}

```

## .env.example

Environment variable template for local and deployed environments.

```bash
﻿OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.4
OPENAI_FALLBACK_MODEL=gpt-5-mini
OPENAI_VECTOR_STORE_ID=
OPENAI_FILE_SEARCH_MAX_RESULTS=6

APP_ENV=development
APP_REGION_CODE=cheonan-si
APP_REGION_NAME=천안시

NEXT_PUBLIC_APP_NAME=EcoGuide AI
NEXT_PUBLIC_APP_REGION_LABEL=천안시

```

## src/app/layout.tsx

Root layout for the Next.js application.

```tsx
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

```

## src/app/page.tsx

Home page composition for the main user experience.

```tsx
import { ExampleQuestions } from "@/components/example-questions";
import { HomeHero } from "@/components/home-hero";
import { QuestionWorkspace } from "@/components/question-workspace";
import { getPublicAppConfig } from "@/lib/config";

export default function HomePage() {
  const config = getPublicAppConfig();

  return (
    <main className="page-shell min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <HomeHero appName={config.appName} regionLabel={config.regionLabel} />
        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <QuestionWorkspace regionLabel={config.regionLabel} />
          <ExampleQuestions />
        </section>
      </div>
    </main>
  );
}

```

## src/app/globals.css

Global styles used across the application.

```css
@import "tailwindcss";

:root {
  --background: #f4efe7;
  --background-accent: #e3efe4;
  --surface: rgba(255, 252, 246, 0.88);
  --surface-strong: #fffdf8;
  --border: rgba(49, 73, 54, 0.14);
  --foreground: #1f2a21;
  --muted: #536255;
  --primary: #1d6b43;
  --primary-strong: #144c30;
  --warning: #a36016;
  --danger: #9b2d30;
  --shadow: 0 22px 60px rgba(32, 47, 35, 0.12);
  --font-body:
    "Pretendard",
    "Noto Sans KR",
    "Apple SD Gothic Neo",
    "Malgun Gothic",
    "Segoe UI",
    sans-serif;
  --font-display:
    "Iowan Old Style",
    "Palatino Linotype",
    "Book Antiqua",
    "Georgia",
    serif;
}

* {
  box-sizing: border-box;
}

html {
  color-scheme: light;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(61, 145, 93, 0.18), transparent 35%),
    radial-gradient(circle at top right, rgba(227, 174, 90, 0.18), transparent 32%),
    linear-gradient(180deg, var(--background), #f8f4eb);
  color: var(--foreground);
  font-family: var(--font-body), sans-serif;
}

a {
  color: inherit;
}

button,
input,
textarea {
  font: inherit;
}

.page-shell {
  position: relative;
  overflow: hidden;
}

.page-shell::before,
.page-shell::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  filter: blur(2px);
  pointer-events: none;
}

.page-shell::before {
  top: -7rem;
  right: -4rem;
  width: 20rem;
  height: 20rem;
  background: rgba(80, 169, 114, 0.12);
}

.page-shell::after {
  bottom: -8rem;
  left: -6rem;
  width: 18rem;
  height: 18rem;
  background: rgba(236, 191, 123, 0.16);
}

.card-surface {
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  backdrop-filter: blur(14px);
}

.section-title {
  font-family: var(--font-display), serif;
  letter-spacing: -0.02em;
}

```

## src/app/api/health/route.ts

Health check endpoint for runtime readiness.

```ts
import { NextResponse } from "next/server";
import { getRuntimeReadiness } from "@/lib/config";
import { healthResponseSchema } from "@/lib/contracts";

export const runtime = "nodejs";

export async function GET() {
  const readiness = getRuntimeReadiness();
  const status =
    readiness.checks.openai_api_key && readiness.checks.vector_store_id
      ? "ok"
      : "degraded";

  const payload = healthResponseSchema.parse({
    service: readiness.service,
    status,
    region: readiness.region,
    checks: readiness.checks,
  });

  return NextResponse.json(payload);
}

```

## src/app/api/chat/route.ts

Main chat endpoint that validates input and calls the AI layer.

```ts
import { errorResponse } from "@/lib/api-errors";
import { errorBodySchema } from "@/lib/contracts";
import { generateChatResponse } from "@/lib/openai/chat";

export const runtime = "nodejs";
export const maxDuration = 60;

const SUPPORTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

function toDataUrl(file: File, bytes: Buffer) {
  return `data:${file.type};base64,${bytes.toString("base64")}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const question = formData.get("question");

    if (typeof question !== "string" || question.trim().length === 0) {
      return errorResponse(
        errorBodySchema.parse({
          code: "INVALID_REQUEST",
          message: "질문 내용을 입력해 주세요.",
          retryable: false,
        }),
        400,
      );
    }

    const image = formData.get("image");
    let imageDataUrl: string | undefined;

    if (image instanceof File && image.size > 0) {
      if (!SUPPORTED_IMAGE_TYPES.has(image.type)) {
        return errorResponse(
          errorBodySchema.parse({
            code: "UNSUPPORTED_FILE_TYPE",
            message: "PNG, JPG, WEBP 형식의 이미지만 업로드할 수 있습니다.",
            retryable: false,
          }),
          400,
        );
      }

      if (image.size > MAX_IMAGE_SIZE_BYTES) {
        return errorResponse(
          errorBodySchema.parse({
            code: "FILE_TOO_LARGE",
            message: "이미지 크기는 8MB 이하여야 합니다.",
            retryable: false,
          }),
          400,
        );
      }

      const bytes = Buffer.from(await image.arrayBuffer());
      imageDataUrl = toDataUrl(image, bytes);
    }

    const response = await generateChatResponse({
      question: question.trim(),
      imageDataUrl,
    });

    return Response.json(response);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "message" in error &&
      "retryable" in error
    ) {
      return errorResponse(errorBodySchema.parse(error), 503);
    }

    return errorResponse(
      errorBodySchema.parse({
        code: "UPSTREAM_OPENAI_ERROR",
        message: "OpenAI 응답 생성에 실패했습니다. API 키와 vector store 연결 상태를 확인해 주세요.",
        retryable: true,
      }),
      503,
    );
  }
}

```

## src/components/home-hero.tsx

Top hero section shown on the landing page.

```tsx
type HomeHeroProps = {
  appName: string;
  regionLabel: string;
};

export function HomeHero({ appName, regionLabel }: HomeHeroProps) {
  return (
    <section className="card-surface relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(29,107,67,0.18),transparent_70%)] lg:block" />
      <div className="absolute -left-10 top-8 h-32 w-32 rounded-full bg-emerald-200/30 blur-2xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-emerald-900/90 px-3 py-1 font-medium text-white">
              {regionLabel} 전용
            </span>
            <span className="rounded-full border border-[var(--border)] bg-white/65 px-3 py-1 text-[var(--muted)]">
              공식 근거 기반 답변
            </span>
            <span className="rounded-full border border-amber-600/20 bg-amber-100/80 px-3 py-1 text-amber-900">
              사진 질문 지원
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-18 w-18 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-emerald-700 via-emerald-600 to-amber-400 p-1 shadow-lg shadow-emerald-900/10">
              <div className="flex h-full w-full items-center justify-center rounded-[1.45rem] bg-white/90 text-center text-sm font-bold leading-tight text-[var(--primary-strong)]">
                천안
                <br />
                가이드
              </div>
            </div>

            <div className="space-y-1">
              <p className="section-title text-sm uppercase tracking-[0.24em] text-[var(--primary)]">
                {appName}
              </p>
              <p className="text-lg font-semibold text-[var(--foreground)] sm:text-xl">
                천안시 분리배출 가이드 AI
              </p>
            </div>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="section-title text-4xl leading-tight sm:text-5xl lg:text-6xl">
              천안시 공식 규정을 먼저 확인하는
              <br />
              분리배출 도우미
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              시민이 텍스트나 사진으로 질문하면 천안시 공식 배출 기준과 환경부 안내 자료를
              우선으로 확인해, 근거가 보이는 답변을 빠르게 제공합니다. 애매한 경우에는
              단정하지 않고 추가 질문으로 안전하게 이어갑니다.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.75rem] border border-emerald-900/10 bg-white/75 p-5">
            <p className="text-sm font-semibold text-[var(--primary)]">천안시 전용 안내</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              현재 서비스는 천안시 공식 배출 규정과 환경부 공공 안내 자료를 우선 기준으로
              답변합니다.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-amber-700/10 bg-amber-50/80 p-5">
            <p className="text-sm font-semibold text-amber-900">확장 준비</p>
            <p className="mt-2 text-sm leading-6 text-amber-950/85">
              준비 중인 지역: 아산시, 세종시 등
              <br />
              전국 지자체로 순차 확대할 수 있도록 구조를 설계하고 있습니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

```

## src/components/example-questions.tsx

Starter questions to help users understand what to ask.

```tsx
const EXAMPLES = [
  {
    title: "이 배달 용기 재활용 되나요?",
    hint: "사진과 함께 질문하기",
  },
  {
    title: "기름 묻은 플라스틱 반찬통은 어떻게 버리나요?",
    hint: "오염 여부 확인이 중요한 사례",
  },
  {
    title: "우유팩은 종이류로 버리면 되나요?",
    hint: "종이류와 종이팩 구분 질문",
  },
  {
    title: "폐의약품은 어디에 가져가야 하나요?",
    hint: "일반 쓰레기 금지 품목",
  },
];

export function ExampleQuestions() {
  return (
    <aside className="card-surface rounded-[2rem] p-6 sm:p-7">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="section-title text-2xl">예시 질문</p>
          <p className="text-sm leading-6 text-[var(--muted)]">
            가장 헷갈리기 쉬운 질문부터 모아 두었습니다. 첫 번째 예시는 사진 업로드와 함께
            시연하기 좋게 배치했습니다.
          </p>
        </div>

        <div className="space-y-3">
          {EXAMPLES.map((example, index) => (
            <div
              key={example.title}
              className="rounded-2xl border border-[var(--border)] bg-white/80 px-4 py-4"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {index === 0 ? (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                    추천
                  </span>
                ) : null}
                <span className="text-xs font-medium text-[var(--muted)]">{example.hint}</span>
              </div>
              <p className="text-sm leading-6 text-[var(--foreground)]">{example.title}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/80 p-4 text-sm leading-6 text-emerald-950">
          사진 업로드 기능을 먼저 보여주면 “내가 직접 찍은 물건도 물어볼 수 있다”는 점이
          바로 드러납니다. 발표 시연에서는 첫 번째 예시를 시작점으로 쓰기 좋습니다.
        </div>
      </div>
    </aside>
  );
}

```

## src/components/question-workspace.tsx

Question form, file upload logic, and request lifecycle UI.

```tsx
"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import {
  chatResponseSchema,
  errorEnvelopeSchema,
  type ChatResponse,
} from "@/lib/contracts";
import { AnswerCard } from "./answer-card";

type QuestionWorkspaceProps = {
  regionLabel: string;
};

type SubmittedImage = {
  fileName: string;
  url: string;
} | null;

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp";

function CameraIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M7 8.5 8.7 6h6.6L17 8.5h2.25A2.75 2.75 0 0 1 22 11.25v6A2.75 2.75 0 0 1 19.25 20h-14.5A2.75 2.75 0 0 1 2 17.25v-6A2.75 2.75 0 0 1 4.75 8.5H7Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="14" r="3.25" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function QuestionWorkspace({ regionLabel }: QuestionWorkspaceProps) {
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(null);
  const [submittedImage, setSubmittedImage] = useState<SubmittedImage>(null);
  const [answer, setAnswer] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (submittedImage?.url) {
        URL.revokeObjectURL(submittedImage.url);
      }
    };
  }, [submittedImage]);

  useEffect(() => {
    return () => {
      if (selectedPreviewUrl) {
        URL.revokeObjectURL(selectedPreviewUrl);
      }
    };
  }, [selectedPreviewUrl]);

  function replaceSubmittedImage(nextImage: SubmittedImage) {
    setSubmittedImage((currentImage) => {
      if (currentImage?.url) {
        URL.revokeObjectURL(currentImage.url);
      }

      return nextImage;
    });
  }

  function replaceSelectedPreview(nextPreviewUrl: string | null) {
    setSelectedPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }

      return nextPreviewUrl;
    });
  }

  function clearSelectedFile() {
    setFile(null);
    replaceSelectedPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    const nextSubmittedImage = file
      ? {
          fileName: file.name,
          url: URL.createObjectURL(file),
        }
      : null;

    startTransition(async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          body: formData,
        });

        const payload = await response.json();

        if (!response.ok) {
          const parsedError = errorEnvelopeSchema.safeParse(payload);

          if (nextSubmittedImage?.url) {
            URL.revokeObjectURL(nextSubmittedImage.url);
          }

          setAnswer(null);
          setError(
            parsedError.data?.error.message ??
              "요청을 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          );
          return;
        }

        const parsedAnswer = chatResponseSchema.safeParse(payload);

        if (!parsedAnswer.success) {
          if (nextSubmittedImage?.url) {
            URL.revokeObjectURL(nextSubmittedImage.url);
          }

          setAnswer(null);
          setError("응답 형식이 예상과 달라 결과를 표시할 수 없습니다.");
          return;
        }

        replaceSubmittedImage(nextSubmittedImage);
        setAnswer(parsedAnswer.data);
      } catch {
        if (nextSubmittedImage?.url) {
          URL.revokeObjectURL(nextSubmittedImage.url);
        }

        setAnswer(null);
        setError("네트워크 또는 서버 연결 문제로 답변을 가져오지 못했습니다. 다시 시도해 주세요.");
      }
    });
  }

  return (
    <section className="space-y-6">
      <form
        action={handleSubmit}
        className="card-surface rounded-[2rem] p-6 sm:p-7"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
              <span className="rounded-full bg-white px-3 py-1 text-[var(--primary)] ring-1 ring-[var(--border)]">
                현재 안내 지역
              </span>
              <span className="rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1 font-medium text-emerald-950">
                {regionLabel}
              </span>
            </div>
            <h2 className="section-title text-2xl">천안시 기준으로 바로 물어보세요</h2>
            <p className="text-sm leading-6 text-[var(--muted)]">
              텍스트만 입력해도 되고, 헷갈리는 품목은 사진을 함께 올리면 더 빠르게 확인할 수
              있습니다.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-emerald-900/10 bg-emerald-50/80 p-4">
            <p className="text-sm font-semibold text-emerald-950">천안시 전용 안내</p>
            <p className="mt-2 text-sm leading-6 text-emerald-950/85">
              현재 EcoGuide AI는 천안시 공식 배출 규정과 환경부 안내 자료를 우선 기준으로
              답변합니다.
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-emerald-900/70">
              준비 중인 지역: 아산시, 세종시 등
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium" htmlFor="question">
              분리배출 질문
            </label>
            <textarea
              id="question"
              name="question"
              required
              rows={5}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="예: 기름이 묻은 플라스틱 배달 용기인데 어떻게 버려야 하나요?"
              className="min-h-[10rem] w-full rounded-[1.5rem] border border-[var(--border)] bg-white/90 px-4 py-4 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-sm font-medium" htmlFor={fileInputId}>
                사진 업로드
              </label>
              <span className="text-xs text-[var(--muted)]">선택사항 · PNG/JPG/WEBP · 최대 8MB</span>
            </div>

            <label
              className="group block cursor-pointer rounded-[1.75rem] border-2 border-dashed border-emerald-800/20 bg-white/85 p-5 transition hover:border-emerald-700/35 hover:bg-white"
              htmlFor={fileInputId}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-emerald-900 text-white shadow-lg shadow-emerald-900/10 transition group-hover:scale-[1.02]">
                  <CameraIcon />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-[var(--foreground)]">
                    글로 쓰기 어렵다면? 사진을 찍어보세요!
                  </p>
                  <p className="text-sm leading-6 text-[var(--muted)]">
                    배달 용기, 플라스틱, 캔, 종이팩처럼 헷갈리는 품목을 사진과 함께 보내면
                    이미지도 참고해서 답변합니다.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-950 ring-1 ring-emerald-900/10">
                  카메라 아이콘을 눌러 사진 선택
                </span>
                <span className="text-[var(--muted)]">
                  사진과 질문을 함께 보내면 결과 카드에서 분석한 품목도 확인할 수 있습니다.
                </span>
              </div>
            </label>

            <input
              ref={fileInputRef}
              id={fileInputId}
              name="image"
              type="file"
              accept={IMAGE_ACCEPT}
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setFile(nextFile);
                replaceSelectedPreview(nextFile ? URL.createObjectURL(nextFile) : null);
                setError(null);
              }}
              className="sr-only"
            />

            {file ? (
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/85 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {selectedPreviewUrl ? (
                    <div className="relative h-28 w-full overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface-strong)] sm:w-40">
                      <Image
                        fill
                        alt="업로드 예정인 질문 이미지"
                        className="object-cover"
                        sizes="160px"
                        src={selectedPreviewUrl}
                        unoptimized
                      />
                    </div>
                  ) : null}

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--foreground)]">선택한 사진</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">{file.name}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)]"
                  >
                    사진 제거
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <input name="region" type="hidden" value="cheonan-si" />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "공식 자료를 확인하는 중..." : "공식 근거와 함께 답변 받기"}
            </button>
            <button
              type="button"
              onClick={() => {
                setQuestion("이 배달 용기 재활용 되나요? 사진과 함께 확인하고 싶어요.");
                clearSelectedFile();
                replaceSubmittedImage(null);
                setAnswer(null);
                setError(null);
              }}
              className="rounded-full border border-[var(--border)] bg-white/70 px-5 py-3 text-sm font-medium text-[var(--foreground)]"
            >
              예시 질문 넣기
            </button>
          </div>
        </div>
      </form>

      {error ? (
        <div className="rounded-[1.75rem] border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-[var(--danger)]">
          {error}
        </div>
      ) : null}

      <AnswerCard
        answer={answer}
        isLoading={isPending}
        previewImageUrl={submittedImage?.url ?? null}
        uploadedFileName={submittedImage?.fileName ?? null}
      />
    </section>
  );
}

```

## src/components/answer-card.tsx

Structured answer renderer for decision, reason, and prep steps.

```tsx
import Image from "next/image";
import type { ChatResponse } from "@/lib/contracts";
import { CitationList } from "./citation-list";

type AnswerCardProps = {
  answer: ChatResponse | null;
  isLoading: boolean;
  previewImageUrl?: string | null;
  uploadedFileName?: string | null;
};

type AnalysisPreviewProps = {
  previewImageUrl?: string | null;
  uploadedFileName?: string | null;
  identifiedItem?: string | null;
  isLoading?: boolean;
};

function EmptyState() {
  return (
    <div className="card-surface rounded-[2rem] p-6 sm:p-7">
      <div className="space-y-3">
        <p className="section-title text-2xl">답변 대기 중</p>
        <p className="text-sm leading-6 text-[var(--muted)]">
          질문을 보내면 배출 결론, 이유, 준비 단계, 공식 출처를 한 번에 정리해 드립니다.
          사진을 함께 올리면 분석한 품목도 같이 보여줍니다.
        </p>
      </div>
    </div>
  );
}

function AnalysisPreview({
  previewImageUrl,
  uploadedFileName,
  identifiedItem,
  isLoading = false,
}: AnalysisPreviewProps) {
  if (!previewImageUrl) {
    return null;
  }

  return (
    <div className="grid gap-4 rounded-[1.5rem] border border-[var(--border)] bg-white/80 p-5 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-950">
            사용자 사진
          </span>
          {uploadedFileName ? (
            <span className="text-xs text-[var(--muted)]">{uploadedFileName}</span>
          ) : null}
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface-strong)]">
          <Image
            fill
            alt="사용자가 업로드한 분리배출 질문 이미지"
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 40vw"
            src={previewImageUrl}
            unoptimized
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-[var(--primary)]">AI가 파악한 품목</p>
        <div className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface-strong)] p-4">
          <p className="text-lg font-semibold text-[var(--foreground)]">
            {identifiedItem ??
              (isLoading ? "사진을 분석하고 있습니다." : "사진만으로는 품목을 명확히 특정하지 못했습니다.")}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            사진 분석은 보조 단서입니다. 최종 결론은 천안시 공식 근거와 함께 안내합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingState({ previewImageUrl, uploadedFileName }: AnalysisPreviewProps) {
  return (
    <div className="card-surface rounded-[2rem] p-6 sm:p-7">
      <div className="space-y-4">
        <AnalysisPreview
          isLoading
          previewImageUrl={previewImageUrl}
          uploadedFileName={uploadedFileName}
        />
        <p className="section-title text-2xl">공식 자료를 확인하며 답변을 만들고 있습니다</p>
        <div className="h-3 w-full rounded-full bg-emerald-100">
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-emerald-600" />
        </div>
        <p className="text-sm leading-6 text-[var(--muted)]">
          업로드한 질문과 사진을 바탕으로 천안시 관련 공식 자료를 찾고 있습니다. 잠시만
          기다려 주세요.
        </p>
      </div>
    </div>
  );
}

export function AnswerCard({
  answer,
  isLoading,
  previewImageUrl,
  uploadedFileName,
}: AnswerCardProps) {
  if (isLoading) {
    return (
      <LoadingState
        previewImageUrl={previewImageUrl}
        uploadedFileName={uploadedFileName}
      />
    );
  }

  if (!answer) {
    return <EmptyState />;
  }

  return (
    <section className="card-surface rounded-[2rem] p-6 sm:p-7">
      <div className="space-y-6">
        <AnalysisPreview
          identifiedItem={answer.identified_item}
          previewImageUrl={previewImageUrl}
          uploadedFileName={uploadedFileName}
        />

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-900 px-3 py-1 text-xs font-semibold text-white">
              배출 결론
            </span>
            {answer.needs_clarification ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                추가 확인 필요
              </span>
            ) : null}
          </div>
          <h3 className="section-title text-3xl leading-tight">{answer.decision}</h3>
          <p className="text-base leading-7 text-[var(--muted)]">{answer.reason}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/80 p-5">
            <p className="mb-3 text-sm font-semibold text-[var(--primary)]">세척·분리 팁</p>
            {answer.prep_steps.length > 0 ? (
              <ol className="space-y-2 text-sm leading-6">
                {answer.prep_steps.map((step, index) => (
                  <li key={`${step}-${index}`} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-950">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm leading-6 text-[var(--muted)]">
                추가로 준비할 단계가 확인되지 않았습니다. 품목의 재질이나 오염 정도를 더
                알려 주면 더 구체적으로 안내할 수 있습니다.
              </p>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/80 p-5">
            <p className="mb-3 text-sm font-semibold text-[var(--primary)]">
              불확실할 때 묻는 질문
            </p>
            <p className="text-sm leading-6 text-[var(--foreground)]">
              {answer.follow_up_question ??
                "현재 정보만으로도 답변을 진행할 수 있어 추가 질문은 필요하지 않습니다."}
            </p>
          </div>
        </div>

        <CitationList citations={answer.citations} />
      </div>
    </section>
  );
}

```

## src/components/citation-list.tsx

Citation rendering component for official sources.

```tsx
import type { Citation } from "@/lib/contracts";

type CitationListProps = {
  citations: Citation[];
};

export function CitationList({ citations }: CitationListProps) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/80 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-[var(--primary)]">출처</p>
        <span className="text-xs text-[var(--muted)]">{citations.length}건</span>
      </div>

      {citations.length > 0 ? (
        <div className="space-y-3">
          {citations.map((citation, index) => (
            <article
              key={`${citation.source_id}-${index}`}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-4"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-950">
                  {citation.authority}
                </span>
                <span>{citation.source_id}</span>
                {citation.page_hint ? <span>{citation.page_hint}</span> : null}
              </div>

              <h4 className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                {citation.title}
              </h4>

              {citation.excerpt ? (
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {citation.excerpt}
                </p>
              ) : null}

              {citation.url ? (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-sm font-medium text-[var(--primary)] underline underline-offset-4"
                >
                  공식 페이지 보기
                </a>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-6 text-[var(--muted)]">
          현재 답변에 연결된 공식 출처가 없습니다. 애매한 품목이라면 재질이나 오염 정도를
          조금 더 알려 주면 근거를 찾는 데 도움이 됩니다.
        </p>
      )}
    </div>
  );
}

```

## src/lib/api-errors.ts

Helpers for returning stable JSON error responses.

```ts
import { NextResponse } from "next/server";
import type { ErrorBody } from "./contracts";

export function errorResponse(
  error: ErrorBody,
  status: number,
): NextResponse<{ error: ErrorBody }> {
  return NextResponse.json({ error }, { status });
}

```

## src/lib/config.ts

Environment variable loading and public/server config access.

```ts
import { z } from "zod";

const optionalNonEmptyString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().trim().min(1).optional());

const sharedConfigSchema = z.object({
  APP_REGION_CODE: z.string().trim().min(1).default("cheonan-si"),
  APP_REGION_NAME: z.string().trim().min(1).default("천안시"),
  NEXT_PUBLIC_APP_NAME: z.string().trim().min(1).default("EcoGuide AI"),
  NEXT_PUBLIC_APP_REGION_LABEL: z.string().trim().min(1).default("천안시"),
});

const serverOnlyConfigSchema = z.object({
  OPENAI_API_KEY: optionalNonEmptyString,
  OPENAI_MODEL: z.string().trim().min(1).default("gpt-5.4"),
  OPENAI_FALLBACK_MODEL: z.string().trim().min(1).default("gpt-5-mini"),
  OPENAI_VECTOR_STORE_ID: optionalNonEmptyString,
  OPENAI_FILE_SEARCH_MAX_RESULTS: z.coerce.number().int().positive().default(6),
});

const serverConfigSchema = sharedConfigSchema.extend(
  serverOnlyConfigSchema.shape,
);
const publicConfigSchema = sharedConfigSchema;

export type ServerConfig = z.infer<typeof serverConfigSchema>;

let cachedConfig: ServerConfig | null = null;
let cachedPublicConfig: z.infer<typeof publicConfigSchema> | null = null;

export function getServerConfig(): ServerConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  cachedConfig = serverConfigSchema.parse(process.env);
  return cachedConfig;
}

export function getPublicAppConfig() {
  if (cachedPublicConfig) {
    return {
      appName: cachedPublicConfig.NEXT_PUBLIC_APP_NAME,
      regionLabel: cachedPublicConfig.NEXT_PUBLIC_APP_REGION_LABEL,
    };
  }

  cachedPublicConfig = publicConfigSchema.parse(process.env);

  return {
    appName: cachedPublicConfig.NEXT_PUBLIC_APP_NAME,
    regionLabel: cachedPublicConfig.NEXT_PUBLIC_APP_REGION_LABEL,
  };
}

export function getRuntimeReadiness() {
  const config = getServerConfig();

  return {
    service: config.NEXT_PUBLIC_APP_NAME,
    region: config.APP_REGION_CODE,
    checks: {
      openai_api_key: Boolean(config.OPENAI_API_KEY),
      vector_store_id: Boolean(config.OPENAI_VECTOR_STORE_ID),
    },
  };
}

```

## src/lib/contracts.ts

Shared Zod schemas and TypeScript types for API contracts.

```ts
import { z } from "zod";

export const citationSchema = z.object({
  source_id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  authority: z.string().trim().min(1),
  url: z.union([z.string().trim().min(1), z.null()]),
  page_hint: z.union([z.string().trim(), z.null()]),
  excerpt: z.union([z.string().trim(), z.null()]),
});

export const chatResponseSchema = z.object({
  decision: z.string().trim().min(1),
  reason: z.string().trim().min(1),
  prep_steps: z.array(z.string().trim().min(1)).default([]),
  citations: z.array(citationSchema).default([]),
  needs_clarification: z.boolean(),
  follow_up_question: z.union([z.string().trim(), z.null()]),
  identified_item: z.union([z.string().trim(), z.null()]).default(null),
  request_id: z.string().trim().min(1),
});

export const errorBodySchema = z.object({
  code: z.enum([
    "INVALID_REQUEST",
    "UNSUPPORTED_FILE_TYPE",
    "FILE_TOO_LARGE",
    "OPENAI_API_KEY_MISSING",
    "VECTOR_STORE_NOT_CONFIGURED",
    "UPSTREAM_OPENAI_ERROR",
    "INTERNAL_SERVER_ERROR",
  ]),
  message: z.string().trim().min(1),
  retryable: z.boolean(),
});

export const errorEnvelopeSchema = z.object({
  error: errorBodySchema,
});

export const healthResponseSchema = z.object({
  service: z.string().trim().min(1),
  status: z.enum(["ok", "degraded"]),
  region: z.string().trim().min(1),
  checks: z.object({
    openai_api_key: z.boolean(),
    vector_store_id: z.boolean(),
  }),
});

export type Citation = z.infer<typeof citationSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type ErrorBody = z.infer<typeof errorBodySchema>;

```

## src/lib/source-catalog.ts

Source catalog loader and authoritative source helpers.

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { z } from "zod";

const sourceCatalogSchema = z.object({
  authoritative_source_ids: z.array(z.string()),
  sources: z.array(
    z.object({
      id: z.string(),
      authority: z.string(),
      title: z.string(),
      region: z.string(),
      doc_type: z.string(),
      local_path: z.union([z.string(), z.null()]),
      remote_url: z.union([z.url(), z.null()]),
      published_at: z.union([z.string(), z.null()]).optional(),
      last_checked_at: z.union([z.string(), z.null()]).optional(),
      usage: z.string(),
      notes: z.string(),
    }),
  ),
});

export type SourceCatalog = z.infer<typeof sourceCatalogSchema>;
export type SourceRecord = SourceCatalog["sources"][number];

let cachedCatalog: SourceCatalog | null = null;

export function getSourceCatalog(): SourceCatalog {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  const filePath = join(process.cwd(), "data", "catalog", "source_catalog.yaml");
  const raw = readFileSync(filePath, "utf8");
  cachedCatalog = sourceCatalogSchema.parse(parse(raw));
  return cachedCatalog;
}

export function getAuthoritativeSources() {
  const catalog = getSourceCatalog();
  const authoritativeIds = new Set(catalog.authoritative_source_ids);
  return catalog.sources.filter((source) => authoritativeIds.has(source.id));
}

export function getAuthoritativeSourceMap() {
  return new Map(getAuthoritativeSources().map((source) => [source.id, source]));
}

```

## src/lib/openai/client.ts

OpenAI client creation and reuse.

```ts
import OpenAI from "openai";
import { getServerConfig } from "../config";

let cachedClient: OpenAI | null = null;

export function getOpenAIClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const config = getServerConfig();

  if (!config.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY_MISSING");
  }

  cachedClient = new OpenAI({
    apiKey: config.OPENAI_API_KEY,
  });

  return cachedClient;
}

```

## src/lib/openai/prompt.ts

System and user prompt construction logic.

```ts
import type { SourceRecord } from "../source-catalog";

export function buildSystemPrompt(sources: SourceRecord[]) {
  const sourceList = sources
    .map(
      (source) =>
        `- ${source.id} | authority=${source.authority} | title=${source.title} | url=${source.remote_url ?? "null"}`,
    )
    .join("\n");

  return `You are EcoGuide AI, a Korean waste-disposal assistant for Cheonan residents.

Your job:
- Answer only in Korean.
- Help users decide how to dispose of household waste.
- Prefer Cheonan-specific rules over general national guidance when they conflict.
- Use official source material retrieved through file search and the source catalog below.
- Do not invent disposal rules.

Required response behavior:
- If you can determine a safe disposal action, provide one clear decision.
- Include a brief reason.
- Include short preparation steps if relevant.
- Include at least one citation whenever you provide a final disposal answer.
- If the evidence is insufficient or the disposal path depends on unknown material, contamination, or item type, set needs_clarification=true and ask one concise follow-up question.
- If needs_clarification=true, citations may be empty when no official passage safely supports a final answer.
- Always include identified_item.
- If an image is attached and you can infer the likely visible item or material, set identified_item to a short Korean noun phrase such as "플라스틱 배달용기".
- If there is no image or the image is too ambiguous, set identified_item=null.
- identified_item is supplemental UI feedback, not a replacement for grounded citations.

Citation rules:
- Use only source IDs from this list.
- Prefer source IDs that match the cited authority.
- Keep excerpts short.
- Do not fabricate page numbers.

Known source catalog:
${sourceList}`;
}

export function buildUserPrompt(question: string, regionName: string) {
  return [
    `활성 지역: ${regionName}`,
    `사용자 질문: ${question}`,
    "이미지가 함께 첨부되면 보조 단서로 활용하고, 식별 가능한 경우에만 identified_item에 짧은 한국어 품목명을 넣어 주세요.",
  ].join("\n");
}

```

## src/lib/openai/response-schema.ts

Model response schema for structured output parsing.

```ts
import { z } from "zod";
import { chatResponseSchema } from "../contracts";

export const modelChatResponseSchema = chatResponseSchema.omit({
  request_id: true,
});

export type ModelChatResponse = z.infer<typeof modelChatResponseSchema>;

```

## src/lib/openai/chat.ts

Core OpenAI call flow, retrieval handling, and citation normalization.

```ts
import { randomUUID } from "node:crypto";
import { zodTextFormat } from "openai/helpers/zod";
import type {
  ResponseFileSearchToolCall,
  ResponseInput,
} from "openai/resources/responses/responses";
import { errorBodySchema, type ChatResponse } from "../contracts";
import { getServerConfig } from "../config";
import {
  getAuthoritativeSourceMap,
  getAuthoritativeSources,
  type SourceRecord,
} from "../source-catalog";
import { getOpenAIClient } from "./client";
import { buildSystemPrompt, buildUserPrompt } from "./prompt";
import { modelChatResponseSchema } from "./response-schema";

type ChatInput = {
  question: string;
  imageDataUrl?: string;
};

type RetrievedSourceMatch = {
  excerpt: string | null;
  file_id: string | null;
  filename: string | null;
  score: number | null;
};

function normalizeOptionalString(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function collectRetrievedSourceMatches(
  output: ReadonlyArray<{
    type: string;
    results?: Array<ResponseFileSearchToolCall.Result> | null;
  }>,
  authoritativeSourceMap: Map<string, SourceRecord>,
) {
  const matches = new Map<string, RetrievedSourceMatch[]>();

  for (const item of output) {
    if (item.type !== "file_search_call" || !item.results) {
      continue;
    }

    for (const result of item.results) {
      const sourceId = result.attributes?.source_id;

      if (typeof sourceId !== "string" || !authoritativeSourceMap.has(sourceId)) {
        continue;
      }

      const currentMatches = matches.get(sourceId) ?? [];
      currentMatches.push({
        excerpt: normalizeOptionalString(result.text),
        file_id: result.file_id ?? null,
        filename: result.filename ?? null,
        score: typeof result.score === "number" ? result.score : null,
      });
      matches.set(sourceId, currentMatches);
    }
  }

  return matches;
}

function normalizeCitations(
  citations: ChatResponse["citations"],
  retrievedSourceMatches: Map<string, RetrievedSourceMatch[]>,
  authoritativeSourceMap: Map<string, SourceRecord>,
) {
  const normalizedCitations: ChatResponse["citations"] = [];
  const seen = new Set<string>();

  for (const citation of citations) {
    const source = authoritativeSourceMap.get(citation.source_id);
    const retrievedMatches = retrievedSourceMatches.get(citation.source_id);

    if (!source || !retrievedMatches || retrievedMatches.length === 0) {
      continue;
    }

    const pageHint = normalizeOptionalString(citation.page_hint);
    const excerpt =
      normalizeOptionalString(citation.excerpt) ?? retrievedMatches[0]?.excerpt ?? null;
    const dedupeKey = `${citation.source_id}:${pageHint ?? ""}`;

    if (seen.has(dedupeKey)) {
      continue;
    }

    normalizedCitations.push({
      source_id: source.id,
      title: source.title,
      authority: source.authority,
      url: source.remote_url,
      page_hint: pageHint,
      excerpt,
    });
    seen.add(dedupeKey);
  }

  if (normalizedCitations.length > 0) {
    return normalizedCitations;
  }

  for (const [sourceId, retrievedMatches] of retrievedSourceMatches) {
    const source = authoritativeSourceMap.get(sourceId);

    if (!source || seen.has(sourceId)) {
      continue;
    }

    normalizedCitations.push({
      source_id: source.id,
      title: source.title,
      authority: source.authority,
      url: source.remote_url,
      page_hint: null,
      excerpt: retrievedMatches[0]?.excerpt ?? null,
    });
    seen.add(sourceId);
  }

  return normalizedCitations;
}

export async function generateChatResponse({
  question,
  imageDataUrl,
}: ChatInput): Promise<ChatResponse> {
  const config = getServerConfig();

  if (!config.OPENAI_API_KEY) {
    throw errorBodySchema.parse({
      code: "OPENAI_API_KEY_MISSING",
      message: "OPENAI_API_KEY is not configured.",
      retryable: false,
    });
  }

  if (!config.OPENAI_VECTOR_STORE_ID) {
    throw errorBodySchema.parse({
      code: "VECTOR_STORE_NOT_CONFIGURED",
      message: "OPENAI_VECTOR_STORE_ID is not configured.",
      retryable: false,
    });
  }

  const client = getOpenAIClient();
  const sources = getAuthoritativeSources();
  const authoritativeSourceMap = getAuthoritativeSourceMap();
  const input: ResponseInput = [
    {
      type: "message",
      role: "developer",
      content: [
        {
          type: "input_text",
          text: buildSystemPrompt(sources),
        },
      ],
    },
    {
      type: "message",
      role: "user",
      content: [
        {
          type: "input_text",
          text: buildUserPrompt(question, config.APP_REGION_NAME),
        },
        ...(imageDataUrl
          ? [
              {
                type: "input_image" as const,
                image_url: imageDataUrl,
                detail: "auto" as const,
              },
            ]
          : []),
      ],
    },
  ];

  const response = await client.responses.parse({
    model: config.OPENAI_MODEL,
    input,
    tools: [
      {
        type: "file_search",
        vector_store_ids: [config.OPENAI_VECTOR_STORE_ID],
        max_num_results: config.OPENAI_FILE_SEARCH_MAX_RESULTS,
      },
    ],
    include: ["file_search_call.results"],
    text: {
      format: zodTextFormat(modelChatResponseSchema, "eco_guide_response"),
    },
  });

  const parsed = modelChatResponseSchema.parse(response.output_parsed);
  const retrievedSourceMatches = collectRetrievedSourceMatches(
    response.output,
    authoritativeSourceMap,
  );

  return {
    ...parsed,
    citations: normalizeCitations(
      parsed.citations,
      retrievedSourceMatches,
      authoritativeSourceMap,
    ),
    request_id: response.id ?? randomUUID(),
  };
}

```

## scripts/ingest-docs.ts

Official source ingestion and vector store synchronization script.

```ts
import { loadEnvConfig } from "@next/env";
import { createReadStream, existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import OpenAI, { toFile } from "openai";
import { getSourceCatalog, type SourceRecord } from "../src/lib/source-catalog";

loadEnvConfig(process.cwd());

type CliOptions = {
  dryRun: boolean;
  reindex: boolean;
  sourceId?: string;
  vectorStoreId?: string;
};

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    dryRun: false,
    reindex: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--reindex") {
      options.reindex = true;
      continue;
    }

    if (arg === "--source-id") {
      options.sourceId = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--vector-store-id") {
      options.vectorStoreId = argv[index + 1];
      index += 1;
    }
  }

  return options;
}

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required.");
  }

  return new OpenAI({ apiKey });
}

function getVectorStoreId(cliVectorStoreId?: string) {
  return cliVectorStoreId ?? process.env.OPENAI_VECTOR_STORE_ID ?? "";
}

function sourceAttributes(source: SourceRecord) {
  return {
    source_id: source.id,
    authority: source.authority,
    region: source.region,
    doc_type: source.doc_type,
  };
}

type ExistingVectorStoreFile = {
  id: string;
  status: string;
  last_error: string | null;
};

function getSourceIdAttribute(
  attributes?: Record<string, string | number | boolean> | null,
) {
  const sourceId = attributes?.source_id;
  return typeof sourceId === "string" && sourceId.length > 0 ? sourceId : null;
}

async function listExistingVectorStoreFiles(client: OpenAI, vectorStoreId: string) {
  const existingFilesBySource = new Map<string, ExistingVectorStoreFile[]>();

  for await (const file of client.vectorStores.files.list(vectorStoreId, {
    limit: 100,
    order: "desc",
  })) {
    const sourceId = getSourceIdAttribute(file.attributes);

    if (!sourceId) {
      continue;
    }

    const existingFiles = existingFilesBySource.get(sourceId) ?? [];
    existingFiles.push({
      id: file.id,
      status: file.status,
      last_error: file.last_error?.message ?? null,
    });
    existingFilesBySource.set(sourceId, existingFiles);
  }

  return existingFilesBySource;
}

function hasReusableExistingFile(existingFiles: ExistingVectorStoreFile[]) {
  return existingFiles.some((file) => {
    return file.status === "completed" || file.status === "in_progress";
  });
}

async function deleteExistingVectorStoreFiles(
  client: OpenAI,
  vectorStoreId: string,
  existingFiles: ExistingVectorStoreFile[],
) {
  for (const file of existingFiles) {
    await client.vectorStores.files.delete(file.id, {
      vector_store_id: vectorStoreId,
    });
  }
}

async function convertWebpageToTextFile(source: SourceRecord) {
  if (!source.remote_url) {
    throw new Error(`Source ${source.id} does not have a remote_url.`);
  }

  const response = await fetch(source.remote_url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.remote_url}: ${response.status}`);
  }

  const html = await response.text();
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

  const tempDir = await mkdtemp(join(tmpdir(), "eco-guide-"));
  const tempPath = join(tempDir, `${source.id}.txt`);
  const content = `Title: ${source.title}
Authority: ${source.authority}
Source ID: ${source.id}
Source URL: ${source.remote_url}

${stripped}
`;

  await writeFile(tempPath, content, "utf8");

  return {
    path: tempPath,
    cleanup: async () => rm(tempDir, { force: true, recursive: true }),
  };
}

async function resolveUploadableFile(source: SourceRecord) {
  if (source.local_path) {
    const fullPath = resolve(process.cwd(), source.local_path);

    if (!existsSync(fullPath)) {
      throw new Error(`Local path does not exist: ${source.local_path}`);
    }

    return {
      file: createReadStream(fullPath),
      fileName: basename(fullPath),
      cleanup: async () => {},
    };
  }

  const webpageFile = await convertWebpageToTextFile(source);

  return {
    file: await toFile(await readFile(webpageFile.path), basename(webpageFile.path)),
    fileName: basename(webpageFile.path),
    cleanup: webpageFile.cleanup,
  };
}

async function uploadSource(
  client: OpenAI,
  vectorStoreId: string,
  source: SourceRecord,
) {
  const resolvedFile = await resolveUploadableFile(source);

  try {
    const fileRecord = await client.files.create({
      file: resolvedFile.file,
      purpose: "user_data",
    });

    const vectorStoreFile = await client.vectorStores.files.createAndPoll(
      vectorStoreId,
      {
        file_id: fileRecord.id,
        attributes: sourceAttributes(source),
      },
    );

    return {
      source_id: source.id,
      file_id: fileRecord.id,
      vector_store_file_id: vectorStoreFile.id,
      status: vectorStoreFile.status,
      filename: resolvedFile.fileName,
    };
  } finally {
    await resolvedFile.cleanup();
  }
}

async function ingestSource(
  client: OpenAI,
  vectorStoreId: string,
  source: SourceRecord,
  existingFilesBySource: Map<string, ExistingVectorStoreFile[]>,
  reindex: boolean,
) {
  const existingFiles = existingFilesBySource.get(source.id) ?? [];

  if (existingFiles.length > 0 && reindex) {
    console.log(`Reindexing ${source.id} by replacing existing vector store files...`);
    await deleteExistingVectorStoreFiles(client, vectorStoreId, existingFiles);
  } else if (existingFiles.length > 0 && hasReusableExistingFile(existingFiles)) {
    return {
      source_id: source.id,
      status: "skipped_existing",
      vector_store_file_ids: existingFiles.map((file) => file.id),
      existing_statuses: existingFiles.map((file) => file.status),
      last_errors: existingFiles
        .map((file) => file.last_error)
        .filter((value): value is string => value !== null),
    };
  } else if (existingFiles.length > 0) {
    console.log(`Cleaning failed or cancelled files for ${source.id} before retrying...`);
    await deleteExistingVectorStoreFiles(client, vectorStoreId, existingFiles);
  }

  console.log(`Uploading ${source.id}...`);
  return uploadSource(client, vectorStoreId, source);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const catalog = getSourceCatalog();

  const sources = catalog.sources.filter((source) => {
    if (source.usage !== "authoritative_domain_source") {
      return false;
    }

    if (options.sourceId) {
      return source.id === options.sourceId;
    }

    return true;
  });

  if (sources.length === 0) {
    throw new Error("No matching authoritative sources found.");
  }

  const vectorStoreId = getVectorStoreId(options.vectorStoreId);

  if (!options.dryRun && !vectorStoreId) {
    throw new Error(
      "OPENAI_VECTOR_STORE_ID or --vector-store-id is required unless --dry-run is used.",
    );
  }

  if (options.dryRun) {
    console.log(
      JSON.stringify(
        {
          dry_run: true,
          vector_store_id: vectorStoreId || null,
          sources: sources.map((source) => ({
            id: source.id,
            title: source.title,
            authority: source.authority,
            local_path: source.local_path,
            remote_url: source.remote_url,
            attributes: sourceAttributes(source),
          })),
        },
        null,
        2,
      ),
    );
    return;
  }

  const client = getClient();
  const existingFilesBySource = await listExistingVectorStoreFiles(client, vectorStoreId);
  const results = [];

  for (const source of sources) {
    const result = await ingestSource(
      client,
      vectorStoreId,
      source,
      existingFilesBySource,
      options.reindex,
    );
    results.push(result);
  }

  console.log(
    JSON.stringify(
      {
        dry_run: false,
        reindex: options.reindex,
        vector_store_id: vectorStoreId,
        results,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        error: error instanceof Error ? error.message : "Unknown ingestion error",
      },
      null,
      2,
    ),
  );
  process.exit(1);
});

```
