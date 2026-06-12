const fs = require('fs');

// 1. Update wire-instructions.ts
const wireFile = 'workspace/web-app/src/app/lib/wire-instructions.ts';
let wireContent = fs.readFileSync(wireFile, 'utf8');

wireContent = wireContent.replace(
  /export type CDAType =[\s\S]*?\| "gross-cda";/,
  `export type CDAType =
  | "full-transparency"
  | "team-hidden"
  | "radius-hidden"
  | "full-gross";`
);

fs.writeFileSync(wireFile, wireContent);
console.log('wire-instructions.ts updated.');

// 2. Update CDASettings.tsx
const settingsFile = 'workspace/web-app/src/app/pages/CDASettings.tsx';
let settingsContent = fs.readFileSync(settingsFile, 'utf8');

settingsContent = settingsContent.replace(
  /const TEAM_CDA_TYPE_OPTIONS: Array<\{ value: CDAType; label: string \}> = \[[\s\S]*?\];/,
  `const TEAM_CDA_TYPE_OPTIONS: Array<{ value: CDAType; label: string }> = [
  { value: "full-transparency", label: "Full Transparency" },
  { value: "team-hidden", label: "Team Hidden" },
  { value: "radius-hidden", label: "Radius Hidden" },
  { value: "full-gross", label: "Full Gross" },
];`
);

settingsContent = settingsContent.replace(
  /function formatCdaType\(cdaType: WireInstructionRecord\["cdaType"\]\) \{[\s\S]*?return "Not specified";\n\}/,
  `function formatCdaType(cdaType: WireInstructionRecord["cdaType"]) {
  if (!cdaType) return "Not specified";
  const option = TEAM_CDA_TYPE_OPTIONS.find((o) => o.value === cdaType);
  return option?.label || cdaType;
}`
);

fs.writeFileSync(settingsFile, settingsContent);
console.log('CDASettings.tsx updated.');

// 3. Update CommissionBreakdown.tsx
const breakdownFile = 'workspace/web-app/src/app/pages/CommissionBreakdown.tsx';
let cbContent = fs.readFileSync(breakdownFile, 'utf8');

cbContent = cbContent.replace(
  /<SelectItem value="full-transparency">Full Transparency<\/SelectItem>[\s\S]*?<SelectItem value="gross-cda">Gross CDA<\/SelectItem>/,
  `<SelectItem value="full-transparency">Full Transparency</SelectItem>
                                <SelectItem value="team-hidden">Team Hidden</SelectItem>
                                <SelectItem value="radius-hidden">Radius Hidden</SelectItem>
                                <SelectItem value="full-gross">Full Gross</SelectItem>`
);

// Add state for auditor selected CDA Type in PDF Preview
if (!cbContent.includes('const [pdfCdaType, setPdfCdaType]')) {
  cbContent = cbContent.replace(
    'const [showPdfPreview, setShowPdfPreview] = useState(false);',
    'const [showPdfPreview, setShowPdfPreview] = useState(false);\n  const [pdfCdaType, setPdfCdaType] = useState<CDAType | "">("full-transparency");'
  );
  
  // When opening PDF preview, default to team wire cda type
  cbContent = cbContent.replace(
    /onClick=\{\(\) => setShowPdfPreview\(true\)\}/g,
    'onClick={() => { setPdfCdaType(teamWireDraft.cdaType || "full-transparency"); setShowPdfPreview(true); }}'
  );
  
  // Add auditor override dropdown to PDF Preview header
  const pdfHeaderRegex = /<Button variant="outline" className="h-11 rounded-\[10px\] px-5 text-\[15px\] text-slate-700" onClick=\{\(\) => window\.print\(\)\}>/g;
  cbContent = cbContent.replace(pdfHeaderRegex, 
    `{isAuditor && (
                  <div className="flex items-center gap-2 mr-4">
                    <span className="text-sm font-medium text-slate-600">CDA Type:</span>
                    <Select value={pdfCdaType} onValueChange={(v) => setPdfCdaType(v as CDAType)}>
                      <SelectTrigger className="w-[180px] h-10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-transparency">Full Transparency</SelectItem>
                        <SelectItem value="team-hidden">Team Hidden</SelectItem>
                        <SelectItem value="radius-hidden">Radius Hidden</SelectItem>
                        <SelectItem value="full-gross">Full Gross</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button variant="outline" className="h-11 rounded-[10px] px-5 text-[15px] text-slate-700" onClick={() => window.print()}>`
  );
}

fs.writeFileSync(breakdownFile, cbContent);
console.log('CommissionBreakdown.tsx updated.');
