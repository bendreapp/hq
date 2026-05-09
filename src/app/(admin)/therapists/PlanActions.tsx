"use client";

import { useState } from "react";
import { CheckCircle2, PauseCircle, Loader2 } from "lucide-react";

interface PlanActionsProps {
  therapistId: string;
  currentStatus: string;
}

export default function PlanActions({ therapistId, currentStatus }: PlanActionsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState<"activate" | "suspend" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(action: "activate" | "suspend") {
    setLoading(action);
    setError(null);
    try {
      const endpoint = action === "activate"
        ? `/api/admin/therapists/${therapistId}/activate-plan`
        : `/api/admin/therapists/${therapistId}/suspend`;

      const res = await fetch(endpoint, { method: "POST" });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || "Request failed");
      }
      setStatus(action === "activate" ? "active" : "suspended");
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
          title="Activate plan"
        >
          {loading === "activate" ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <CheckCircle2 size={11} />
          )}
          Activate
        </button>
      )}
      {status !== "suspended" && (
        <button
          onClick={() => handleAction("suspend")}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-warning/10 text-warning hover:bg-warning/20 transition-colors disabled:opacity-50"
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
        <span className="text-[10px] text-error">{error}</span>
      )}
    </div>
  );
}
