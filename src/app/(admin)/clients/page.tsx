import { createAdminClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const sb = createAdminClient();

  const [total, active, inactive] = await Promise.all([
    sb.from("clients").select("id", { count: "exact", head: true }).is("deleted_at", null),
    sb.from("clients").select("id", { count: "exact", head: true }).eq("status", "active").is("deleted_at", null),
    sb.from("clients").select("id", { count: "exact", head: true }).eq("status", "inactive").is("deleted_at", null),
  ]);

  // Category breakdown
  const { data: categories } = await sb
    .from("clients")
    .select("category")
    .is("deleted_at", null);

  const catCounts: Record<string, number> = {};
  (categories ?? []).forEach((c: { category: string | null }) => {
    const cat = c.category ?? "uncategorized";
    catCounts[cat] = (catCounts[cat] ?? 0) + 1;
  });

  // Recent clients (no personal details, just counts by month)
  const { data: recentClients } = await sb
    .from("clients")
    .select("created_at")
    .is("deleted_at", null)
    .gte("created_at", new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: true });

  const byMonth: Record<string, number> = {};
  (recentClients ?? []).forEach((c: { created_at: string }) => {
    const month = c.created_at.slice(0, 7);
    byMonth[month] = (byMonth[month] ?? 0) + 1;
  });

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
          <div className="text-2xl font-bold text-ink">{total.count ?? 0}</div>
          <div className="text-xs text-ink-secondary mt-0.5">Total clients</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-2xl font-bold text-success">{active.count ?? 0}</div>
          <div className="text-xs text-ink-secondary mt-0.5">Active</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="text-2xl font-bold text-ink-muted">{inactive.count ?? 0}</div>
          <div className="text-xs text-ink-secondary mt-0.5">Inactive</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">By Category</h2>
          <div className="space-y-2">
            {Object.entries(catCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-sm text-ink-secondary capitalize">{cat.replace("_", " ")}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-sage"
                      style={{ width: `${Math.max((count / (total.count ?? 1)) * 120, 8)}px` }}
                    />
                    <span className="text-xs text-ink font-medium w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Growth by month */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-ink mb-4">Growth (6 months)</h2>
          <div className="space-y-2">
            {Object.entries(byMonth).map(([month, count]) => (
              <div key={month} className="flex items-center justify-between">
                <span className="text-sm text-ink-secondary font-mono">{month}</span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 rounded-full bg-info"
                    style={{ width: `${Math.max(count * 8, 8)}px` }}
                  />
                  <span className="text-xs text-ink font-medium w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
            {Object.keys(byMonth).length === 0 && (
              <p className="text-sm text-ink-muted py-4 text-center">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
