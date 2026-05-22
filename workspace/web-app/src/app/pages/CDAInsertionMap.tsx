import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  ArrowRight,
  Settings,
  Table,
  FileText,
  UserCheck,
  Shield,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Users,
} from "lucide-react";

export function CDAInsertionMap() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex">
          {/* Sidebar placeholder */}
          <div className="w-[72px] bg-sidebar border-r flex-shrink-0" />

          {/* Main Content Area */}
          <div className="flex-1 max-w-[1248px]">
            {/* Page Header */}
            <div className="border-b bg-background px-8 py-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h1 className="text-2xl font-medium mb-1">CDA Insertion Map</h1>
                  <p className="text-sm text-muted-foreground">
                    Implementation blueprint showing how CDA UI attaches to existing Radius product
                  </p>
                </div>
                <Link to="/">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="size-4 mr-2" />
                    Component Library
                  </Button>
                </Link>
              </div>
            </div>

            <div className="px-8 py-8 space-y-8">
              {/* Section 1: Settings Insertion */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Settings className="size-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Settings Insertion</h2>
                    <p className="text-sm text-muted-foreground">
                      Attaches inside existing Settings page
                    </p>
                  </div>
                </div>
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium text-sm mb-2">Commission Plans Section</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Create default split structures for agents and teams
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">Add Plan Modal</Badge>
                          <Badge variant="secondary" className="text-xs">Edit Plan Modal</Badge>
                          <Badge variant="secondary" className="text-xs">Dropdown Menu</Badge>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium text-sm mb-2">Fee Types Section</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Define reusable deductions for CDA calculations
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">Add Fee Modal</Badge>
                          <Badge variant="secondary" className="text-xs">Edit Fee Modal</Badge>
                          <Badge variant="secondary" className="text-xs">Dropdown Menu</Badge>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg col-span-2">
                        <h3 className="font-medium text-sm mb-2">Default Assignments Table</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          Connects plans + fees to agents for automatic CDA calculation
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">Edit Defaults Drawer</Badge>
                          <Badge variant="secondary" className="text-xs">Bulk Assign Drawer</Badge>
                          <Badge variant="secondary" className="text-xs">Recalculation Warning</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg">
                      <p className="text-xs text-blue-900 dark:text-blue-100">
                        <strong>Access:</strong> Only Team Lead/Admin can access CDA Settings
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Section 2: Transaction List Insertion */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Table className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Transaction List Insertion</h2>
                    <p className="text-sm text-muted-foreground">
                      Attaches into existing My Transactions table
                    </p>
                  </div>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div className="p-4 border rounded-lg mb-4">
                      <h3 className="font-medium text-sm mb-2">CDA Column</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Shows current CDA status and primary action
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                          Setup needed
                        </Badge>
                        <Badge variant="secondary" className="text-xs">Estimate ready</Badge>
                        <Badge variant="outline" className="text-xs">Draft</Badge>
                        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                          Awaiting TL
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                          Awaiting agent
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200">
                          Auditor review
                        </Badge>
                        <Badge variant="destructive" className="text-xs bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100">
                          Needs correction
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                          Finalized
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-foreground">
                          <strong>CDA estimate auto-generates from transaction details</strong>
                        </p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-foreground">
                          <strong>No manual Start CDA flow</strong> — Opens automatically when transaction details are complete
                        </p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-foreground">
                          <strong>Reopen existing CDA draft if one exists</strong> — Do not create duplicates
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Section 3: Purchase Details Insertion */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <FileText className="size-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Purchase Details Insertion</h2>
                    <p className="text-sm text-muted-foreground">
                      Attaches inside existing Purchase Details drawer
                    </p>
                  </div>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-sm mb-2">CDA Estimate Card</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Live preview of commission breakdown
                      </p>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Gross Commission</span>
                          <span className="font-medium">$25,000.00</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Pre-split Deductions</span>
                          <span className="font-medium text-red-600 dark:text-red-400">-$750.00</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Split Basis</span>
                          <span className="font-medium">$24,250.00</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Estimated Net Commission</span>
                          <span className="font-medium text-green-600 dark:text-green-400">$18,650.00</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Company Dollar</span>
                          <Badge variant="secondary" className="text-xs">Pending</Badge>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">View CDA Breakdown</Button>
                    </div>
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg">
                      <h4 className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-2">
                        Required Fields Checklist:
                      </h4>
                      <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                        <li>✓ Purchase price</li>
                        <li>✓ Commission rate</li>
                        <li>✓ Agent allocation</li>
                        <li>✓ Award allocation</li>
                        <li>✓ Commission plan (from defaults)</li>
                        <li>✓ Default fees (from defaults)</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Section 4: Team Lead Review Insertion */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <UserCheck className="size-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Team Lead Review Insertion</h2>
                    <p className="text-sm text-muted-foreground">
                      TL edits plans, allocations, and deductions
                    </p>
                  </div>
                </div>
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium text-sm mb-2">Editable Elements</h3>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Commission plan</li>
                          <li>• Agent allocation splits</li>
                          <li>• Deduction amounts</li>
                          <li>• Fee selections</li>
                        </ul>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium text-sm mb-2">Actions Available</h3>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Send to Agent</li>
                          <li>• Request Correction</li>
                          <li>• Save Draft</li>
                        </ul>
                      </div>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg">
                      <p className="text-xs text-red-900 dark:text-red-100">
                        <strong>Constraint:</strong> TL cannot finalize CDA — only Auditor can finalize
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Section 5: Agent Confirmation Insertion */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Users className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Agent Confirmation Insertion</h2>
                    <p className="text-sm text-muted-foreground">
                      Agent sees only own payout
                    </p>
                  </div>
                </div>
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-sm mb-2">Confirmation Summary</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Read-only view of agent's net commission
                      </p>
                      <div className="flex items-center gap-2">
                        <Button size="sm">Confirm Payout</Button>
                        <Button variant="outline" size="sm">Request Correction</Button>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg">
                      <p className="text-xs text-blue-900 dark:text-blue-100">
                        <strong>Privacy:</strong> Agent cannot see other agents' payouts, Radius fee, or company dollar
                      </p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg">
                      <p className="text-xs text-amber-900 dark:text-amber-100">
                        <strong>Reset Logic:</strong> If TL edits after agent confirmation, confirmation resets and requires re-confirmation
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Section 6: TC Insertion */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <FileText className="size-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">TC Insertion</h2>
                    <p className="text-sm text-muted-foreground">
                      TC can assist if assigned
                    </p>
                  </div>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-sm mb-2">TC Role</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Read-only CDA access with Purchase Details assist capability
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-green-600 dark:text-green-500" />
                          <span>View CDA breakdown</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-green-600 dark:text-green-500" />
                          <span>Assist with Purchase Details entry</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="size-4 text-red-600 dark:text-red-500" />
                          <span>Cannot edit CDA calculations</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="size-4 text-red-600 dark:text-red-500" />
                          <span>Cannot finalize CDA</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Section 7: Auditor Insertion */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Shield className="size-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Auditor Insertion</h2>
                    <p className="text-sm text-muted-foreground">
                      Auditor enters Radius fee and finalizes CDA
                    </p>
                  </div>
                </div>
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium text-sm mb-2">Auditor Actions</h3>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Enter Radius fee (manual input)</li>
                          <li>• Verify company dollar calculation</li>
                          <li>• Finalize CDA</li>
                          <li>• Generate PDF</li>
                          <li>• Send via DocuSign</li>
                        </ul>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-medium text-sm mb-2">Modals/Drawers</h3>
                        <div className="flex flex-col gap-2">
                          <Badge variant="secondary" className="text-xs">Finalize CDA Modal</Badge>
                          <Badge variant="secondary" className="text-xs">DocuSign Send Modal</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-lg">
                      <p className="text-xs text-indigo-900 dark:text-indigo-100">
                        <strong>Critical:</strong> Radius fee remains manual entry — not auto-calculated
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Section 8: Finalized State Insertion */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium">Finalized State Insertion</h2>
                    <p className="text-sm text-muted-foreground">
                      Finalized CDA becomes locked
                    </p>
                  </div>
                </div>
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-sm mb-2">Finalized PDF View</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Read-only PDF summary with download capability
                      </p>
                      <div className="flex items-center gap-2">
                        <Button size="sm">Download PDF</Button>
                        <Button variant="outline" size="sm">View PDF</Button>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-lg">
                      <p className="text-xs text-green-900 dark:text-green-100">
                        <strong>Historical Preservation:</strong> Archived plans/fees remain visible in finalized CDAs
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Section 9: CDA Status Map */}
              <section>
                <h2 className="text-lg font-medium mb-4">CDA Status Map</h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                              Status
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                              Action
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                              Opens
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                              Owner
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                                Setup needed
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-xs">Complete details</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">Purchase Details drawer</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">Agent / TC</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="text-xs">Estimate ready</Badge>
                            </td>
                            <td className="px-4 py-3 text-xs">View estimate</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">Purchase Details CDA card</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">Agent</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="text-xs">Draft</Badge>
                            </td>
                            <td className="px-4 py-3 text-xs">Continue</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">CDA Breakdown</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">Agent / TL</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                                Awaiting TL
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-xs">Review</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">Team Lead Review</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">Team Lead</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                                Awaiting agent
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-xs">Confirm</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">Agent Confirmation</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">Agent</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200">
                                Auditor review
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-xs">View / Verify</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">Auditor Verification</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">Auditor</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">
                              <Badge variant="destructive" className="text-xs bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100">
                                Needs correction
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-xs">Review</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">Team Lead Review</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">Team Lead</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                                Finalized
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-xs">View PDF</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">Finalized PDF Page</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">All roles</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Section 10: Implementation Notes */}
              <section>
                <h2 className="text-lg font-medium mb-4">Implementation Notes</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-sm">
                      <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 mb-2" />
                      <p className="font-medium mb-1">Auto-generation</p>
                      <p className="text-xs text-muted-foreground">
                        CDA estimate auto-generates from transaction details when required fields complete
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-sm">
                      <AlertCircle className="size-5 text-purple-600 dark:text-purple-400 mb-2" />
                      <p className="font-medium mb-1">Settings Defaults</p>
                      <p className="text-xs text-muted-foreground">
                        Commission plans and fee types from Settings power automatic calculations
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-sm">
                      <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 mb-2" />
                      <p className="font-medium mb-1">Recalculation</p>
                      <p className="text-xs text-muted-foreground">
                        Changing defaults can recalculate active CDA estimates for under-contract deals
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-sm">
                      <AlertCircle className="size-5 text-red-600 dark:text-red-400 mb-2" />
                      <p className="font-medium mb-1">Confirmation Reset</p>
                      <p className="text-xs text-muted-foreground">
                        If TL edits after agent confirmation, confirmation resets and requires re-confirmation
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-sm">
                      <AlertCircle className="size-5 text-indigo-600 dark:text-indigo-400 mb-2" />
                      <p className="font-medium mb-1">Radius Fee</p>
                      <p className="text-xs text-muted-foreground">
                        Radius fee remains manual entry by Auditor — not auto-calculated
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-sm">
                      <AlertCircle className="size-5 text-green-600 dark:text-green-400 mb-2" />
                      <p className="font-medium mb-1">No Duplicates</p>
                      <p className="text-xs text-muted-foreground">
                        Do not create duplicate CDA records — reopen existing draft if one exists
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-sm">
                      <AlertCircle className="size-5 text-slate-600 dark:text-slate-400 mb-2" />
                      <p className="font-medium mb-1">Historical Preservation</p>
                      <p className="text-xs text-muted-foreground">
                        Archived plans/fees remain visible in historical finalized CDAs
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
