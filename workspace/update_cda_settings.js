const fs = require('fs');

const file = 'workspace/web-app/src/app/pages/CDASettings.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace WireInstructionsFormCard
const formCardRegex = /function WireInstructionsFormCard\(\{[\s\S]*?\}\) \{[\s\S]*?\}\n\nfunction WireInstructionsSummaryCard/m;

const newFormCard = `function WireInstructionsFormCard({
  idPrefix,
  record,
  errors,
  revealSensitive,
  showCdaType = false,
  onToggleSensitive,
  onChange,
  onSave,
  onCancel,
}: {
  idPrefix: string;
  record: WireInstructionRecord;
  errors: WireValidationErrors;
  revealSensitive: boolean;
  showCdaType?: boolean;
  onToggleSensitive: () => void;
  onChange: (patch: Partial<WireInstructionRecord>) => void;
  onSave: () => void;
  onCancel?: () => void;
}) {
  const [activeSensitiveField, setActiveSensitiveField] = useState<"routingNumber" | "accountNumber" | null>(null);
  const showRoutingValue = revealSensitive || activeSensitiveField === "routingNumber";
  const showAccountValue = revealSensitive || activeSensitiveField === "accountNumber";

  return (
    <section className="flex flex-col gap-4">
      <Card className="rounded-[14px] border-border shadow-none">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={buildWireFieldId(idPrefix, "account-holder")} className="text-sm font-medium">Account Holder / Recipient Name *</Label>
              <Input
                id={buildWireFieldId(idPrefix, "account-holder")}
                value={record.accountHolderName}
                aria-invalid={Boolean(errors.accountHolderName)}
                onChange={(e) => onChange({ accountHolderName: e.target.value })}
                className="h-10"
              />
              {errors.accountHolderName && <p className="text-xs text-destructive">{errors.accountHolderName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={buildWireFieldId(idPrefix, "email")} className="text-sm font-medium">Email</Label>
              <Input
                id={buildWireFieldId(idPrefix, "email")}
                value={record.email || ""}
                onChange={(e) => onChange({ email: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={buildWireFieldId(idPrefix, "phone")} className="text-sm font-medium">Phone</Label>
              <Input
                id={buildWireFieldId(idPrefix, "phone")}
                value={record.phone || ""}
                onChange={(e) => onChange({ phone: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={buildWireFieldId(idPrefix, "recipient-street")} className="text-sm font-medium">Recipient Address</Label>
              <Input
                id={buildWireFieldId(idPrefix, "recipient-street")}
                value={record.recipientStreet || ""}
                placeholder="Street"
                onChange={(e) => onChange({ recipientStreet: e.target.value })}
                className="h-10 mb-2"
              />
              <div className="grid grid-cols-3 gap-2">
                <Input value={record.recipientCity || ""} placeholder="City" onChange={(e) => onChange({ recipientCity: e.target.value })} className="h-10 col-span-1" />
                <Input value={record.recipientState || ""} placeholder="State" onChange={(e) => onChange({ recipientState: e.target.value })} className="h-10 col-span-1" />
                <Input value={record.recipientZip || ""} placeholder="ZIP" onChange={(e) => onChange({ recipientZip: e.target.value })} className="h-10 col-span-1" />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <Separator className="my-2" />
              <h4 className="text-sm font-semibold mb-4">Banking Details (Optional for External)</h4>
            </div>

            <div className="space-y-2">
              <Label htmlFor={buildWireFieldId(idPrefix, "bank-name")} className="text-sm font-medium">Bank Name</Label>
              <Input
                id={buildWireFieldId(idPrefix, "bank-name")}
                value={record.bankName}
                aria-invalid={Boolean(errors.bankName)}
                onChange={(e) => onChange({ bankName: e.target.value })}
                className="h-10"
              />
              {errors.bankName && <p className="text-xs text-destructive">{errors.bankName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={buildWireFieldId(idPrefix, "routing")} className="text-sm font-medium">Routing Number (ABA)</Label>
              <div className="relative">
                <Input
                  id={buildWireFieldId(idPrefix, "routing")}
                  value={showRoutingValue ? record.routingNumber : ""}
                  placeholder={showRoutingValue ? "Enter routing number" : record.routingNumber ? maskSensitiveValue(record.routingNumber) : "Enter routing number"}
                  aria-invalid={Boolean(errors.routingNumber)}
                  inputMode="numeric"
                  onFocus={() => setActiveSensitiveField("routingNumber")}
                  onBlur={() => setActiveSensitiveField((current) => (current === "routingNumber" ? null : current))}
                  onChange={(e) => onChange({ routingNumber: e.target.value.replace(/\\D/g, "").slice(0, 9) })}
                  className="h-10 pr-10"
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 size-8" onClick={onToggleSensitive} aria-label={revealSensitive ? "Mask routing and account number" : "Reveal routing and account number"}>
                  {revealSensitive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
              {errors.routingNumber && <p className="text-xs text-destructive">{errors.routingNumber}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={buildWireFieldId(idPrefix, "account-number")} className="text-sm font-medium">Account Number</Label>
              <Input
                id={buildWireFieldId(idPrefix, "account-number")}
                value={showAccountValue ? record.accountNumber : ""}
                placeholder={showAccountValue ? "Enter account number" : record.accountNumber ? maskSensitiveValue(record.accountNumber) : "Enter account number"}
                aria-invalid={Boolean(errors.accountNumber)}
                onFocus={() => setActiveSensitiveField("accountNumber")}
                onBlur={() => setActiveSensitiveField((current) => (current === "accountNumber" ? null : current))}
                onChange={(e) => onChange({ accountNumber: e.target.value.replace(/\\s/g, "") })}
                className="h-10"
              />
              {errors.accountNumber && <p className="text-xs text-destructive">{errors.accountNumber}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Account Type</Label>
              <Select value={record.accountType} onValueChange={(value) => onChange({ accountType: value as WireInstructionRecord["accountType"] })}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showCdaType && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">CDA Type</Label>
                <Select value={record.cdaType} onValueChange={(value) => onChange({ cdaType: value as CDAType })}>
                  <SelectTrigger className="h-10" aria-invalid={Boolean(errors.cdaType)}>
                    <SelectValue placeholder="Select CDA type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_CDA_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cdaType && <p className="text-xs text-destructive">{errors.cdaType}</p>}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor={buildWireFieldId(idPrefix, "bank-street")} className="text-sm font-medium">Bank Street Address</Label>
              <Input
                id={buildWireFieldId(idPrefix, "bank-street")}
                value={record.bankStreet}
                aria-invalid={Boolean(errors.bankStreet)}
                onChange={(e) => onChange({ bankStreet: e.target.value })}
                className="h-10"
              />
              {errors.bankStreet && <p className="text-xs text-destructive">{errors.bankStreet}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={buildWireFieldId(idPrefix, "bank-city")} className="text-sm font-medium">City</Label>
              <Input
                id={buildWireFieldId(idPrefix, "bank-city")}
                value={record.bankCity}
                aria-invalid={Boolean(errors.bankCity)}
                onChange={(e) => onChange({ bankCity: e.target.value })}
                className="h-10"
              />
              {errors.bankCity && <p className="text-xs text-destructive">{errors.bankCity}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={buildWireFieldId(idPrefix, "bank-state")} className="text-sm font-medium">State</Label>
              <Input
                id={buildWireFieldId(idPrefix, "bank-state")}
                value={record.bankState}
                aria-invalid={Boolean(errors.bankState)}
                onChange={(e) => onChange({ bankState: e.target.value })}
                className="h-10"
              />
              {errors.bankState && <p className="text-xs text-destructive">{errors.bankState}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={buildWireFieldId(idPrefix, "bank-zip")} className="text-sm font-medium">ZIP</Label>
              <Input
                id={buildWireFieldId(idPrefix, "bank-zip")}
                value={record.bankZip}
                aria-invalid={Boolean(errors.bankZip)}
                onChange={(e) => onChange({ bankZip: e.target.value })}
                className="h-10"
              />
              {errors.bankZip && <p className="text-xs text-destructive">{errors.bankZip}</p>}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor={buildWireFieldId(idPrefix, "special-instructions")} className="text-sm font-medium">Special Instructions / Memo</Label>
            <Textarea
              id={buildWireFieldId(idPrefix, "special-instructions")}
              value={record.specialInstructions}
              onChange={(e) => onChange({ specialInstructions: e.target.value })}
              className="min-h-[92px]"
            />
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {record.updatedAt ? \`Last updated \${new Date(record.updatedAt).toLocaleString()}\` : "Not saved yet"}
            </p>
            <div className="flex gap-2">
              {onCancel && <Button variant="outline" onClick={onCancel}>Cancel</Button>}
              <Button onClick={onSave}>Save Wire Instructions</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function WireInstructionsSummaryCard`;

content = content.replace(formCardRegex, newFormCard);

// Replace renderWireInstructions
const renderRegex = /function renderWireInstructions\(\) \{[\s\S]*?\}\n\n  function closeDialog\(\) \{/m;

const newRender = `function renderWireInstructions() {
    const teamComplete = isWireInstructionComplete(wireStore.teamWireInstructions, TEAM_WIRE_COMPLETION_OPTIONS);
    const agentStatuses = agents
      .filter((agent) => agent.id !== CURRENT_TEAM_LEAD_ID)
      .map((agent) => ({
        agent,
        complete: isWireInstructionComplete(wireStore.agentWireInstructions[agent.id] ?? createEmptyWireInstruction()),
      }));
    const currentAgentComplete = isWireInstructionComplete(wireStore.agentWireInstructions[CURRENT_AGENT_ID] ?? createEmptyWireInstruction());
    const showTeamForm = teamWireEditing || !teamComplete;
    const showAgentForm = agentWireEditing || !currentAgentComplete;

    return (
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-base font-medium leading-6 text-foreground">Wiring & Payment Instructions</h2>
            <p className="mt-1 text-xs text-muted-foreground">Manage payment details for team, external vendors, and yourself.</p>
          </div>
        </div>

        <Tabs defaultValue="team" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="team">Team Wire Instructions</TabsTrigger>
            <TabsTrigger value="shared">Shared Database</TabsTrigger>
            <TabsTrigger value="private">My Private Recipients</TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="flex flex-col gap-4">
            {!teamComplete && (
              <Alert className="border-amber-200 bg-amber-50">
                <Bell className="text-amber-700" />
                <AlertTitle className="text-amber-900">Team wire instructions incomplete</AlertTitle>
                <AlertDescription className="text-amber-800">
                  Complete brokerage wire instructions. CDA generation should block until payout destination exists.
                </AlertDescription>
              </Alert>
            )}
            {showTeamForm ? (
              <WireInstructionsFormCard
                idPrefix="team-wire"
                record={teamWireDraft}
                errors={teamWireErrors}
                revealSensitive={revealTeamSensitive}
                showCdaType
                onToggleSensitive={() => setRevealTeamSensitive((prev) => !prev)}
                onChange={(patch) => setTeamWireDraft((current) => ({ ...current, ...patch }))}
                onSave={saveTeamWireInstructions}
              />
            ) : (
              <WireInstructionsSummaryCard
                title="Saved Team Wire Instructions"
                description="Brokerage payout destination shown on generated CDA documents."
                record={teamWireDraft}
                revealSensitive={revealTeamSensitive}
                showCdaType
                onToggleSensitive={() => setRevealTeamSensitive((prev) => !prev)}
                onEdit={() => setTeamWireEditing(true)}
              />
            )}
          </TabsContent>

          <TabsContent value="shared" className="flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold">Shared Recipients</h3>
              <Button size="sm" onClick={() => {
                setState(s => ({...s, activeDialog: "add-fee"})); // Using existing dialog or a new one to add recipient
              }}>
                <Plus className="size-4 mr-1" /> Add Recipient
              </Button>
            </div>
            {wireStore.sharedRecipients.length === 0 ? (
              <div className="text-sm text-muted-foreground border border-dashed rounded-lg p-8 text-center">
                No shared recipients yet. Add vendors or escrow companies here.
              </div>
            ) : (
              <div className="border border-border/50 rounded-[14px] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wireStore.sharedRecipients.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.accountHolderName}</TableCell>
                        <TableCell>{r.email || "-"}</TableCell>
                        <TableCell><WireStatusBadge complete={isWireInstructionComplete(r, {requireBankDetails: false})} /></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="private" className="flex flex-col gap-4">
            {!currentAgentComplete && (
              <Alert className="border-amber-200 bg-amber-50">
                <Bell className="text-amber-700" />
                <AlertTitle className="text-amber-900">My wire instructions incomplete</AlertTitle>
                <AlertDescription className="text-amber-800">
                  Complete personal wire instructions before CDA can be generated for escrow payout.
                </AlertDescription>
              </Alert>
            )}
            {showAgentForm ? (
              <WireInstructionsFormCard
                idPrefix="agent-wire"
                record={agentWireDraft}
                errors={agentWireErrors}
                revealSensitive={revealAgentSensitive}
                onToggleSensitive={() => setRevealAgentSensitive((prev) => !prev)}
                onChange={(patch) => setAgentWireDraft((current) => ({ ...current, ...patch }))}
                onSave={saveAgentWireInstructions}
              />
            ) : (
              <WireInstructionsSummaryCard
                title="Saved My Wire Instructions"
                description="Personal payout destination shown on generated CDA documents."
                record={agentWireDraft}
                revealSensitive={revealAgentSensitive}
                onToggleSensitive={() => setRevealAgentSensitive((prev) => !prev)}
                onEdit={() => setAgentWireEditing(true)}
              />
            )}
          </TabsContent>
        </Tabs>
      </section>
    );
  }

  function closeDialog() {`;

content = content.replace(renderRegex, newRender);

fs.writeFileSync(file, content);
console.log('CDASettings WireInstructions updated.');
