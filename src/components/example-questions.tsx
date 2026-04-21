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
