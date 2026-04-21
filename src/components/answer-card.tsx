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
