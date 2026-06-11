import { AuroraBackground } from "@/components/ui/aurora-background";
import { landingHero } from "@/content/landing";
import { Link } from "@tanstack/react-router";
import { MapPin, Plus, Search } from "lucide-react";
import type { CSSProperties } from "react";

type NoteTone = "amber" | "sky" | "rose" | "emerald";

type Note = {
  tag: string;
  tone: NoteTone;
  title: string;
  place: string;
  rotate: string;
  delay: string;
};

const TONE_CHIP: Record<NoteTone, string> = {
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

const TONE_DOT: Record<NoteTone, string> = {
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  rose: "bg-rose-500",
  emerald: "bg-emerald-500",
};

const NOTES: Note[] = [
  {
    tag: "Field",
    tone: "amber",
    title: "Kilimani ward survey",
    place: "Kilimani",
    rotate: "-1.5deg",
    delay: "0ms",
  },
  {
    tag: "Idea",
    tone: "sky",
    title: "Riverside walking path",
    place: "Karura",
    rotate: "1.5deg",
    delay: "1200ms",
  },
  {
    tag: "Todo",
    tone: "rose",
    title: "Check missing signage",
    place: "CBD",
    rotate: "1deg",
    delay: "600ms",
  },
  {
    tag: "Place",
    tone: "emerald",
    title: "New viewpoint spotted",
    place: "Ngong Hills",
    rotate: "-1deg",
    delay: "1800ms",
  },
];

export function LandingHero() {
  return (
    <section data-test="landing-hero" className="relative overflow-hidden">
      <AuroraBackground />

      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-20 pb-16 text-center md:pt-28">
        <span className="inline-flex animate-fade-in items-center gap-2 rounded-full bg-base-200 px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-base-300">
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          {landingHero.eyebrow}
        </span>

        <h1 className="mt-7 animate-fade-in text-5xl font-semibold tracking-tight text-balance text-base-content md:text-7xl">
          {landingHero.title}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl animate-fade-in text-lg leading-relaxed text-pretty text-neutral-content md:text-xl">
          {landingHero.description}
        </p>

        <div className="mt-9 flex animate-fade-in flex-wrap justify-center gap-3">
          <Link
            to="/auth"
            search={{ returnTo: "/dashboard" }}
            className="rounded-full bg-primary px-7 py-3.5 font-medium text-primary-content shadow-lg shadow-primary/20 transition-transform hover:scale-[1.03]"
          >
            {landingHero.primaryCta}
          </Link>
          <Link
            to="/dashboard"
            className="rounded-full bg-base-200 px-7 py-3.5 font-medium text-base-content ring-1 ring-base-300 transition-colors hover:bg-base-300/60"
          >
            {landingHero.secondaryCta}
          </Link>
        </div>
      </div>

      <div className="relative z-10 px-6 pb-24">
        <NotesMockup />
      </div>
    </section>
  );
}

function NotesMockup() {
  return (
    <div className="mx-auto max-w-4xl rounded-4xl border border-base-300 bg-base-200/80 p-4 shadow-[0_40px_90px_-40px_rgba(60,40,20,0.45)] backdrop-blur-sm md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 rounded-full bg-base-100 px-3 py-1.5 text-sm text-neutral-content ring-1 ring-base-300">
            <Search className="size-4" />
            Search notes
          </span>
          <span className="hidden rounded-full bg-base-100 px-3 py-1.5 text-sm text-neutral-content ring-1 ring-base-300 sm:inline">
            All places
          </span>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-content">
          <Plus className="size-4" />
          New note
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-5 md:grid-cols-4">
        {NOTES.map((note) => (
          <div
            key={note.title}
            className="flex animate-note-float flex-col gap-3 rounded-2xl bg-base-100 p-4 ring-1 ring-base-300"
            style={{ "--note-rotate": note.rotate, animationDelay: note.delay } as CSSProperties}
          >
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${TONE_CHIP[note.tone]}`}
              >
                {note.tag}
              </span>
              <span className={`size-2.5 rounded-full ${TONE_DOT[note.tone]}`} />
            </div>
            <p className="text-sm leading-snug font-medium text-base-content">{note.title}</p>
            <div className="space-y-1.5">
              <span className="block h-1.5 w-full rounded-full bg-base-content/10" />
              <span className="block h-1.5 w-3/4 rounded-full bg-base-content/10" />
            </div>
            <span className="mt-auto flex items-center gap-1 text-xs text-neutral-content">
              <MapPin className="size-3.5 text-primary" />
              {note.place}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-base-300 pt-5">
        {landingHero.navPanel.stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <span
              key={stat.label}
              className="flex items-center gap-2 rounded-full bg-base-100 px-3.5 py-1.5 text-sm ring-1 ring-base-300"
            >
              <Icon className="size-4 text-primary" />
              <span className="font-semibold text-base-content tabular-nums">{stat.value}</span>
              <span className="text-neutral-content">{stat.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
