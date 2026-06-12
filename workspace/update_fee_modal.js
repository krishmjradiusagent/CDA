const fs = require('fs');
const file = 'workspace/web-app/src/app/components/finance/fee-builder-modal.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add new fields to FeeTypeDraft type
content = content.replace(
  /visibleOnCda: boolean;/,
  `coAgentDistribution: "split-equally" | "each-pays";\n  payableTo: "radius" | "team" | "external";\n  payableToExternalId?: string;`
);

// 2. Initialize new fields
content = content.replace(
  /visibleOnCda: shouldForceFeeVisibility\(timing, appliesToMode\)\n      \? true\n      : initialData\?.visibleOnCda \?\? true,/,
  `coAgentDistribution: initialData?.coAgentDistribution ?? "split-equally",\n    payableTo: initialData?.payableTo ?? "radius",\n    payableToExternalId: initialData?.payableToExternalId,`
);

// 3. Remove next.visibleOnCda update
content = content.replace(
  /next\.visibleOnCda = true;/,
  `// next.visibleOnCda = true;`
);

// 4. Find the Visible on CDA toggle in the JSX and replace it with Co-agent distribution & Payable To
const visibleOnCdaRegex = /\{!\(shouldForceFeeVisibility[\s\S]*?<\/div>\n              \}\)/;

const newFields = `
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Co-agent distribution</Label>
                  <Select value={draft.coAgentDistribution} onValueChange={(value: "split-equally" | "each-pays") => updateDraft({ coAgentDistribution: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="split-equally">Split equally</SelectItem>
                      <SelectItem value="each-pays">Each agent pays the same</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Payable to</Label>
                  <Select value={draft.payableTo} onValueChange={(value: "radius" | "team" | "external") => updateDraft({ payableTo: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="radius">Radius</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                    </SelectContent>
                  </Select>
                  {draft.payableTo === "external" && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">Select external recipient or add new</p>
                      <Button variant="outline" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => toast.info("Add new recipient modal opening...")}>
                        <Plus className="mr-2 h-4 w-4" /> Select / Add External Recipient
                      </Button>
                    </div>
                  )}
                </div>
              </div>
`;

content = content.replace(visibleOnCdaRegex, newFields);

fs.writeFileSync(file, content);
console.log('FeeBuilderModal updated.');
