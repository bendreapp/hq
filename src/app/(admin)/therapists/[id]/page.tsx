import Link from "next/link";
import { notFound } from "next/navigation";
import { getTherapistDetail } from "@/lib/queries";
import { ArrowLeft, Users, CalendarDays, Target, CheckCircle2, Clock, Globe } from "lucide-react";
import PlanActions from "../PlanActions";

export const dynamic = "force-dynamic";

function planStatusBadge(status: string) {
  const colors: Record<string, string> = {
    active: "bg-success/10 text-success border-success/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    suspended: "bg-error/10 text-error border-error/20",
    cancelled: "bg-bg text-ink-muted border-border",
  };
  return colors[status] ?? "bg-bg text-ink-muted border-border";
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-xs text-ink-muted w-32 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-ink flex-1">{value}</span>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        <Icon size={16} />
      </div>
      <div className="text-xl font-bold text-ink">{value}</div>
      <div className="text-xs text-ink-secondary mt-0.5">{label}</div>
    </div>
  );
}

export default async function TherapistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let therapist;
  try {
    therapist = await getTherapistDetail(id);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back */}
      <Link
        href="/therapists"
        className="inline-flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Therapists
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-sage-bg flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-sage">
              {(therapist.display_name || therapist.full_name || "?").charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">
              {therapist.display_name || therapist.full_name}
            </h1>
            {therapist.display_name && therapist.display_name !== therapist.full_name && (
              <p className="text-sm text-ink-secondary">{therapist.full_name}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border capitalize font-medium ${planStatusBadge(therapist.plan_status)}`}>
                {therapist.plan_status}
              </span>
              {therapist.plan_selected && (
                <span className="text-xs bg-bg px-2.5 py-1 rounded-full border border-border text-ink-secondary capitalize">
                  {therapist.plan_selected} plan
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PlanActions therapistId={therapist.id} currentStatus={therapist.plan_status} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Clients"
          value={therapist.client_count}
          icon={Users}
          color="bg-sage-bg text-sage"
        />
        <StatCard
          label="Sessions"
          value={therapist.session_count}
          icon={CalendarDays}
          color="bg-info/10 text-info"
        />
        <StatCard
          label="Completed"
          value={therapist.completed_count}
          icon={CheckCircle2}
          color="bg-success/10 text-success"
        />
        <StatCard
          label="Leads"
          value={therapist.lead_count}
          icon={Target}
          color="bg-warning/10 text-warning"
        />
      </div>

      {/* Profile details */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-ink mb-4">Profile</h2>
        <div>
          <InfoRow label="Email" value={therapist.email ?? "—"} />
          <InfoRow label="Phone" value={therapist.phone ?? "—"} />
          <InfoRow
            label="Slug"
            value={
              therapist.slug ? (
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-bg px-2 py-0.5 rounded text-sage font-mono">{therapist.slug}</code>
                  <a
                    href={`https://app.bendre.app/booking/${therapist.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-muted hover:text-info transition-colors"
                  >
                    <Globe size={13} />
                  </a>
                </div>
              ) : "—"
            }
          />
          <InfoRow label="Timezone" value={therapist.timezone} />
          <InfoRow
            label="Booking Page"
            value={
              therapist.booking_page_active ? (
                <span className="text-success text-xs">Active</span>
              ) : (
                <span className="text-ink-muted text-xs">Off</span>
              )
            }
          />
          {therapist.qualifications && (
            <InfoRow label="Qualifications" value={therapist.qualifications} />
          )}
          <InfoRow
            label="Joined"
            value={
              <div className="flex items-center gap-1.5 text-ink-muted text-xs font-mono">
                <Clock size={12} />
                {new Date(therapist.created_at).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "Asia/Kolkata",
                })}
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
