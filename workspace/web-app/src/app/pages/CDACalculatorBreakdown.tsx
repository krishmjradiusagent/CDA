import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Lock,
  CheckCircle2,
  Clock,
  FileText,
  Send,
  Download,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

export function CDACalculatorBreakdown() {
  const [editSplitOpen, setEditSplitOpen] = useState(false);
  const [addDeductionOpen, setAddDeductionOpen] = useState(false);
  const [requestCorrectionOpen, setRequestCorrectionOpen] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [docuSignOpen, setDocuSignOpen] = useState(false);
  const [recalcWarningOpen, setRecalcWarningOpen] = useState(false);

  const userRole = "team-lead"; // team-lead, agent, auditor

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex">
          {/* Sidebar placeholder */}
          <div className="w-[72px] bg-sidebar border-r flex-shrink-0" />

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="border-b bg-background px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-medium mb-1">CDA Breakdown</h1>
                  <p className="text-sm text-muted-foreground">
                    1284 Willow Creek Dr • Michael Loft
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Draft</Badge>
                  <Link to="/">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      Components
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* 3-Column Layout */}
            <div className="grid grid-cols-[300px_1fr_320px] gap-6 p-6">
              {/* LEFT PANEL: Participants & Allocation */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Transaction Participants</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Listing Side */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Listing Side</span>
                        <Badge variant="secondary" className="text-xs">60%</Badge>
                      </div>

                      {/* Agent Card */}
                      <div className="border rounded-lg p-3 mb-2">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                            IC
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">Ila Corcoran</p>
                              <Badge variant="outline" className="text-[10px] h-4">Lead</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">80/20 Standard</p>
                          </div>
                          <Button variant="ghost" size="sm" className="size-6 p-0">
                            <Edit className="size-3" />
                          </Button>
                        </div>
                        <Separator className="my-2" />
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Commission %</span>
                            <span className="font-medium">60%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Gross Amount</span>
                            <span className="font-medium">$14,550</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Net Estimate</span>
                            <span className="font-medium text-green-600 dark:text-green-400">$11,215</span>
                          </div>
                        </div>
                      </div>

                      {/* Split Visualization */}
                      <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-primary" style={{ width: '60%' }}></div>
                      </div>

                      <Button variant="outline" size="sm" className="w-full text-xs h-8">
                        <Plus className="size-3 mr-1" />
                        Add Co-agent
                      </Button>
                    </div>

                    <Separator />

                    {/* Buyer Side */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Buyer Side</span>
                        <Badge variant="secondary" className="text-xs">40%</Badge>
                      </div>

                      {/* Agent Card */}
                      <div className="border rounded-lg p-3 mb-2">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                            MT
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">Michael Tran</p>
                              <Badge variant="outline" className="text-[10px] h-4">Lead</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">70/30 Standard</p>
                          </div>
                          <Button variant="ghost" size="sm" className="size-6 p-0">
                            <Edit className="size-3" />
                          </Button>
                        </div>
                        <Separator className="my-2" />
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Commission %</span>
                            <span className="font-medium">40%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Gross Amount</span>
                            <span className="font-medium">$9,700</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Net Estimate</span>
                            <span className="font-medium text-green-600 dark:text-green-400">$7,435</span>
                          </div>
                        </div>
                      </div>

                      {/* Split Visualization */}
                      <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-primary" style={{ width: '40%' }}></div>
                      </div>

                      <Button variant="outline" size="sm" className="w-full text-xs h-8">
                        <Plus className="size-3 mr-1" />
                        Add Co-agent
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Award Allocation */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Award Allocation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Listing Side</span>
                        <span className="font-medium">60%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Buyer Side</span>
                        <span className="font-medium">40%</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setEditSplitOpen(true)}>
                      <Edit className="size-3 mr-1" />
                      Edit Allocation
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* CENTER PANEL: Finance Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-medium">Finance Breakdown</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Automatic estimate generated from transaction details and assigned defaults.
                    </p>
                  </div>
                </div>

                {/* 1. Gross Commission */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Gross Commission</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block mb-1">Purchase Price</span>
                        <span className="font-medium">$500,000</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-1">Commission %</span>
                        <span className="font-medium">5.0%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-1">Gross Commission</span>
                        <span className="font-medium text-base">$25,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Pre-split Deductions */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Pre-split Deductions</CardTitle>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAddDeductionOpen(true)}>
                        <Plus className="size-3 mr-1" />
                        Add Deduction
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {/* Deduction Row */}
                      <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1">
                            <p className="text-sm font-medium">TC Fee</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge variant="secondary" className="text-[10px] h-4">Flat</Badge>
                              <Badge variant="secondary" className="text-[10px] h-4 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100">Pre-split</Badge>
                              <Badge variant="secondary" className="text-[10px] h-4">Team</Badge>
                            </div>
                          </div>
                          <span className="text-sm font-medium tabular-nums">-$500</span>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" className="size-7 p-0">
                            <Edit className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="size-7 p-0">
                            <Trash2 className="size-3 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1">
                            <p className="text-sm font-medium">Compliance Review</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge variant="secondary" className="text-[10px] h-4">Flat</Badge>
                              <Badge variant="secondary" className="text-[10px] h-4 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100">Pre-split</Badge>
                              <Badge variant="secondary" className="text-[10px] h-4">Team</Badge>
                            </div>
                          </div>
                          <span className="text-sm font-medium tabular-nums">-$250</span>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" className="size-7 p-0">
                            <Edit className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="size-7 p-0">
                            <Trash2 className="size-3 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <Separator />
                      <div className="flex items-center justify-between text-sm pt-2">
                        <span className="text-muted-foreground">Total Pre-split Deductions</span>
                        <span className="font-medium tabular-nums">-$750</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Split Basis */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Split Basis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Gross after Deductions</span>
                      <span className="font-medium tabular-nums">$24,250</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Agent Split (80%)</span>
                      <span className="font-medium tabular-nums">$19,400</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Team Split (20%)</span>
                      <span className="font-medium tabular-nums">$4,850</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Company Dollar Contribution</span>
                      <span className="font-medium tabular-nums">$4,850</span>
                    </div>
                  </CardContent>
                </Card>

                {/* 4. Post-split Deductions */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Post-split Deductions</CardTitle>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAddDeductionOpen(true)}>
                        <Plus className="size-3 mr-1" />
                        Add Deduction
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1">
                            <p className="text-sm font-medium">RM Fee</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge variant="secondary" className="text-[10px] h-4">Flat</Badge>
                              <Badge variant="secondary" className="text-[10px] h-4 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">Post-split</Badge>
                              <Badge variant="secondary" className="text-[10px] h-4">Agent</Badge>
                            </div>
                          </div>
                          <span className="text-sm font-medium tabular-nums">-$300</span>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" className="size-7 p-0">
                            <Edit className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="size-7 p-0">
                            <Trash2 className="size-3 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1">
                            <p className="text-sm font-medium">E&O Fee</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge variant="secondary" className="text-[10px] h-4">Flat</Badge>
                              <Badge variant="secondary" className="text-[10px] h-4 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">Post-split</Badge>
                              <Badge variant="secondary" className="text-[10px] h-4">Agent</Badge>
                            </div>
                          </div>
                          <span className="text-sm font-medium tabular-nums">-$125</span>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" className="size-7 p-0">
                            <Edit className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="size-7 p-0">
                            <Trash2 className="size-3 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <Separator />
                      <div className="flex items-center justify-between text-sm pt-2">
                        <span className="text-muted-foreground">Total Post-split Deductions</span>
                        <span className="font-medium tabular-nums">-$425</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 5. Agent Net Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Agent Net Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Gross Payout</span>
                      <span className="font-medium tabular-nums">$19,400</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Deductions</span>
                      <span className="font-medium tabular-nums text-red-600 dark:text-red-400">-$425</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Estimated Net Commission</span>
                      <span className="font-semibold text-base tabular-nums text-green-600 dark:text-green-400">$18,975</span>
                    </div>
                  </CardContent>
                </Card>

                {/* 6. Radius Fee (Auditor Only) */}
                <Card className={userRole !== "auditor" ? "bg-muted/30" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm">Radius Fee</CardTitle>
                        {userRole !== "auditor" && <Lock className="size-3 text-muted-foreground" />}
                      </div>
                      {userRole === "auditor" && (
                        <Badge variant="secondary" className="text-xs">Auditor Only</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Radius Fee Amount</label>
                      {userRole === "auditor" ? (
                        <Input placeholder="$750" className="h-9" />
                      ) : (
                        <div className="h-9 px-3 border rounded-lg bg-muted flex items-center text-sm text-muted-foreground">
                          Pending auditor entry
                        </div>
                      )}
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Company Dollar Verified</span>
                      <span className="font-medium tabular-nums">
                        {userRole === "auditor" ? "$4,100" : "—"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT PANEL: Summary & Actions */}
              <div className="space-y-4">
                {/* CDA Summary */}
                <Card className="sticky top-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">CDA Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Gross Commission</span>
                        <span className="font-medium tabular-nums">$25,000</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Pre-split Deductions</span>
                        <span className="font-medium tabular-nums text-red-600 dark:text-red-400">-$750</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Split Basis</span>
                        <span className="font-medium tabular-nums">$24,250</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Post-split Deductions</span>
                        <span className="font-medium tabular-nums text-red-600 dark:text-red-400">-$425</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Company Dollar</span>
                        <span className="font-medium tabular-nums">
                          {userRole === "auditor" ? "$4,100" : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Estimated Agent Net</span>
                        <span className="font-semibold tabular-nums text-green-600 dark:text-green-400">$18,975</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Estimated Brokerage Net</span>
                        <span className="font-semibold tabular-nums text-green-600 dark:text-green-400">$4,850</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Status Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Draft</Badge>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-3 text-green-600 dark:text-green-500" />
                          <span className="text-muted-foreground">Auto-generated</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="size-3 text-amber-500" />
                          <span className="text-muted-foreground">TL review pending</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="size-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Agent confirmation pending</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="size-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Auditor finalization pending</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Role-based Actions */}
                    {userRole === "team-lead" && (
                      <div className="space-y-2">
                        <Button size="sm" className="w-full">
                          <Send className="size-3 mr-2" />
                          Send to Agent
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          Save Draft
                        </Button>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setRequestCorrectionOpen(true)}>
                          Request Correction
                        </Button>
                      </div>
                    )}

                    {userRole === "agent" && (
                      <div className="space-y-2">
                        <Button size="sm" className="w-full">
                          <CheckCircle2 className="size-3 mr-2" />
                          Confirm CDA
                        </Button>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setRequestCorrectionOpen(true)}>
                          Request Correction
                        </Button>
                      </div>
                    )}

                    {userRole === "auditor" && (
                      <div className="space-y-2">
                        <Button size="sm" className="w-full" onClick={() => setFinalizeOpen(true)}>
                          <CheckCircle2 className="size-3 mr-2" />
                          Finalize CDA
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          <Download className="size-3 mr-2" />
                          Generate PDF
                        </Button>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setDocuSignOpen(true)}>
                          <Send className="size-3 mr-2" />
                          Send via DocuSign
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Implementation Notes */}
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="size-4 text-blue-600 dark:text-blue-400" />
                      <CardTitle className="text-sm">Implementation Notes</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-blue-900 dark:text-blue-100 space-y-2">
                    <p>• CDA estimate auto-generates from transaction details</p>
                    <p>• Commission plans and fee defaults come from CDA Settings</p>
                    <p>• Changing defaults can trigger recalculation</p>
                    <p>• Agent only sees own payout</p>
                    <p>• Radius fee is auditor-controlled</p>
                    <p>• Finalized CDA becomes read-only</p>
                    <p>• Historical fee logic remains preserved</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Split Drawer */}
      <Dialog open={editSplitOpen} onOpenChange={setEditSplitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Split Allocation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Listing Side %</label>
              <Input type="number" defaultValue="60" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Buyer Side %</label>
              <Input type="number" defaultValue="40" />
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs text-amber-900 dark:text-amber-100">
              Total must equal 100%
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSplitOpen(false)}>Cancel</Button>
            <Button onClick={() => setEditSplitOpen(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Deduction Modal */}
      <Dialog open={addDeductionOpen} onOpenChange={setAddDeductionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Deduction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fee Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tc">TC Fee</SelectItem>
                  <SelectItem value="rm">RM Fee</SelectItem>
                  <SelectItem value="eo">E&O Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input placeholder="$500" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDeductionOpen(false)}>Cancel</Button>
            <Button onClick={() => setAddDeductionOpen(false)}>Add Deduction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Correction Modal */}
      <Dialog open={requestCorrectionOpen} onOpenChange={setRequestCorrectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Correction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Correction Note</label>
              <Textarea placeholder="Describe what needs to be corrected..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestCorrectionOpen(false)}>Cancel</Button>
            <Button onClick={() => setRequestCorrectionOpen(false)}>Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finalize CDA Modal */}
      <Dialog open={finalizeOpen} onOpenChange={setFinalizeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalize CDA</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to finalize this CDA? This action will lock the CDA and generate the final PDF.
            </p>
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs text-amber-900 dark:text-amber-100">
              Finalized CDAs cannot be edited. Ensure all values are correct before proceeding.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinalizeOpen(false)}>Cancel</Button>
            <Button onClick={() => setFinalizeOpen(false)}>
              <CheckCircle2 className="size-4 mr-2" />
              Finalize CDA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send via DocuSign Modal */}
      <Dialog open={docuSignOpen} onOpenChange={setDocuSignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send via DocuSign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              The following recipients will receive the CDA envelope via DocuSign.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 border rounded-lg">
                <CheckCircle2 className="size-4 text-green-600 dark:text-green-500" />
                <span className="text-sm">Ila Corcoran (Agent)</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-lg">
                <CheckCircle2 className="size-4 text-green-600 dark:text-green-500" />
                <span className="text-sm">Rod Watson (Team Lead)</span>
              </div>
              <div className="flex items-center gap-2 p-2 border rounded-lg">
                <FileText className="size-4 text-muted-foreground" />
                <span className="text-sm">Accounting (Copy)</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocuSignOpen(false)}>Cancel</Button>
            <Button onClick={() => setDocuSignOpen(false)}>
              <Send className="size-4 mr-2" />
              Send via DocuSign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recalculation Warning Modal */}
      <Dialog open={recalcWarningOpen} onOpenChange={setRecalcWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Active CDA Estimates May Update</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Applying new defaults to under-contract deals can recalculate CDA estimates and may require review again.
            </p>
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs text-amber-900 dark:text-amber-100">
              This will affect 3 active CDAs. Agent confirmations will reset.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecalcWarningOpen(false)}>View Affected Deals</Button>
            <Button onClick={() => setRecalcWarningOpen(false)}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
