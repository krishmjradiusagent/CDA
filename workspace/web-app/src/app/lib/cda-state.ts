export type CdaState = "none" | "generated" | "sent" | "signed";

export type LogEntry = {
  action: CdaState;
  ts: string;
  actor: string;
  version?: string;
  note?: string;
};

export function cdaStateStyle(state: CdaState) {
  switch (state) {
    case "none":
      return { label: "No CDA yet", cls: "bg-neutral-100 text-neutral-600 border-neutral-300" };
    case "generated":
      return { label: "Generated", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "sent":
      return { label: "Sent", cls: "bg-blue-50 text-blue-700 border-blue-200" };
    case "signed":
      return { label: "Signed", cls: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  }
}

export const defaultActivityLog: LogEntry[] = [];
