"use client";

import { useId, useState, useTransition } from "react";
import {
  chatResponseSchema,
  errorEnvelopeSchema,
  type ChatResponse,
} from "@/lib/contracts";
import { AnswerCard } from "./answer-card";

type QuestionWorkspaceProps = {
  regionLabel: string;
};

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp";

export function QuestionWorkspace({ regionLabel }: QuestionWorkspaceProps) {
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [answer, setAnswer] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputId = useId();

  async function handleSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          body: formData,
        });

        const payload = await response.json();

        if (!response.ok) {
          const parsedError = errorEnvelopeSchema.safeParse(payload);
          setAnswer(null);
          setError(
            parsedError.data?.error.message ??
              "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
          );
          return;
        }

        const parsedAnswer = chatResponseSchema.safeParse(payload);

        if (!parsedAnswer.success) {
          setAnswer(null);
          setError("응답 형식이 예상과 달라서 결과를 표시하지 못했습니다.");
          return;
        }

        setAnswer(parsedAnswer.data);
      } catch {
        setAnswer(null);
        setError("네트워크 오류가 발생했습니다. 연결 상태를 확인해 주세요.");
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
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
              <span className="rounded-full bg-white px-3 py-1 text-[var(--primary)] ring-1 ring-[var(--border)]">
                현재 지역
              </span>
              <span>{regionLabel}</span>
            </div>
            <h2 className="section-title text-2xl">질문 입력</h2>
            <p className="text-sm leading-6 text-[var(--muted)]">
              분리배출 방법이 궁금한 물건을 자연스럽게 설명해 주세요. 사진이
              있으면 함께 올릴 수 있습니다.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium" htmlFor="question">
              질문
            </label>
            <textarea
              id="question"
              name="question"
              required
              rows={5}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="예: 기름이 묻은 플라스틱 배달용기는 어떻게 버리나요?"
              className="min-h-[10rem] w-full rounded-[1.5rem] border border-[var(--border)] bg-white/90 px-4 py-4 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium" htmlFor={fileInputId}>
              이미지 업로드
            </label>
            <input
              id={fileInputId}
              name="image"
              type="file"
              accept={IMAGE_ACCEPT}
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setFile(nextFile);
              }}
              className="block w-full rounded-[1.25rem] border border-dashed border-[var(--border)] bg-white/75 px-4 py-3 text-sm"
            />
            <p className="text-sm leading-6 text-[var(--muted)]">
              지원 형식: PNG, JPG, WEBP
              {file ? ` · 선택됨: ${file.name}` : ""}
            </p>
          </div>

          <input name="region" type="hidden" value="cheonan-si" />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "답변 생성 중..." : "공식 근거로 답변 받기"}
            </button>
            <button
              type="button"
              onClick={() => {
                setQuestion("집에 남은 감기약은 어디에 버리나요?");
                setFile(null);
                setAnswer(null);
                setError(null);
              }}
              className="rounded-full border border-[var(--border)] bg-white/70 px-5 py-3 text-sm font-medium text-[var(--foreground)]"
            >
              예시 질문 채우기
            </button>
          </div>
        </div>
      </form>

      {error ? (
        <div className="rounded-[1.75rem] border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-[var(--danger)]">
          {error}
        </div>
      ) : null}

      <AnswerCard answer={answer} isLoading={isPending} />
    </section>
  );
}
