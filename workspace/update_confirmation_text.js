const fs = require('fs');

const breakdownPageFile = 'workspace/web-app/src/app/pages/BreakdownPage.tsx';
let bpContent = fs.readFileSync(breakdownPageFile, 'utf8');

// Update confirmationLabel logic
bpContent = bpContent.replace(
  /function confirmationLabel\(row: \{ agentConfirmed: boolean; tlConfirmed: boolean \}\) \{\n\s*if \(row\.agentConfirmed && row\.tlConfirmed\) return "Confirmed";\n\s*if \(row\.agentConfirmed\) return "TL pending";\n\s*if \(row\.tlConfirmed\) return "Agent pending";\n\s*return "Agent\/TL pending";\n\s*\}/,
  `function confirmationLabel(row: { agentConfirmed: boolean; tlConfirmed: boolean }) {
    if (row.agentConfirmed && row.tlConfirmed) return "Confirmed";
    if (row.agentConfirmed) return "TL Pending";
    if (row.tlConfirmed) return "Agent Pending";
    return "Agent Pending";
  }`
);

fs.writeFileSync(breakdownPageFile, bpContent);
console.log('BreakdownPage updated.');

const commissionFile = 'workspace/web-app/src/app/pages/CommissionBreakdown.tsx';
let cbContent = fs.readFileSync(commissionFile, 'utf8');

// Replace "Commission breakdown confirmed" with "Breakdown Confirmed"
cbContent = cbContent.replace(
  /toast\.success\("Commission breakdown confirmed"\);/g,
  'toast.success("Breakdown Confirmed");'
);

fs.writeFileSync(commissionFile, cbContent);
console.log('CommissionBreakdown updated.');
