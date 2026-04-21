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
