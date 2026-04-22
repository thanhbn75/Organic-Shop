export function ApiStateCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="panel px-6 py-10 text-center">
      <h2 className="font-heading text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm text-slate-500">{description}</p>
    </div>
  );
}
