import { getWaitlist } from "@/lib/queries";
import { UserPlus, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WaitlistPage() {
  const waitlist = await getWaitlist();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Waitlist</h1>
        <p className="text-sm text-ink-secondary mt-1">
          {waitlist.length} signup{waitlist.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Source</th>
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {waitlist.map((w: { id: string; email: string; source: string; created_at: string }) => (
              <tr key={w.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-ink-muted" />
                    <span className="text-ink">{w.email}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs bg-bg px-2 py-0.5 rounded text-ink-secondary">{w.source}</span>
                </td>
                <td className="px-5 py-3 text-ink-muted text-xs font-mono">
                  {new Date(w.created_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata",
                  })}
                </td>
              </tr>
            ))}
            {waitlist.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center text-ink-muted">
                  No waitlist signups yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
