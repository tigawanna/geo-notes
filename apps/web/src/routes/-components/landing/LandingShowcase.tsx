import { landingReasons } from "@/content/landing";
import { SectionHeader } from "./SectionHeader";

const TONE_CHIP = [
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "bg-primary/10 text-primary",
];

export function LandingShowcase() {
  return (
    <section
      id="why"
      data-test="landing-showcase"
      className="mx-auto max-w-6xl scroll-mt-20 px-6 py-12 md:py-16"
    >
      <div className="rounded-[2.5rem] bg-base-200 px-6 py-16 ring-1 ring-base-300 md:px-12 md:py-20">
        <SectionHeader
          eyebrow="Why GeoNotes"
          heading={landingReasons.heading}
          description={landingReasons.description}
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {landingReasons.items.map((reason, index) => {
            const Icon = reason.icon;
            const chip = TONE_CHIP[index % TONE_CHIP.length];
            return (
              <div
                key={reason.title}
                className="group flex flex-col gap-4 rounded-2xl bg-base-100 p-7 ring-1 ring-base-300 transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(60,40,20,0.4)]"
              >
                <div className={`flex size-12 items-center justify-center rounded-2xl ${chip}`}>
                  <Icon className="size-6 transition-transform group-hover:scale-110" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-base-content">
                  {reason.title}
                </h3>
                <p className="leading-relaxed text-neutral-content">{reason.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
