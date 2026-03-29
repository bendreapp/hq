import { getPlatformStats, getSignupsByDay, getWaitlist } from "@/lib/queries";
import { Users, UserPlus, CalendarDays, Clock, BarChart3, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-2xl font-bold text-ink">{value}</div>
      <div className="text-xs text-ink-secondary mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-ink-muted mt-1">{sub}</div>}
    </div>
  );
}

export default async function DashboardPage() {
  const [stats, signups, waitlist] = await Promise.all([
    getPlatformStats(),
    getSignupsByDay(30),
    getWaitlist(),
  ]);

  const recentWaitlist = waitlist.slice(0, 5);

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-ink-secondary mt-1">
          Platform overview &middot; Last 30 days
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Therapists"
          value={stats.totalTherapists}
          sub={`+${stats.newTherapists30d} this month`}
          icon={Users}
          color="bg-sage-bg text-sage"
        />
        <StatCard
          label="Total Clients"
          value={stats.totalClients}
          sub={`+${stats.newClients30d} this month`}
          icon={UserPlus}
          color="bg-info/10 text-info"
        />
        <StatCard
          label="Total Sessions"
          value={stats.totalSessions}
          sub={`${stats.completedSessions} completed`}
          icon={CalendarDays}
          color="bg-success/10 text-success"
        />
        <StatCard
          label="Waitlist"
          value={stats.waitlistCount}
          icon={Clock}
          color="bg-warning/10 text-warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signups chart placeholder */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-ink-secondary" />
            <h2 className="text-sm font-semibold text-ink">Therapist Signups (30d)</h2>
          </div>
          {signups.length === 0 ? (
            <p className="text-sm text-ink-muted py-8 text-center">No signups in the last 30 days</p>
          ) : (
            <div className="space-y-1">
              {signups.map((s) => (
                <div key={s.date} className="flex items-center justify-between text-sm">
                  <span className="text-ink-secondary font-mono text-xs">{s.date}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-sage"
                      style={{ width: `${Math.max(s.count * 40, 8)}px` }}
                    />
                    <span className="text-ink text-xs font-medium w-4 text-right">{s.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent waitlist */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-ink-secondary" />
            <h2 className="text-sm font-semibold text-ink">Recent Waitlist</h2>
          </div>
          {recentWaitlist.length === 0 ? (
            <p className="text-sm text-ink-muted py-8 text-center">No waitlist entries yet</p>
          ) : (
            <div className="space-y-2">
              {recentWaitlist.map((w: { id: string; email: string; source: string; created_at: string }) => (
                <div key={w.id} className="flex items-center justify-between py-1.5">
                  <div>
                    <span className="text-sm text-ink">{w.email}</span>
                    <span className="text-[10px] text-ink-muted ml-2">{w.source}</span>
                  </div>
                  <span className="text-xs text-ink-muted font-mono">
                    {new Date(w.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
