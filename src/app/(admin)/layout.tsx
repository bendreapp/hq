import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, LayoutDashboard, Users, CalendarDays, Clock, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/therapists", label: "Therapists", icon: Users },
  { href: "/waitlist", label: "Waitlist", icon: UserPlus },
  { href: "/sessions", label: "Sessions", icon: CalendarDays },
  { href: "/clients", label: "Clients", icon: Clock },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense-in-depth: verify auth server-side in addition to middleware
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

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
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-secondary hover:text-ink hover:bg-surface-hover transition-colors"
              >
                <Icon size={16} className="text-ink-muted" />
                {item.label}
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
