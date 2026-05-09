import Link from "next/link";
import { getTherapists } from "@/lib/queries";
import { Users } from "lucide-react";
import PlanActions from "./PlanActions";

export const dynamic = "force-dynamic";

function planStatusBadge(status: string) {
  const colors: Record<string, string> = {
    active: "bg-success/10 text-success",
    pending: "bg-warning/10 text-warning",
    suspended: "bg-error/10 text-error",
    cancelled: "bg-bg text-ink-muted",
  };
  return colors[status] ?? "bg-bg text-ink-muted";
}

function planLabel(plan: string | null) {
  if (!plan) return null;
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

export default async function TherapistsPage() {
  const therapists = await getTherapists();

  const pendingCount = therapists.filter((t) => t.plan_status === "pending" && t.plan_selected).length;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">Therapists</h1>
          <p className="text-sm text-ink-secondary mt-1">
            {therapists.length} registered therapist{therapists.length !== 1 ? "s" : ""}
            {pendingCount > 0 && (
              <span className="ml-2 text-warning">· {pendingCount} pending activation</span>
            )}
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Slug</th>
              <th className="px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Plan</th>
              <th className="px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Joined</th>
              <th className="px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {therapists.map((t) => (
              <tr key={t.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/therapists/${t.id}`} className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-sage-bg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-sage">
                        {(t.display_name || t.full_name || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-ink group-hover:text-sage-light transition-colors">
                        {t.display_name || t.full_name}
                      </div>
                      {t.phone && <div className="text-xs text-ink-muted">{t.phone}</div>}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-secondary text-xs">
                  {t.email ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {t.slug ? (
                    <code className="text-xs bg-bg px-2 py-0.5 rounded text-sage font-mono">{t.slug}</code>
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {t.plan_selected ? (
                    <span className="text-xs bg-bg px-2 py-0.5 rounded text-ink-secondary capitalize">
                      {planLabel(t.plan_selected)}
                    </span>
                  ) : (
                    <span className="text-ink-muted text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full capitalize ${planStatusBadge(t.plan_status)}`}>
                    {t.plan_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-muted text-xs font-mono">
                  {new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  <PlanActions therapistId={t.id} currentStatus={t.plan_status} />
                </td>
              </tr>
            ))}
            {therapists.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-ink-muted">
                  No therapists yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
