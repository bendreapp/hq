import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";
import { getTherapists, type TherapistRow } from "@/lib/queries";
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

/// "expired" = active in DB but past expiry; surfaced separately from raw
/// plan_status so admins can chase the right group.
function effectiveStatus(t: TherapistRow, nowMs: number): string {
  if (t.plan_status === "active") {
    if (!t.plan_expires_at) return "expired";
    if (new Date(t.plan_expires_at).getTime() < nowMs) return "expired";
    return "active";
  }
  return t.plan_status;
}

function formatExpiry(t: TherapistRow, nowMs: number): {
  label: string;
  tone: "ok" | "warn" | "danger" | "muted";
} {
  if (!t.plan_expires_at) {
    return { label: "—", tone: "muted" };
  }
  const exp = new Date(t.plan_expires_at).getTime();
  const days = Math.round((exp - nowMs) / 86_400_000);
  if (days < 0) {
    return { label: `expired ${Math.abs(days)}d ago`, tone: "danger" };
  }
  if (days === 0) {
    return { label: "expires today", tone: "danger" };
  }
  if (days <= 7) {
    return { label: `in ${days}d`, tone: "warn" };
  }
  return { label: `in ${days}d`, tone: "ok" };
}

function expiryClass(tone: "ok" | "warn" | "danger" | "muted") {
  switch (tone) {
    case "danger": return "text-error font-medium";
    case "warn": return "text-warning font-medium";
    case "ok": return "text-ink-secondary";
    case "muted": return "text-ink-muted";
  }
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "expired", label: "Expired" },
  { key: "suspended", label: "Suspended" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default async function TherapistsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: rawFilter } = await searchParams;
  const filter: FilterKey = (FILTERS.find((f) => f.key === rawFilter)?.key ?? "all");

  const therapists = await getTherapists();
  const nowMs = Date.now();

  const pendingCount = therapists.filter(
    (t) => t.plan_status === "pending" && t.plan_selected
  ).length;
  const expiringSoonCount = therapists.filter((t) => {
    if (t.plan_status !== "active" || !t.plan_expires_at) return false;
    const days = (new Date(t.plan_expires_at).getTime() - nowMs) / 86_400_000;
    return days >= 0 && days <= 7;
  }).length;

  const filtered = therapists.filter((t) => {
    if (filter === "all") return true;
    return effectiveStatus(t, nowMs) === filter;
  });

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
            {expiringSoonCount > 0 && (
              <span className="ml-2 text-warning">· {expiringSoonCount} expiring this week</span>
            )}
          </p>
        </div>
      </div>

      {/* Filter chips — aria-current marks the active page so screen readers
          announce it, not just rely on color/weight. */}
      <nav aria-label="Plan status filter" className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Link
              key={f.key}
              href={f.key === "all" ? "/therapists" : `/therapists?filter=${f.key}`}
              aria-current={active ? "page" : undefined}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30 ${
                active
                  ? "bg-sage-bg border-sage/30 text-sage font-medium"
                  : "bg-surface border-border text-ink-secondary hover:text-ink hover:border-ink-muted"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Slug</th>
              <th className="px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Plan</th>
              <th className="px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Expires</th>
              <th className="px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Joined</th>
              <th className="px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((t) => {
              const expiry = formatExpiry(t, nowMs);
              const eff = effectiveStatus(t, nowMs);
              return (
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
                    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full capitalize ${planStatusBadge(eff)}`}>
                      {eff}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-xs font-mono ${expiryClass(expiry.tone)}`}>
                    {/* Color carries severity, so we ALSO show an icon for
                        danger/warn rows — meets color-not-only a11y rule. */}
                    <span className="inline-flex items-center gap-1">
                      {expiry.tone === "danger" && <AlertTriangle size={11} aria-hidden="true" />}
                      {expiry.tone === "warn" && <Clock size={11} aria-hidden="true" />}
                      {expiry.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted text-xs font-mono">
                    {new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <PlanActions therapistId={t.id} currentStatus={t.plan_status} />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-ink-muted">
                  {therapists.length === 0 ? "No therapists yet" : "No therapists match this filter"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
