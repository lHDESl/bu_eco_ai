const EXAMPLES = [
  "집에 남은 감기약은 어디에 버리나요?",
  "오염된 플라스틱 배달용기는 재활용인가요?",
  "대형폐기물 스티커는 어떻게 신청하나요?",
  "일반 생활쓰레기는 어떻게 버리나요?",
];

export function ExampleQuestions() {
  return (
    <aside className="card-surface rounded-[2rem] p-6 sm:p-7">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="section-title text-2xl">예시 질문</p>
          <p className="text-sm leading-6 text-[var(--muted)]">
            실제 구현 후에는 클릭 한 번으로 질문 입력창에 채워지도록 연결됩니다.
            지금은 기본 데모 문구를 보여줍니다.
          </p>
        </div>

        <div className="space-y-3">
          {EXAMPLES.map((example) => (
            <div
              key={example}
              className="rounded-2xl border border-[var(--border)] bg-white/80 px-4 py-4 text-sm leading-6 text-[var(--foreground)]"
            >
              {example}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/80 p-4 text-sm leading-6 text-emerald-950">
          답변이 모호한 경우에는 확신한 척하지 않고, 재질이나 오염 정도를
          다시 묻는 것이 v1의 기본 원칙입니다.
        </div>
      </div>
    </aside>
  );
}
