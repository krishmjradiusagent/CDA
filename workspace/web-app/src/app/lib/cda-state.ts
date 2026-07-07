export type CdaState = "generated" | "sent" | "regenerated" | "deleted";

export type LogEntry = {
  action: CdaState;
  ts: string;
  actor: string;
  version?: string;
  note?: string;
};

export function cdaStateStyle(state: CdaState) {
  switch (state) {
    case "generated":
      return { label: "Generated", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "sent":
      return { label: "Sent", cls: "bg-blue-50 text-blue-700 border-blue-200" };
    case "regenerated":
      return { label: "Regenerated", cls: "bg-amber-50 text-amber-700 border-amber-200" };
    case "deleted":
      return { label: "Deleted", cls: "bg-neutral-100 text-neutral-600 border-neutral-300 line-through" };
  }
}

export const defaultActivityLog: LogEntry[] = [
  { action: "generated", ts: "Jul 5, 03:10 PM", actor: "System", version: "v1", note: "Initial draft" },
  { action: "sent",      ts: "Jul 5, 04:20 PM", actor: "David Martinez", version: "v1", note: "Sent to closing party" },
  { action: "regenerated", ts: "Jul 7, 03:00 PM", actor: "David Martinez", version: "v2", note: "Split % edited by team lead" },
];
