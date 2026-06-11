import { landingNav } from "@/content/landing";
import { useTheme } from "@/lib/tanstack/router/use-theme";
import { AppConfig } from "@/utils/system";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, Moon, Sun, X } from "lucide-react";
import { lazy, Suspense, useState } from "react";

const DashboardLink = lazy(() => import("./LandingDashboardLink"));

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { theme, updateTheme } = useTheme();
  const Icon = AppConfig.icon;

  function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light";
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      try {
        document.startViewTransition(() => updateTheme(newTheme));
        return;
      } catch {
        updateTheme(newTheme);
        return;
      }
    }
    updateTheme(newTheme);
  }

  return (
    <header
      data-test="landing-navbar"
      className="sticky top-0 z-50 border-b border-base-300/60 bg-base-100/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-content">
            <Icon className="size-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-base-content">
            {AppConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {landingNav.links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-neutral-content transition-colors hover:bg-base-200 hover:text-base-content"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex size-9 items-center justify-center rounded-full text-neutral-content transition-colors hover:bg-base-200 hover:text-base-content"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="size-5" /> : <Sun className="size-5" />}
          </button>

          <Suspense
            fallback={
              <Link
                to="/auth"
                search={{ returnTo: "/dashboard" }}
                className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-content transition-transform hover:scale-[1.03] sm:block"
              >
                Get started
              </Link>
            }
          >
            <DashboardLink />
          </Suspense>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex size-9 items-center justify-center rounded-full text-base-content transition-colors hover:bg-base-200 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="space-y-1 border-t border-base-300/60 bg-base-100/95 p-4 backdrop-blur-xl md:hidden">
          {landingNav.links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-base-content transition-colors hover:bg-base-200"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/auth"
            search={{ returnTo: pathname }}
            onClick={() => setMobileOpen(false)}
            className="mt-2 block rounded-full bg-primary px-5 py-3 text-center text-sm font-medium text-primary-content"
          >
            Get started
          </Link>
        </div>
      ) : null}
    </header>
  );
}
