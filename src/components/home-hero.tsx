type HomeHeroProps = {
  appName: string;
  regionLabel: string;
};

export function HomeHero({ appName, regionLabel }: HomeHeroProps) {
  return (
    <section className="card-surface relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(29,107,67,0.18),transparent_70%)] lg:block" />
      <div className="relative flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-emerald-900/90 px-3 py-1 font-medium text-white">
            {regionLabel} 전용
          </span>
          <span className="rounded-full border border-[var(--border)] bg-white/65 px-3 py-1 text-[var(--muted)]">
            공식 출처 기반 응답
          </span>
          <span className="rounded-full border border-amber-600/20 bg-amber-100/80 px-3 py-1 text-amber-900">
            이미지 업로드 지원
          </span>
        </div>

        <div className="max-w-3xl space-y-4">
          <p className="section-title text-sm uppercase tracking-[0.24em] text-[var(--primary)]">
            {appName}
          </p>
          <h1 className="section-title text-4xl leading-tight sm:text-5xl lg:text-6xl">
            헷갈리는 분리배출,
            <br />
            공식 근거와 함께 바로 확인하세요.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            천안시 기준으로 쓰레기 배출 방법을 묻고, 필요하면 사진도 함께
            올릴 수 있습니다. 답변은 배출 결론, 이유, 준비 단계, 공식 출처를
            한 번에 정리해 보여줍니다.
          </p>
        </div>
      </div>
    </section>
  );
}
