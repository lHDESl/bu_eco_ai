import type { Citation } from "@/lib/contracts";

type CitationListProps = {
  citations: Citation[];
};

export function CitationList({ citations }: CitationListProps) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/80 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-[var(--primary)]">공식 출처</p>
        <span className="text-xs text-[var(--muted)]">
          {citations.length}건
        </span>
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
                  원문 보기
                </a>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-6 text-[var(--muted)]">
          현재는 표시할 출처가 없습니다. 이 경우에는 보통 추가 확인 질문이
          필요한 상황이어야 합니다.
        </p>
      )}
    </div>
  );
}
