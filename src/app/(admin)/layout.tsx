import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, LayoutDashboard, Users, CalendarDays, Clock, UserPlus, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPlatformStats, getLeads } from "@/lib/queries";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/therapists", label: "Therapists", icon: Users },
  { href: "/leads", label: "Leads", icon: Target },
  { href: "/clients", label: "Clients", icon: Clock },
  { href: "/sessions", label: "Sessions", icon: CalendarDays },
  { href: "/waitlist", label: "Waitlist", icon: UserPlus },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense-in-depth: verify auth server-side in addition to middleware
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch counts for badges (best-effort, don't fail layout).
  // `expiring_soon_count` from /admin/stats counts active therapists whose
  // plan_expires_at falls within the next 7 days — actionable signal, unlike
  // the previous "total therapists" pill which was just a headcount.
  let stats = { expiring_soon_count: 0, waitlist_count: 0 };
  let leadsCount = 0;
  try {
    const [s, leads] = await Promise.all([getPlatformStats(), getLeads()]);
    stats = s;
    leadsCount = leads.filter((l) => l.status === "new").length;
  } catch {
    // ignore
  }

  const badges: Record<string, number> = {
    "/therapists": stats.expiring_soon_count,
    "/leads": leadsCount,
    "/waitlist": stats.waitlist_count,
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-surface border-r border-border flex flex-col fixed inset-y-0 left-0">
        <div className="px-5 pt-5 pb-6 flex items-center gap-2">
          <Shield size={22} className="text-sage" />
          <span className="text-lg font-bold tracking-tight text-ink">
            Bendre HQ
          </span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const badge = badges[item.href];
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-secondary hover:text-ink hover:bg-surface-hover transition-colors"
              >
                <Icon size={16} className="text-ink-muted flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {badge != null && badge > 0 && (
                  <span className="text-[10px] font-semibold bg-sage-bg text-sage-light px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {badge > 999 ? "999+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-border">
          <p className="text-[10px] uppercase tracking-widest text-ink-muted">
            Internal Only
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 p-8">{children}</main>
    </div>
  );
}
