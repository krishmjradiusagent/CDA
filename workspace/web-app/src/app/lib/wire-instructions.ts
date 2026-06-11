export type WireAccountType = "checking" | "savings";
export type CDAType =
  | "full-transparency"
  | "radius-split-hidden-partner"
  | "radius-split-hidden-associate"
  | "team-split-hidden-partner"
  | "gross-cda";

export type WireInstructionRecord = {
  accountHolderName: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: WireAccountType;
  cdaType: CDAType | "";
  bankStreet: string;
  bankCity: string;
  bankState: string;
  bankZip: string;
  specialInstructions: string;
  updatedAt: string | null;
};

export type WireCompletionNotification = {
  id: string;
  agentId: string;
  agentName: string;
  createdAt: string;
  read: boolean;
};

export type WireInstructionsStore = {
  teamLeadAgentId: string;
  teamWireInstructions: WireInstructionRecord;
  agentWireInstructions: Record<string, WireInstructionRecord>;
  notifications: WireCompletionNotification[];
};

export type WireValidationErrors = Partial<
  Record<
    | "accountHolderName"
    | "bankName"
    | "routingNumber"
    | "accountNumber"
    | "cdaType"
    | "bankStreet"
    | "bankCity"
    | "bankState"
    | "bankZip",
    string
  >
>;

type WireValidationOptions = {
  requireCdaType?: boolean;
};

export const WIRE_INSTRUCTIONS_STORAGE_KEY = "radius-cda-wire-instructions-v1";

export function createEmptyWireInstruction(): WireInstructionRecord {
  return {
    accountHolderName: "",
    bankName: "",
    routingNumber: "",
    accountNumber: "",
    accountType: "checking",
    cdaType: "",
    bankStreet: "",
    bankCity: "",
    bankState: "",
    bankZip: "",
    specialInstructions: "",
    updatedAt: null,
  };
}

export function createDefaultWireInstructionsStore(teamLeadAgentId: string, agentIds: string[]): WireInstructionsStore {
  return {
    teamLeadAgentId,
    teamWireInstructions: createEmptyWireInstruction(),
    agentWireInstructions: agentIds.reduce<Record<string, WireInstructionRecord>>((acc, agentId) => {
      acc[agentId] = createEmptyWireInstruction();
      return acc;
    }, {}),
    notifications: [],
  };
}

export function validateWireInstruction(record: WireInstructionRecord, options: WireValidationOptions = {}): WireValidationErrors {
  const errors: WireValidationErrors = {};
  if (!record.accountHolderName.trim()) errors.accountHolderName = "Account holder required";
  if (!record.bankName.trim()) errors.bankName = "Bank name required";
  if (!/^\d{9}$/.test(record.routingNumber.trim())) errors.routingNumber = "Routing number must be 9 digits";
  if (!record.accountNumber.trim()) errors.accountNumber = "Account number required";
  if (options.requireCdaType && !record.cdaType) errors.cdaType = "CDA type required";
  if (!record.bankStreet.trim()) errors.bankStreet = "Street required";
  if (!record.bankCity.trim()) errors.bankCity = "City required";
  if (!record.bankState.trim()) errors.bankState = "State required";
  if (!record.bankZip.trim()) errors.bankZip = "ZIP required";
  return errors;
}

export function isWireInstructionComplete(record: WireInstructionRecord, options: WireValidationOptions = {}) {
  return Object.keys(validateWireInstruction(record, options)).length === 0;
}

export function maskSensitiveValue(value: string, visibleDigits = 4) {
  if (!value) return "Not provided";
  if (value.length <= visibleDigits) return value;
  return `${"•".repeat(Math.max(value.length - visibleDigits, 0))}${value.slice(-visibleDigits)}`;
}

export function readWireInstructionsStore(fallback: WireInstructionsStore): WireInstructionsStore {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(WIRE_INSTRUCTIONS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<WireInstructionsStore>;
    return {
      teamLeadAgentId: parsed.teamLeadAgentId ?? fallback.teamLeadAgentId,
      teamWireInstructions: { ...createEmptyWireInstruction(), ...(parsed.teamWireInstructions ?? {}) },
      agentWireInstructions: {
        ...fallback.agentWireInstructions,
        ...Object.fromEntries(
          Object.entries(parsed.agentWireInstructions ?? {}).map(([agentId, record]) => [
            agentId,
            { ...createEmptyWireInstruction(), ...record },
          ]),
        ),
      },
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : fallback.notifications,
    };
  } catch {
    return fallback;
  }
}

export function writeWireInstructionsStore(store: WireInstructionsStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WIRE_INSTRUCTIONS_STORAGE_KEY, JSON.stringify(store));
}
