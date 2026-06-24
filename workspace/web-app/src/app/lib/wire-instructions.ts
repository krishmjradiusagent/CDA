export type WireAccountType = "checking" | "savings";
export type CDAType =
  | "full-transparency"
  | "team-hidden"
  | "radius-hidden"
  | "full-gross";

export type WireInstructionRecord = {
  id: string;
  payableName?: string;
  accountHolderName: string;
  email: string;
  phone: string;
  recipientStreet: string;
  recipientStreet2: string;
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

export const WIRE_INSTRUCTIONS_STORAGE_KEY = "radius-cda-wire-instructions-v4";

export function createEmptyWireInstruction(id?: string): WireInstructionRecord {
  return {
    id: id ?? crypto.randomUUID(),
    payableName: "",
    accountHolderName: "",
    email: "",
    phone: "",
    recipientStreet: "",
    recipientStreet2: "",
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
  const now = new Date().toISOString();
  const teamWire: WireInstructionRecord = {
    ...createEmptyWireInstruction("team-wire"),
    payableName: "Radius Brokerage LLC",
    accountHolderName: "Radius Brokerage LLC",
    email: "ops@radiusagent.com",
    phone: "+1 415-555-0100",
    bankName: "JPMorgan Chase",
    routingNumber: "021000021",
    accountNumber: "874512309",
    accountType: "checking",
    bankStreet: "270 Park Avenue",
    bankCity: "New York",
    bankState: "NY",
    bankZip: "10017",
    updatedAt: now,
  };
  const firstAgentId = agentIds[0];
  const myAgentWire: WireInstructionRecord = {
    ...createEmptyWireInstruction(`agent-wire-${firstAgentId ?? teamLeadAgentId}`),
    accountHolderName: "Ila Corcoran",
    email: "ila@radiusagent.com",
    bankName: "Bank of America",
    routingNumber: "121000358",
    accountNumber: "552093481",
    accountType: "checking",
    updatedAt: now,
  };
  const sharedRecipients: WireInstructionRecord[] = [
    {
      ...createEmptyWireInstruction("shared-escrow-1"),
      payableName: "First American Title Co.",
      accountHolderName: "First American Title Co.",
      email: "escrow@firstam.com",
      bankName: "Wells Fargo",
      routingNumber: "121000248",
      accountNumber: "411902876",
      accountType: "checking",
      updatedAt: now,
    },
    {
      ...createEmptyWireInstruction("shared-vendor-1"),
      payableName: "Bay Area Home Inspections",
      accountHolderName: "Bay Area Home Inspections",
      email: "billing@bayareahi.com",
      recipientStreet: "1 Market Street",
      recipientStreet2: "Suite 200",
      recipientCity: "San Francisco",
      recipientState: "CA",
      recipientZip: "94105",
      updatedAt: now,
    },
  ];
  const privateRecipients: Record<string, WireInstructionRecord[]> = {
    [firstAgentId ?? teamLeadAgentId]: [
      {
        ...createEmptyWireInstruction("private-tc-1"),
        payableName: "Sandra's TC Services",
        accountHolderName: "Sandra Martinez",
        email: "sandra@tcservices.com",
        bankName: "Chase",
        routingNumber: "322271627",
        accountNumber: "199384720",
        accountType: "checking",
        updatedAt: now,
      },
      {
        ...createEmptyWireInstruction("private-photog-1"),
        payableName: "Lens & Light Photography",
        accountHolderName: "Marcus Lee",
        email: "marcus@lensandlight.com",
        recipientStreet: "455 Valencia St",
        recipientCity: "San Francisco",
        recipientState: "CA",
        recipientZip: "94103",
        updatedAt: now,
      },
    ],
  };
  return {
    teamLeadAgentId,
    teamWireInstructions: teamWire,
    agentWireInstructions: agentIds.reduce<Record<string, WireInstructionRecord>>((acc, agentId) => {
      acc[agentId] = agentId === firstAgentId ? myAgentWire : createEmptyWireInstruction(`agent-wire-${agentId}`);
      return acc;
    }, {}),
    sharedRecipients,
    privateRecipients,
    notifications: [],
  };
}

export function validateWireInstruction(record: WireInstructionRecord, options: WireValidationOptions = {}): WireValidationErrors {
  const errors: WireValidationErrors = {};
  const enforceBankDetails = options.requireBankDetails ?? false;

  if (!(record.accountHolderName || "").trim()) errors.accountHolderName = "Account holder required";
  
  if (enforceBankDetails) {
    if (!(record.bankName || "").trim()) errors.bankName = "Bank name required";
    if (!/^\d{9}$/.test((record.routingNumber || "").trim())) errors.routingNumber = "Routing number must be 9 digits";
    if (!(record.accountNumber || "").trim()) errors.accountNumber = "Account number required";
  }

  if (options.requireCdaType && !record.cdaType) errors.cdaType = "CDA type required";
  
  return errors;
}

export function isWireInstructionComplete(record: WireInstructionRecord, options: WireValidationOptions = {}) {
  return Object.keys(validateWireInstruction(record, { requireBankDetails: true, ...options })).length === 0;
}

export function maskSensitiveValue(value: string, _visibleDigits = 4) {
  if (!value) return "Not provided";
  return value;
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
