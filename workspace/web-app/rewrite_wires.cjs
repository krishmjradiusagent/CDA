const fs = require("fs");
const file = "src/app/pages/CDASettings.tsx";
let code = fs.readFileSync(file, "utf8");

// Extract renderWireInstructions block
const startMarker = `  function renderWireInstructions() {`;
const endMarker = `  function closeDialog() {`;

const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error("Could not find renderWireInstructions block");
  process.exit(1);
}

const newRenderFn = `  function renderWireInstructions() {
    const teamComplete = isWireInstructionComplete(wireStore.teamWireInstructions, TEAM_WIRE_COMPLETION_OPTIONS);
    const sharedRecipients = wireStore.sharedRecipients || [];
    
    const myWire = wireStore.agentWireInstructions[CURRENT_AGENT_ID] ?? createEmptyWireInstruction(\`agent-wire-\${CURRENT_AGENT_ID}\`);
    const myWireComplete = isWireInstructionComplete(myWire, {requireBankDetails: false});

    const otherAgents = agents.filter(a => a.id !== CURRENT_AGENT_ID);

    const canManageTeamAndShared = userRole === "team_lead" || userRole === "soul_auditor" || userRole === "radius_auditing";
    const canManageTeamWire = userRole === "team_lead";

    return (
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-base font-medium leading-6 text-foreground">Wiring & Payment Instructions</h2>
            <p className="mt-1 text-xs text-muted-foreground">Manage payment details for team, external vendors, and yourself.</p>
          </div>
        </div>

        {!teamComplete && (
          <Alert className="border-amber-200 bg-amber-50">
            <Bell className="text-amber-700" />
            <AlertTitle className="text-amber-900">Team wire instructions incomplete</AlertTitle>
            <AlertDescription className="text-amber-800">
              Complete brokerage wire instructions. CDA generation should block until payout destination exists.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="private" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="shared">Shared</TabsTrigger>
            <TabsTrigger value="private">Private</TabsTrigger>
          </TabsList>

          <TabsContent value="shared" className="flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold">Shared Recipients</h3>
              {canManageTeamAndShared && (
                <Button variant="outline" size="sm" className="border-primary text-primary hover:text-primary" onClick={() => openWireDialog("shared")}>
                  <Plus className="size-4 mr-1" /> Add Recipient
                </Button>
              )}
            </div>
            {sharedRecipients.length === 0 ? (
              <div className="text-sm text-muted-foreground border border-dashed rounded-lg p-8 text-center flex flex-col items-center gap-3">
                <p>No shared recipients yet. Add vendors or escrow companies here.</p>
              </div>
            ) : (
              <Card className="rounded-[14px] border-border shadow-none overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 pl-6">Name</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Email</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Address</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Bank</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Status</TableHead>
                      <TableHead className="w-[50px] pr-6"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sharedRecipients.map(r => (
                      <TableRow key={r.id} className="group h-12 hover:bg-muted/30 transition-colors border-b last:border-0">
                        <TableCell className="pl-6 font-medium text-sm text-foreground">{r.accountHolderName || "Unnamed Agent"}</TableCell>
                        <TableCell className="text-sm">{r.email || "-"}</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{[r.recipientStreet, r.recipientCity, r.recipientState].filter(Boolean).join(", ") || "-"}</TableCell>
                        <TableCell className="text-sm">{r.bankName ? \`\${r.bankName} \${maskSensitiveValue(r.accountNumber)}\` : "-"}</TableCell>
                        <TableCell><WireStatusBadge complete={isWireInstructionComplete(r, {requireBankDetails: false})} /></TableCell>
                        <TableCell className="pr-6 text-right">
                          {canManageTeamAndShared && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" sideOffset={8} className="w-[170px]">
                                <DropdownMenuItem onClick={() => openWireDialog("shared", r)}>
                                  <Edit3 className="size-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="private" className="flex flex-col gap-6">
            {canManageTeamWire && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold">Team Wire</h3>
                  {!teamComplete && (
                    <Button variant="outline" size="sm" className="border-primary text-primary hover:text-primary" onClick={() => openWireDialog("team", wireStore.teamWireInstructions)}>
                      <Plus className="size-4 mr-1" /> Add / Edit Team Wire
                    </Button>
                  )}
                </div>

                <Card className="rounded-[14px] border-border shadow-none overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b">
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 pl-6">Account Name</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Email</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Address</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Bank</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Status</TableHead>
                        <TableHead className="w-[50px] pr-6"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="group h-12 hover:bg-muted/30 transition-colors border-b last:border-0">
                        <TableCell className="pl-6 font-medium text-sm text-foreground">{wireStore.teamWireInstructions.accountHolderName || "Not set"}</TableCell>
                        <TableCell className="text-sm">{wireStore.teamWireInstructions.email || "-"}</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{[wireStore.teamWireInstructions.recipientStreet, wireStore.teamWireInstructions.recipientCity, wireStore.teamWireInstructions.recipientState].filter(Boolean).join(", ") || "-"}</TableCell>
                        <TableCell className="text-sm">{wireStore.teamWireInstructions.bankName ? \`\${wireStore.teamWireInstructions.bankName} \${maskSensitiveValue(wireStore.teamWireInstructions.accountNumber)}\` : "-"}</TableCell>
                        <TableCell><WireStatusBadge complete={teamComplete} /></TableCell>
                        <TableCell className="pr-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={8} className="w-[170px]">
                              <DropdownMenuItem onClick={() => openWireDialog("team", wireStore.teamWireInstructions)}>
                                <Edit3 className="size-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold">My Wire</h3>
                {!myWireComplete && (
                  <Button variant="outline" size="sm" className="border-primary text-primary hover:text-primary" onClick={() => openWireDialog("private", myWire)}>
                    <Plus className="size-4 mr-1" /> Add / Edit My Wire
                  </Button>
                )}
              </div>
              <Card className="rounded-[14px] border-border shadow-none overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 pl-6">Name</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Email</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Address</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Bank</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Status</TableHead>
                      <TableHead className="w-[50px] pr-6"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="group h-12 hover:bg-muted/30 transition-colors border-b last:border-0">
                      <TableCell className="pl-6 font-medium text-sm text-foreground">{myWire.accountHolderName || agents.find(a => a.id === CURRENT_AGENT_ID)?.name || "Not set"}</TableCell>
                      <TableCell className="text-sm">{myWire.email || "-"}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{[myWire.recipientStreet, myWire.recipientCity, myWire.recipientState].filter(Boolean).join(", ") || "-"}</TableCell>
                      <TableCell className="text-sm">{myWire.bankName ? \`\${myWire.bankName} \${maskSensitiveValue(myWire.accountNumber)}\` : "-"}</TableCell>
                      <TableCell><WireStatusBadge complete={myWireComplete} /></TableCell>
                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" sideOffset={8} className="w-[170px]">
                            <DropdownMenuItem onClick={() => openWireDialog("private", myWire)}>
                              <Edit3 className="size-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </div>

            {userRole === "team_lead" && otherAgents.length > 0 && (
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold">Team Agent Wires</h3>
                </div>
                <Card className="rounded-[14px] border-border shadow-none overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b">
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 pl-6">Agent Name</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Email</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Address</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Bank</TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Status</TableHead>
                        <TableHead className="w-[50px] pr-6"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {otherAgents.map(agent => {
                        const r = wireStore.agentWireInstructions[agent.id] ?? createEmptyWireInstruction(\`agent-wire-\${agent.id}\`);
                        return (
                          <TableRow key={agent.id} className="group h-12 hover:bg-muted/30 transition-colors border-b last:border-0">
                            <TableCell className="pl-6 font-medium text-sm text-foreground">{agent.name}</TableCell>
                            <TableCell className="text-sm">{r.email || "-"}</TableCell>
                            <TableCell className="text-sm max-w-[200px] truncate">{[r.recipientStreet, r.recipientCity, r.recipientState].filter(Boolean).join(", ") || "-"}</TableCell>
                            <TableCell className="text-sm">{r.bankName ? \`\${r.bankName} \${maskSensitiveValue(r.accountNumber)}\` : "-"}</TableCell>
                            <TableCell><WireStatusBadge complete={isWireInstructionComplete(r, {requireBankDetails: false})} /></TableCell>
                            <TableCell className="pr-6 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="size-8">
                                    <MoreVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" sideOffset={8} className="w-[170px]">
                                  <DropdownMenuItem onClick={() => openWireDialog("private", r)}>
                                    <Edit3 className="size-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    );
  }
`;

code = code.substring(0, startIdx) + newRenderFn + "\n\n" + code.substring(endIdx);
fs.writeFileSync(file, code);
console.log("Rewrote renderWireInstructions");
