"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, PauseCircle, CalendarPlus, Loader2 } from "lucide-react";

type Action = "activate" | "suspend" | "extend";

interface PlanActionsProps {
  therapistId: string;
  currentStatus: string;
}

const ENDPOINTS: Record<Action, string> = {
  activate: "activate-plan",
  suspend: "suspend",
  extend: "extend-plan",
};

export default function PlanActions({ therapistId, currentStatus }: PlanActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(action: Action) {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}/${ENDPOINTS[action]}`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || "Request failed");
      }
      setStatus(action === "suspend" ? "suspended" : "active");
      // Refresh the route so the new plan_expires_at column updates without a manual reload.
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {status !== "active" && (
        <button
          onClick={() => handleAction("activate")}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors disabled:opacity-50"
          aria-label="Activate plan for 30 days"
          title="Activate plan (30 days)"
        >
          {loading === "activate" ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <CheckCircle2 size={11} />
          )}
          Activate
        </button>
      )}
      {status === "active" && (
        <button
          onClick={() => handleAction("extend")}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-sage-bg text-sage hover:bg-sage/20 transition-colors disabled:opacity-50"
          aria-label="Extend plan by 30 days"
          title="Extend plan by 30 days"
        >
          {loading === "extend" ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <CalendarPlus size={11} />
          )}
          +30 days
        </button>
      )}
      {status !== "suspended" && (
        <button
          onClick={() => handleAction("suspend")}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-warning/10 text-warning hover:bg-warning/20 transition-colors disabled:opacity-50"
          aria-label="Suspend plan"
          title="Suspend plan"
        >
          {loading === "suspend" ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <PauseCircle size={11} />
          )}
          Suspend
        </button>
      )}
      {error && (
        <span role="alert" className="text-[10px] text-error">{error}</span>
      )}
    </div>
  );
}
