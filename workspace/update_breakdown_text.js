const fs = require('fs');

const file = 'workspace/web-app/src/app/pages/CommissionBreakdown.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace "Pre-split deduction" with "Add Credit or Referral"
content = content.replace(
  /<Plus className="size-3\.5 mr-1" \/>Pre-split deduction/g,
  '<Plus className="size-3.5 mr-1" />Add Credit or Referral'
);

// We need to add the Landmark icon to deduction names
// Look for <p className="text-xs text-muted-foreground">{ded.name}</p>
// Replace with <p className="text-xs text-muted-foreground">{ded.name}</p><Landmark className="size-3 text-muted-foreground ml-1" />

content = content.replace(
  /<p className="text-xs text-muted-foreground">\{ded\.name\}<\/p>/g,
  '<p className="text-xs text-muted-foreground">{ded.name}</p>\\n                        <Landmark className="size-3 text-muted-foreground ml-1 cursor-pointer hover:text-foreground" onClick={() => setShowWireSheet(true)} title="View Wiring Status" />'
);

fs.writeFileSync(file, content);
console.log('CommissionBreakdown updated.');
