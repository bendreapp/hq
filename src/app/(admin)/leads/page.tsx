import { getLeads } from "@/lib/queries";
import { Target } from "lucide-react";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    new: "bg-info/10 text-info",
    contacted: "bg-warning/10 text-warning",
    converted: "bg-success/10 text-success",
    declined: "bg-bg text-ink-muted",
  };
  return colors[status] ?? "bg-bg text-ink-muted";
}

function sourceBadge(source: string) {
  const colors: Record<string, string> = {
    booking: "bg-sage-bg text-sage",
    manual: "bg-bg text-ink-secondary",
    referral: "bg-info/10 text-info",
  };
  return colors[source] ?? "bg-bg text-ink-muted";
}

export default async function LeadsPage() {
  const leads = await getLeads();

  const statusCounts: Record<string, number> = {};
  leads.forEach((l) => {
    statusCounts[l.status] = (statusCounts[l.status] ?? 0) + 1;
  });

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Leads</h1>
        <p className="text-sm text-ink-secondary mt-1">
          {leads.length} lead{leads.length !== 1 ? "s" : ""} across all therapists
        </p>
      </div>

      {/* Status summary */}
      <div className="flex gap-3 flex-wrap">
        {Object.entries(statusCounts)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([status, count]) => (
            <div key={status} className="bg-surface border border-border rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-lg font-bold text-ink">{count}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusBadge(status)}`}>
                {status}
              </span>
            </div>
          ))}
        {leads.length === 0 && (
          <div className="text-sm text-ink-muted">No data yet</div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Therapist</th>
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Source</th>
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads.map((l) => (
              <tr key={l.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-surface-hover flex items-center justify-center flex-shrink-0">
                      <Target size={12} className="text-ink-muted" />
                    </div>
                    <span className="font-medium text-ink">{l.full_name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-ink-secondary text-xs">
                  {l.email ?? "—"}
                </td>
                <td className="px-5 py-3 text-ink-secondary text-xs">
                  {l.therapist_name}
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full capitalize ${statusBadge(l.status)}`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full capitalize ${sourceBadge(l.source)}`}>
                    {l.source}
                  </span>
                </td>
                <td className="px-5 py-3 text-ink-muted text-xs font-mono">
                  {new Date(l.created_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone: "Asia/Kolkata",
                  })}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-ink-muted">
                  No leads yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
