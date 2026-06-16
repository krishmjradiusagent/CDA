export const CDA_TYPE_OPTIONS = [
  { key: "buyer", label: "Purchase" },
  { key: "listing", label: "Listing" },
  { key: "seller", label: "Seller" },
  { key: "referral", label: "Referral" },
  { key: "lease", label: "Lease" },
  { key: "lease-listing", label: "Lease listing" },
  { key: "landlord", label: "Landlord" },
] as const;

const CDA_TYPE_LABELS = Object.fromEntries(
  CDA_TYPE_OPTIONS.map((option) => [option.key, option.label]),
) as Record<string, string>;

export function getCdaTypeLabel(key: string): string {
  return CDA_TYPE_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

export const COMMISSION_BREAKDOWN_TYPE_OPTIONS = CDA_TYPE_OPTIONS.filter((option) =>
  ["buyer", "listing", "referral", "lease", "lease-listing"].includes(option.key),
);

export const PLAN_DEAL_TYPE_OPTIONS = CDA_TYPE_OPTIONS.filter((option) =>
  ["buyer", "seller", "lease", "landlord"].includes(option.key),
);