import { createClient } from "./supabase/server";

const API_BASE = process.env.API_URL || "http://localhost:8095";

async function adminFetch<T = unknown>(path: string, params?: Record<string, string>): Promise<T> {
  const supabase = await createClient();

  // Validate the user first (server-side verification)
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  // Get session for the access token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("No valid session token");
  }

  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
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

async function adminPost<T = unknown>(path: string): Promise<T> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("No valid session token");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
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
  email: string | null;
  phone: string | null;
  slug: string;
  timezone: string;
  booking_page_active: boolean;
  plan_selected: string | null;
  plan_status: string;
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

export interface TherapistDetail {
  id: string;
  full_name: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  slug: string;
  timezone: string;
  qualifications: string | null;
  booking_page_active: boolean;
  plan_selected: string | null;
  plan_status: string;
  created_at: string;
  updated_at: string;
  client_count: number;
  session_count: number;
  completed_count: number;
  lead_count: number;
}

export interface LeadRow {
  id: string;
  full_name: string;
  email: string | null;
  therapist_name: string;
  status: string;
  source: string;
  created_at: string;
}

export interface RevenueStats {
  total_invoiced: number;
  total_collected: number;
  total_outstanding: number;
  invoice_count: number;
  paid_count: number;
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

export function getLeads() {
  return adminFetch<LeadRow[]>("/api/v1/admin/leads");
}

export function getRevenueStats() {
  return adminFetch<RevenueStats>("/api/v1/admin/revenue");
}

export function activatePlan(therapistId: string) {
  return adminPost<{ status: string }>(`/api/v1/admin/therapists/${therapistId}/activate-plan`);
}

export function suspendPlan(therapistId: string) {
  return adminPost<{ status: string }>(`/api/v1/admin/therapists/${therapistId}/suspend`);
}
