const fs = require('fs');

const file = 'workspace/web-app/src/app/pages/CommissionBreakdown.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{selectedCapStatus !== "none" && \([\s\S]*?<\/Alert>\n\s*\}\)/;

const newBlock = `{selectedCapStatus !== "none" && (
                    <Alert className={cn(
                      "mb-4 border px-3 py-2",
                      selectedCapStatus === "reached"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : selectedCapStatus === "near"
                          ? "border-orange-200 bg-orange-50 text-orange-900"
                          : "border-blue-200 bg-blue-50 text-blue-900"
                    )}>
                      <AlertDescription className="text-[11px] leading-5">
                        <span className="font-semibold">
                          {selectedCapStatus === "reached" 
                            ? "Capped already. " 
                            : selectedCapStatus === "near"
                              ? "You will cap with this deal. "
                              : "Estimated Progress to Cap: "}
                        </span>
                        {selectedCapStatus === "reached"
                          ? \`\${currency(selectedCapUsed)} used of \${currency(selectedCapAmount)} cap.\`
                          : \`\${currency(selectedCapUsed + selectedAgent.capApplied)} of \${currency(selectedCapAmount)}.\`}
                      </AlertDescription>
                    </Alert>
                  )}`;

content = content.replace(regex, newBlock);

fs.writeFileSync(file, content);
console.log('Cap progress states updated.');
