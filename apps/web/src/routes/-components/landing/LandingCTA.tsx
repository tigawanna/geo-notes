import { landingCta } from "@/content/landing";
import { Link, useLocation } from "@tanstack/react-router";

export function LandingCTA() {
  const { pathname } = useLocation();
  const [before, after] = landingCta.title.split(landingCta.highlight);

  return (
    <section data-test="landing-cta" className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-6 py-20 text-center md:px-12 md:py-28">
        <span className="pointer-events-none absolute -top-16 -left-10 size-72 rounded-full bg-white/15 blur-3xl" />
        <span className="pointer-events-none absolute -right-12 -bottom-20 size-80 rounded-full bg-amber-200/25 blur-3xl" />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-4xl font-semibold tracking-tight text-balance text-primary-content md:text-6xl">
            {before}
            <span className="relative whitespace-nowrap italic">
              <span className="absolute -inset-x-1 bottom-1 h-3 -rotate-1 rounded-full bg-primary-content/25" />
              <span className="relative">{landingCta.highlight}</span>
            </span>
            {after}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-pretty text-primary-content/80 md:text-lg">
            {landingCta.description}
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/auth"
              search={{ returnTo: pathname }}
              className="rounded-full bg-base-100 px-7 py-3.5 font-medium text-primary shadow-lg transition-transform hover:scale-[1.03]"
            >
              {landingCta.primaryCta}
            </Link>
            <Link
              to="/auth/signup"
              search={{ returnTo: "/dashboard" }}
              className="rounded-full px-7 py-3.5 font-medium text-primary-content ring-1 ring-primary-content/40 transition-colors hover:bg-primary-content/10"
            >
              {landingCta.secondaryCta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
