import type { CalculationLine } from "../components/finance/calculation-breakdown-tooltip";

type SideDeduction = { id: string; name: string; amount: number };
type AgentDeduction = { id: string; name: string; amount: number };

type AgentSummary = {
  agent: { id: string; name: string };
  allocationPercent: number;
  commissionBasis: number;
  afterPreSplit: number;
  split: number;
  splitRate: number;
  radiusFee: number;
  postSplitAgentCommission: number;
  postSplitDeductionsTotal: number;
  netCommission: number;
  companyDollarContribution: number;
};

type SideSummary = {
  grossCommission: number;
  grossCommissionAfterDeductions: number;
  toAgents: number;
  officeIncome: number;
  agents: AgentSummary[];
};

export function buildGrossCommissionLines(
  awardPercent: number,
  awardAmountAdjustment: number,
  transactionGross: number,
  finalAmount: number,
): CalculationLine[] {
  const allocated = transactionGross * (awardPercent / 100);
  const lines: CalculationLine[] = [
    { label: `Transaction gross × ${Math.round(awardPercent)}%`, amount: allocated, kind: "start" },
  ];
  if (awardAmountAdjustment > 0) {
    lines.push({ label: "Award adjustment", amount: awardAmountAdjustment, kind: "add" });
  }
  lines.push({ label: "Gross commission", amount: finalAmount, kind: "final" });
  return lines;
}

export function buildGrossAfterDeductionsLines(
  grossCommission: number,
  deductions: SideDeduction[],
  finalAmount: number,
): CalculationLine[] {
  const lines: CalculationLine[] = [
    { label: "Gross commission", amount: grossCommission, kind: "start" },
  ];
  deductions.forEach((ded) => {
    lines.push({ label: ded.name, amount: ded.amount, kind: "subtract" });
  });
  lines.push({ label: "After deductions", amount: finalAmount, kind: "final" });
  return lines;
}

export function buildCommissionBasisLines(
  sideSummary: SideSummary,
  agentSummary: AgentSummary,
  showFullBreakdown: boolean,
): CalculationLine[] {
  const lines: CalculationLine[] = [
    { label: "Gross after deductions", amount: sideSummary.grossCommissionAfterDeductions, kind: "start" },
  ];

  if (sideSummary.agents.length <= 1) {
    lines.push({ label: "Commission basis", amount: agentSummary.commissionBasis, kind: "final" });
    return lines;
  }

  if (showFullBreakdown) {
    sideSummary.agents.forEach((agent) => {
      lines.push({
        label: `${agent.agent.name} (${Math.round(agent.allocationPercent)}%)`,
        amount: agent.commissionBasis,
        kind: "add",
      });
    });
  } else {
    lines.push({
      label: `Your share (${Math.round(agentSummary.allocationPercent)}%)`,
      amount: agentSummary.commissionBasis,
      kind: "add",
    });
  }

  lines.push({ label: "Commission basis", amount: agentSummary.commissionBasis, kind: "final" });
  return lines;
}

export function buildAgentNetLines(
  agentSummary: AgentSummary,
  preSplitDeductions: AgentDeduction[],
  postSplitDeductions: AgentDeduction[],
): CalculationLine[] {
  const lines: CalculationLine[] = [
    { label: "Commission basis", amount: agentSummary.commissionBasis, kind: "start" },
  ];

  preSplitDeductions.forEach((ded) => {
    lines.push({ label: ded.name, amount: ded.amount, kind: "subtract" });
  });

  lines.push({
    label: `Team split (${Math.round(agentSummary.splitRate * 100)}%)`,
    amount: agentSummary.split,
    kind: "subtract",
  });

  postSplitDeductions.forEach((ded) => {
    lines.push({ label: ded.name, amount: ded.amount, kind: "subtract" });
  });

  lines.push({ label: "Net commission", amount: agentSummary.netCommission, kind: "final" });
  return lines;
}

export function buildTeamSplitLines(agentSummary: AgentSummary): CalculationLine[] {
  return [
    { label: "After pre-split", amount: agentSummary.afterPreSplit, kind: "start" },
    {
      label: `Team split (${Math.round(agentSummary.splitRate * 100)}%)`,
      amount: agentSummary.split,
      kind: "subtract",
    },
    { label: "Post-split commission", amount: agentSummary.postSplitAgentCommission, kind: "final" },
  ];
}

export function buildTeamDollarLines(agentSummary: AgentSummary): CalculationLine[] {
  return [
    { label: "Team split", amount: agentSummary.split, kind: "start" },
    { label: "Radius fee", amount: agentSummary.radiusFee, kind: "subtract" },
    { label: "Team dollar contribution", amount: agentSummary.companyDollarContribution, kind: "final" },
  ];
}

export function buildToAgentsLines(
  agents: AgentSummary[],
  total: number,
  showFullBreakdown: boolean,
  scopedAgentId?: string,
  finalLabel = "To agents",
): CalculationLine[] {
  const visibleAgents = scopedAgentId
    ? agents.filter((agent) => agent.agent.id === scopedAgentId)
    : agents;

  if (visibleAgents.length === 0) return [];

  const finalAmount = !showFullBreakdown && scopedAgentId
    ? visibleAgents[0].netCommission
    : total;

  const lines: CalculationLine[] = visibleAgents.map((agent, index) => ({
    label: showFullBreakdown ? `${agent.agent.name} net` : "Your net commission",
    amount: agent.netCommission,
    kind: index === 0 ? "start" : "add",
  }));

  lines.push({ label: finalLabel, amount: finalAmount, kind: "final" });
  return lines;
}

export function buildTeamIncomeLines(
  sideSummary: SideSummary,
  showFullBreakdown: boolean,
  scopedAgentId?: string,
): CalculationLine[] {
  const lines: CalculationLine[] = [
    { label: "Gross after deductions", amount: sideSummary.grossCommissionAfterDeductions, kind: "start" },
  ];

  const visibleAgents = scopedAgentId
    ? sideSummary.agents.filter((agent) => agent.agent.id === scopedAgentId)
    : sideSummary.agents;

  visibleAgents.forEach((agent) => {
    const label = showFullBreakdown
      ? `${agent.agent.name} post-split`
      : "Your post-split commission";
    lines.push({ label, amount: agent.postSplitAgentCommission, kind: "subtract" });
  });

  lines.push({ label: "Team income", amount: sideSummary.officeIncome, kind: "final" });
  return lines;
}

export function buildSideTotalLines(
  sideSummary: SideSummary,
  showFullBreakdown: boolean,
  scopedAgentId?: string,
  preSplitDeductions: Record<string, AgentDeduction[]> = {},
  postSplitDeductions: Record<string, AgentDeduction[]> = {},
): CalculationLine[] {
  const visibleAgents = scopedAgentId
    ? sideSummary.agents.filter((agent) => agent.agent.id === scopedAgentId)
    : sideSummary.agents;

  if (visibleAgents.length === 0) return [];

  const finalAmount = showFullBreakdown
    ? sideSummary.toAgents
    : (sideSummary.agents.find((agent) => agent.agent.id === scopedAgentId)?.netCommission ?? sideSummary.toAgents);

  if (visibleAgents.length === 1) {
    const agent = visibleAgents[0];
    const lines = buildAgentNetLines(
      agent,
      preSplitDeductions[agent.agent.id] ?? [],
      postSplitDeductions[agent.agent.id] ?? [],
    );
    const lastIndex = lines.length - 1;
    return lines.map((line, index) =>
      index === lastIndex ? { ...line, label: "Side total" } : line,
    );
  }

  return buildToAgentsLines(
    sideSummary.agents,
    finalAmount,
    showFullBreakdown,
    scopedAgentId,
    "Side total",
  );
}