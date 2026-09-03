import { Eyebrow } from "./Eyebrow";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="font-display mt-1 text-2xl font-extrabold text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
