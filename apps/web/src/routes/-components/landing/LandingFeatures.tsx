import { landingCapabilities } from "@/content/landing";
import { SectionHeader } from "./SectionHeader";

const TONE_CHIP = [
  "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
];

export function LandingFeatures() {
  return (
    <section
      id="capabilities"
      data-test="landing-capabilities"
      className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 md:py-28"
    >
      <SectionHeader
        eyebrow="Capabilities"
        heading={landingCapabilities.heading}
        description={landingCapabilities.description}
      />

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {landingCapabilities.steps.map((step, index) => {
          const Icon = step.icon;
          const chip = TONE_CHIP[index % TONE_CHIP.length];
          return (
            <div
              key={step.id}
              className="group rounded-3xl bg-base-200 p-7 ring-1 ring-base-300 transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(60,40,20,0.35)] md:p-8"
            >
              <div className={`flex size-14 items-center justify-center rounded-2xl ${chip}`}>
                <Icon className="size-7" />
              </div>
              <div className="mt-6 text-xs font-medium tracking-wide text-neutral-content uppercase">
                {step.label}
              </div>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-balance text-base-content md:text-2xl">
                {step.title}
              </h3>
              <p className="mt-3 leading-relaxed text-pretty text-neutral-content">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
