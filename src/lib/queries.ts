import { createAdminClient } from "./supabase/server";

export async function getPlatformStats() {
  const sb = createAdminClient();

  const [therapists, clients, sessions, waitlist] = await Promise.all([
    sb.from("therapists").select("id", { count: "exact", head: true }),
    sb.from("clients").select("id", { count: "exact", head: true }).is("deleted_at", null),
    sb.from("sessions").select("id", { count: "exact", head: true }).is("deleted_at", null),
    sb.from("waitlist").select("id", { count: "exact", head: true }),
  ]);

  const completedSessions = await sb
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("status", "completed")
    .is("deleted_at", null);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const newTherapists = await sb
    .from("therapists")
    .select("id", { count: "exact", head: true })
    .gte("created_at", thirtyDaysAgo);

  const newClients = await sb
    .from("clients")
    .select("id", { count: "exact", head: true })
    .gte("created_at", thirtyDaysAgo)
    .is("deleted_at", null);

  return {
    totalTherapists: therapists.count ?? 0,
    totalClients: clients.count ?? 0,
    totalSessions: sessions.count ?? 0,
    completedSessions: completedSessions.count ?? 0,
    waitlistCount: waitlist.count ?? 0,
    newTherapists30d: newTherapists.count ?? 0,
    newClients30d: newClients.count ?? 0,
  };
}

export async function getTherapists() {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("therapists")
    .select("id, full_name, display_name, email, phone, slug, timezone, booking_page_active, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getTherapistDetail(id: string) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("therapists")
    .select("id, full_name, display_name, email, phone, slug, timezone, qualifications, specializations, booking_page_active, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error) throw error;

  const [clientCount, sessionCount, completedCount] = await Promise.all([
    sb.from("clients").select("id", { count: "exact", head: true }).eq("therapist_id", id).is("deleted_at", null),
    sb.from("sessions").select("id", { count: "exact", head: true }).eq("therapist_id", id).is("deleted_at", null),
    sb.from("sessions").select("id", { count: "exact", head: true }).eq("therapist_id", id).eq("status", "completed"),
  ]);

  return {
    ...data,
    clientCount: clientCount.count ?? 0,
    sessionCount: sessionCount.count ?? 0,
    completedCount: completedCount.count ?? 0,
  };
}

export async function getWaitlist() {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getRecentSessions(limit = 50) {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("sessions")
    .select("id, therapist_id, client_id, status, starts_at, ends_at, duration_mins, created_at")
    .is("deleted_at", null)
    .order("starts_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getSignupsByDay(days = 30) {
  const sb = createAdminClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await sb
    .from("therapists")
    .select("created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const byDay: Record<string, number> = {};
  (data ?? []).forEach((t) => {
    const day = t.created_at.slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + 1;
  });

  return Object.entries(byDay).map(([date, count]) => ({ date, count }));
}
