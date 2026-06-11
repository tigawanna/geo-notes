import { cn } from "@/lib/utils";

type Blob = {
  className: string;
  delay: string;
};

const BLOBS: Blob[] = [
  {
    className: "left-[-6%] top-[-10%] size-136 bg-amber-300/45 dark:bg-amber-500/20",
    delay: "0ms",
  },
  {
    className: "right-[-8%] top-[6%] size-120 bg-rose-300/40 dark:bg-rose-500/20",
    delay: "2400ms",
  },
  {
    className: "left-[18%] bottom-[-14%] size-128 bg-sky-300/40 dark:bg-sky-500/15",
    delay: "1200ms",
  },
  {
    className: "right-[14%] bottom-[-8%] size-104 bg-primary/30 dark:bg-primary/25",
    delay: "3600ms",
  },
];

type AuroraBackgroundProps = {
  className?: string;
};

export function AuroraBackground({ className }: AuroraBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {BLOBS.map((blob) => (
        <span
          key={blob.className}
          className={cn(
            "absolute animate-blob-float rounded-full blur-3xl will-change-transform",
            blob.className,
          )}
          style={{ animationDelay: blob.delay }}
        />
      ))}
      <div className="absolute inset-0 bg-grid mask-[radial-gradient(80%_70%_at_50%_30%,black,transparent)] opacity-40" />
    </div>
  );
}
