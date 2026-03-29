import { getTherapists } from "@/lib/queries";
import { Users, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TherapistsPage() {
  const therapists = await getTherapists();

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">Therapists</h1>
          <p className="text-sm text-ink-secondary mt-1">
            {therapists.length} registered therapist{therapists.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Phone</th>
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Slug</th>
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Booking</th>
              <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {therapists.map((t) => (
              <tr key={t.id} className="hover:bg-surface-hover transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sage-bg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-sage">
                        {(t.display_name || t.full_name || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-ink">{t.display_name || t.full_name}</div>
                      {t.phone && <div className="text-xs text-ink-muted">{t.phone}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-ink-secondary">{t.phone ?? "—"}</td>
                <td className="px-5 py-3">
                  {t.slug ? (
                    <code className="text-xs bg-bg px-2 py-0.5 rounded text-sage font-mono">{t.slug}</code>
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {t.booking_page_active ? (
                    <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs text-ink-muted">Off</span>
                  )}
                </td>
                <td className="px-5 py-3 text-ink-muted text-xs font-mono">
                  {new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
