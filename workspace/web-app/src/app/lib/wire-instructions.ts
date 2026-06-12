export type WireAccountType = "checking" | "savings";
export type CDAType =
  | "full-transparency"
  | "team-hidden"
  | "radius-hidden"
  | "full-gross";

export type WireInstructionRecord = {
  id: string;
  accountHolderName: string;
  email: string;
  phone: string;
  recipientStreet: string;
  recipientCity: string;
  recipientState: string;
  recipientZip: string;
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
  sharedRecipients: WireInstructionRecord[];
  privateRecipients: Record<string, WireInstructionRecord[]>;
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
  requireBankDetails?: boolean;
};

export const WIRE_INSTRUCTIONS_STORAGE_KEY = "radius-cda-wire-instructions-v1";

export function createEmptyWireInstruction(id?: string): WireInstructionRecord {
  return {
    id: id ?? crypto.randomUUID(),
    accountHolderName: "",
    email: "",
    phone: "",
    recipientStreet: "",
    recipientCity: "",
    recipientState: "",
    recipientZip: "",
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
    teamWireInstructions: createEmptyWireInstruction("team-wire"),
    agentWireInstructions: agentIds.reduce<Record<string, WireInstructionRecord>>((acc, agentId) => {
      acc[agentId] = createEmptyWireInstruction(`agent-wire-${agentId}`);
      return acc;
    }, {}),
    sharedRecipients: [],
    privateRecipients: {},
    notifications: [],
  };
}

export function validateWireInstruction(record: WireInstructionRecord, options: WireValidationOptions = {}): WireValidationErrors {
  const errors: WireValidationErrors = {};
  const enforceBankDetails = options.requireBankDetails ?? false;

  // Only name is mandatory across all forms now based on requirements.
  if (!record.accountHolderName.trim()) errors.accountHolderName = "Account holder required";
  
  if (enforceBankDetails) {
    // Bank details are optional per new requirements. Only name is required.
    // if (!record.bankName.trim()) errors.bankName = "Bank name required";
    // if (!/^\d{9}$/.test(record.routingNumber.trim())) errors.routingNumber = "Routing number must be 9 digits";
    // if (!record.accountNumber.trim()) errors.accountNumber = "Account number required";
    // if (!record.bankStreet.trim()) errors.bankStreet = "Street required";
    // if (!record.bankCity.trim()) errors.bankCity = "City required";
    // if (!record.bankState.trim()) errors.bankState = "State required";
    // if (!record.bankZip.trim()) errors.bankZip = "ZIP required";
  }

  if (options.requireCdaType && !record.cdaType) errors.cdaType = "CDA type required";
  
  return errors;
}

export function isWireInstructionComplete(record: WireInstructionRecord, options: WireValidationOptions = {}) {
  return Object.keys(validateWireInstruction(record, { requireBankDetails: true, ...options })).length === 0;
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
      teamWireInstructions: { ...createEmptyWireInstruction("team-wire"), ...(parsed.teamWireInstructions ?? {}) },
      agentWireInstructions: {
        ...fallback.agentWireInstructions,
        ...Object.fromEntries(
          Object.entries(parsed.agentWireInstructions ?? {}).map(([agentId, record]) => [
            agentId,
            { ...createEmptyWireInstruction(`agent-wire-${agentId}`), ...record },
          ]),
        ),
      },
      sharedRecipients: Array.isArray(parsed.sharedRecipients) 
        ? parsed.sharedRecipients.map(r => ({ ...createEmptyWireInstruction(r.id), ...r }))
        : fallback.sharedRecipients,
      privateRecipients: typeof parsed.privateRecipients === 'object' && parsed.privateRecipients !== null
        ? Object.fromEntries(
            Object.entries(parsed.privateRecipients).map(([agentId, records]) => [
              agentId,
              Array.isArray(records) ? records.map(r => ({ ...createEmptyWireInstruction(r.id), ...r })) : [],
            ])
          )
        : fallback.privateRecipients,
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
