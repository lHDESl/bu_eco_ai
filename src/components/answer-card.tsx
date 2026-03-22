import type { ChatResponse } from "@/lib/contracts";
import { CitationList } from "./citation-list";

type AnswerCardProps = {
  answer: ChatResponse | null;
  isLoading: boolean;
};

function EmptyState() {
  return (
    <div className="card-surface rounded-[2rem] p-6 sm:p-7">
      <div className="space-y-3">
        <p className="section-title text-2xl">응답 영역</p>
        <p className="text-sm leading-6 text-[var(--muted)]">
          질문을 보내면 이곳에 배출 결론, 이유, 준비 단계, 공식 출처가
          표시됩니다.
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="card-surface rounded-[2rem] p-6 sm:p-7">
      <div className="space-y-3">
        <p className="section-title text-2xl">공식 근거를 찾는 중입니다</p>
        <div className="h-3 w-full rounded-full bg-emerald-100">
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-emerald-600" />
        </div>
        <p className="text-sm leading-6 text-[var(--muted)]">
          천안시 및 환경부 자료를 기준으로 답변을 정리하고 있습니다.
        </p>
      </div>
    </div>
  );
}

export function AnswerCard({ answer, isLoading }: AnswerCardProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!answer) {
    return <EmptyState />;
  }

  return (
    <section className="card-surface rounded-[2rem] p-6 sm:p-7">
      <div className="space-y-6">
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
          <h3 className="section-title text-3xl leading-tight">
            {answer.decision}
          </h3>
          <p className="text-base leading-7 text-[var(--muted)]">
            {answer.reason}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/80 p-5">
            <p className="mb-3 text-sm font-semibold text-[var(--primary)]">
              준비 단계
            </p>
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
                추가 준비 단계가 필요하지 않거나, 먼저 확인 질문이 필요한
                상황입니다.
              </p>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/80 p-5">
            <p className="mb-3 text-sm font-semibold text-[var(--primary)]">
              다음 확인 질문
            </p>
            <p className="text-sm leading-6 text-[var(--foreground)]">
              {answer.follow_up_question ?? "추가 질문 없이 현재 답변으로 진행 가능합니다."}
            </p>
          </div>
        </div>

        <CitationList citations={answer.citations} />
      </div>
    </section>
  );
}
