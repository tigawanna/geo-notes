import { landingFooter, landingNav } from "@/content/landing";
import { AppConfig } from "@/utils/system";
import { Link } from "@tanstack/react-router";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();
  const Icon = AppConfig.icon;

  return (
    <footer className="mx-auto max-w-6xl px-6 pb-12">
      <div className="rounded-4xl bg-base-200 px-6 py-10 ring-1 ring-base-300 md:px-10">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-content">
                <Icon className="size-5" />
              </span>
              <span className="text-lg font-semibold tracking-tight text-base-content">
                {AppConfig.name}
              </span>
            </Link>
            <p className="max-w-xs text-sm text-neutral-content">{landingFooter.tagline}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            {landingNav.links.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-neutral-content transition-colors hover:text-base-content"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/privacy"
              className="text-neutral-content transition-colors hover:text-base-content"
            >
              Privacy
            </Link>
            <Link
              to="/dashboard"
              className="rounded-full bg-base-100 px-4 py-2 font-medium text-base-content ring-1 ring-base-300 transition-colors hover:bg-base-300/60"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-base-300 pt-6 text-sm text-neutral-content">
          © {currentYear} {AppConfig.name} · Offline-first, privacy-friendly notes.
        </div>
      </div>
    </footer>
  );
}
