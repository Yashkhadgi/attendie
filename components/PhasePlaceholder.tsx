type PhasePlaceholderProps = {
  title: string;
  phase: string;
  description?: string;
};

export function PhasePlaceholder({
  title,
  phase,
  description,
}: PhasePlaceholderProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-slate-500">{phase}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          {description ?? `Coming in ${phase}.`}
        </p>
      </div>
    </section>
  );
}
