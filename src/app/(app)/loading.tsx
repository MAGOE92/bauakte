export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-3 w-24 rounded-full bg-sunken" />
        <div className="mt-3 h-8 w-64 rounded-lg bg-sunken" />
        <div className="mt-3 h-4 w-96 max-w-full rounded-full bg-sunken" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 rounded-2xl border border-line bg-surface shadow-card" />
        ))}
      </div>
    </div>
  );
}
