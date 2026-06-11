type SectionHeaderProps = {
  eyebrow: string;
  heading: string;
  description: string;
};

export function SectionHeader({ eyebrow, heading, description }: SectionHeaderProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-flex items-center rounded-full bg-primary/10 px-3.5 py-1.5 text-sm font-medium text-primary">
        {eyebrow}
      </span>
      <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance text-base-content md:text-5xl">
        {heading}
      </h2>
      <p className="mt-4 text-pretty text-neutral-content md:text-lg">{description}</p>
    </div>
  );
}
