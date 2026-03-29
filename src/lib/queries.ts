import { createClient } from "./supabase/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8095";

async function adminFetch<T = unknown>(path: string, params?: Record<string, string>): Promise<T> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${session?.access_token ?? ""}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Admin API error ${res.status}: ${body}`);
  }

  return res.json();
}

export interface PlatformStats {
  total_therapists: number;
  total_clients: number;
  total_sessions: number;
  completed_sessions: number;
  waitlist_count: number;
  new_therapists_30d: number;
  new_clients_30d: number;
}

export interface TherapistRow {
  id: string;
  full_name: string;
  display_name: string | null;
  phone: string | null;
  slug: string;
  timezone: string;
  booking_page_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WaitlistRow {
  id: string;
  email: string;
  source: string;
  created_at: string;
}

export interface SessionRow {
  id: string;
  therapist_id: string;
  client_id: string;
  status: string;
  starts_at: string;
  ends_at: string;
  duration_mins: number;
  created_at: string;
}

export interface SignupDay {
  date: string;
  count: number;
}

export interface TherapistDetail extends TherapistRow {
  qualifications: string | null;
  client_count: number;
  session_count: number;
  completed_count: number;
}

export function getPlatformStats() {
  return adminFetch<PlatformStats>("/api/v1/admin/stats");
}

export function getTherapists() {
  return adminFetch<TherapistRow[]>("/api/v1/admin/therapists");
}

export function getTherapistDetail(id: string) {
  return adminFetch<TherapistDetail>(`/api/v1/admin/therapists/${id}`);
}

export function getWaitlist() {
  return adminFetch<WaitlistRow[]>("/api/v1/admin/waitlist");
}

export function getRecentSessions(limit = 50) {
  return adminFetch<SessionRow[]>("/api/v1/admin/sessions/recent", { limit: String(limit) });
}

export function getSignupsByDay(days = 30) {
  return adminFetch<SignupDay[]>("/api/v1/admin/signups-by-day", { days: String(days) });
}

export interface ClientStats {
  total: number;
  active: number;
  inactive: number;
  categories: { category: string; count: number }[];
  growth_by_month: { month: string; count: number }[];
}

export function getClientStats() {
  return adminFetch<ClientStats>("/api/v1/admin/clients/stats");
}
