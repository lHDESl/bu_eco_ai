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
