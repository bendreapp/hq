import { getRecentSessions } from "@/lib/queries";
import { CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    scheduled: "bg-info/10 text-info",
    completed: "bg-success/10 text-success",
    cancelled: "bg-error/10 text-error",
    no_show: "bg-warning/10 text-warning",
    pending_approval: "bg-warning/10 text-warning",
  };
  return colors[status] ?? "bg-bg text-ink-muted";
}

export default async function SessionsPage() {
  const sessions = await getRecentSessions(100);

  const statusCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    statusCounts[s.status] = (statusCounts[s.status] ?? 0) + 1;
  });

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Sessions</h1>
        <p className="text-sm text-ink-secondary mt-1">
          Recent sessions across all therapists
        </p>
      </div>

      {/* Status summary */}
      <div className="flex gap-3 flex-wrap">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="bg-surface border border-border rounded-lg px-4 py-2">
            <span className="text-lg font-bold text-ink">{count}</span>
            <span className="text-xs text-ink-muted ml-2 capitalize">{status.replace("_", " ")}</span>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Date/Time</th>
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Duration</th>
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Therapist ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sessions.map((s) => (
              <tr key={s.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-5 py-3 text-ink font-mono text-xs">
                  {new Date(s.starts_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata",
                  })}
                </td>
                <td className="px-5 py-3 text-ink-secondary">{s.duration_mins} min</td>
                <td className="px-5 py-3">
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full capitalize ${statusBadge(s.status)}`}>
                    {s.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-5 py-3 text-ink-muted text-xs font-mono">
                  {s.therapist_id.slice(0, 8)}...
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-ink-muted">
                  No sessions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
