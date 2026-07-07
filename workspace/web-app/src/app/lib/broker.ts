export type BrokerId = "roger" | "kathy" | "rhonda" | "eric" | "kevin";

export type Broker = {
  id: BrokerId;
  name: string;
  title: string;
  sigSrc?: string;
};

const BROKERS: Record<BrokerId, Broker> = {
  roger:  { id: "roger",  name: "Roger Zelaya",    title: "Managing Broker", sigSrc: "/signatures/roger.png" },
  kathy:  { id: "kathy",  name: "Katherine Rzad",  title: "Managing Broker", sigSrc: "/signatures/kathy.png" },
  rhonda: { id: "rhonda", name: "Rhonda Morgan",   title: "Managing Broker", sigSrc: "/signatures/rhonda.png" },
  eric:   { id: "eric",   name: "Eric Eckardt",    title: "Managing Broker", sigSrc: "/signatures/eric.png" },
  kevin:  { id: "kevin",  name: "Kevin Kieffer",   title: "Managing Broker (Transitional)", sigSrc: "/signatures/kevin.png" },
};

const KATHY_STATES = new Set(["TX", "WA", "CO", "FL", "AZ"]);

export function resolveBroker(state?: string, team?: string, ericLicensed = false): Broker {
  const s = (state || "").trim().toUpperCase();
  const t = (team || "").trim().toLowerCase();

  if (s === "GA" && t === "indigo-road") return BROKERS.rhonda;
  if (s === "GA") return BROKERS.kathy;
  if (s === "CA") return BROKERS.roger;
  if (s === "NY") return ericLicensed ? BROKERS.eric : BROKERS.kevin;
  if (KATHY_STATES.has(s)) return BROKERS.kathy;
  return BROKERS.kathy;
}

export function stateFromAddress(address?: string): string | undefined {
  if (!address) return undefined;
  const map: Record<string, string> = {
    california: "CA", texas: "TX", "new york": "NY", georgia: "GA",
    arizona: "AZ", florida: "FL", washington: "WA", colorado: "CO",
  };
  const lower = address.toLowerCase();
  for (const key of Object.keys(map)) {
    if (lower.includes(key)) return map[key];
  }
  const m = address.match(/,\s*([A-Z]{2})[\s,]/);
  return m ? m[1] : undefined;
}

export function formatGenDate(d = new Date()): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
