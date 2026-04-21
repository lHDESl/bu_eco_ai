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
