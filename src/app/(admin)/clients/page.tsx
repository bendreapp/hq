import { getClientStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const stats = await getClientStats();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Clients</h1>
        <p className="text-sm text-ink-secondary mt-1">
          Aggregate client metrics (no personal data)
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-2xl font-bold text-ink">{stats.total}</div>
          <div className="text-xs text-ink-secondary mt-0.5">Total clients</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-2xl font-bold text-success">{stats.active}</div>
          <div className="text-xs text-ink-secondary mt-0.5">Active</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-2xl font-bold text-ink-muted">{stats.inactive}</div>
          <div className="text-xs text-ink-secondary mt-0.5">Inactive</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">By Category</h2>
          <div className="space-y-2">
            {stats.categories
              .sort((a, b) => b.count - a.count)
              .map((c) => (
                <div key={c.category} className="flex items-center justify-between">
                  <span className="text-sm text-ink-secondary capitalize">{c.category.replace("_", " ")}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-sage"
                      style={{ width: `${Math.max((c.count / (stats.total || 1)) * 120, 8)}px` }}
                    />
                    <span className="text-xs text-ink font-medium w-6 text-right">{c.count}</span>
                  </div>
                </div>
              ))}
            {stats.categories.length === 0 && (
              <p className="text-sm text-ink-muted py-4 text-center">No data</p>
            )}
          </div>
        </div>

        {/* Growth by month */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">Growth (6 months)</h2>
          <div className="space-y-2">
            {stats.growth_by_month.map((m) => (
              <div key={m.month} className="flex items-center justify-between">
                <span className="text-sm text-ink-secondary font-mono">{m.month}</span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 rounded-full bg-info"
                    style={{ width: `${Math.max(m.count * 8, 8)}px` }}
                  />
                  <span className="text-xs text-ink font-medium w-6 text-right">{m.count}</span>
                </div>
              </div>
            ))}
            {stats.growth_by_month.length === 0 && (
              <p className="text-sm text-ink-muted py-4 text-center">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
