export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-sage bg-white/70 px-6 py-10 text-center">
      <h3 className="font-heading text-2xl font-bold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm text-slate-500">{description}</p>
    </div>
  );
}
