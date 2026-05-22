import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { ApprovalStatus, FinanceEmptyState } from "../components/finance";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Settings,
  FileText,
  Users,
  TrendingUp,
  Receipt,
  ExternalLink,
  AlertCircle,
  Lock,
  Eye,
  Edit,
  Send,
  Download,
} from "lucide-react";

// State card component
function StateCard({
  title,
  trigger,
  behavior,
  primaryAction,
  secondaryAction,
  variant = "default",
}: {
  title: string;
  trigger: string;
  behavior: string;
  primaryAction?: string;
  secondaryAction?: string;
  variant?: "default" | "warning" | "error" | "success";
}) {
  const variantStyles = {
    default: "border-border",
    warning: "border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20",
    error: "border-red-300 dark:border-red-700 bg-red-50/30 dark:bg-red-950/20",
    success: "border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-950/20",
  };

  const iconMap = {
    default: AlertCircle,
    warning: AlertTriangle,
    error: XCircle,
    success: CheckCircle2,
  };

  const Icon = iconMap[variant];

  return (
    <Card className={variantStyles[variant]}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-2">
          <Icon className="size-4 text-muted-foreground mt-0.5" />
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div>
          <p className="text-muted-foreground mb-1 font-medium">Trigger:</p>
          <p className="text-foreground">{trigger}</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1 font-medium">Behavior:</p>
          <p className="text-foreground">{behavior}</p>
        </div>
        {(primaryAction || secondaryAction) && (
          <div className="pt-2 space-y-1.5">
            {primaryAction && (
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-primary" />
                <p className="text-foreground font-medium">{primaryAction}</p>
              </div>
            )}
            {secondaryAction && (
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-muted-foreground" />
                <p className="text-muted-foreground">{secondaryAction}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function EdgeCasesPage() {
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
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <span>CDA</span>
                <span>/</span>
                <span className="text-foreground">Edge Cases</span>
              </div>

              <div className="flex items-start justify-between gap-6">
                <div>
                  <h1 className="text-2xl font-medium mb-1">CDA Edge Cases</h1>
                  <p className="text-sm text-muted-foreground">
                    Blocked, empty, recalculation, validation, and permission states.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Badge variant="outline">Design QA</Badge>
                  <Link to="/">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      Components
                    </Button>
                  </Link>
                  <Link to="/breakdown">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      CDA Breakdown
                    </Button>
                  </Link>
                  <Link to="/team-lead-review">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      TL Review
                    </Button>
                  </Link>
                  <Link to="/auditor-verification">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      Auditor Verification
                    </Button>
                  </Link>
                  <Link to="/cda-settings">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="size-4 mr-2" />
                      CDA Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="px-8 py-8 space-y-8">
              {/* State Grid Section */}
              <section>
                <h2 className="text-lg font-medium mb-4">Required State Cards</h2>
                <div className="grid grid-cols-3 gap-4">
                  {/* A. CDA Not Started */}
                  <StateCard
                    title="CDA Not Started"
                    trigger="Transaction has enough data but CDA not opened."
                    behavior="Show CTA 'Open CDA Breakdown'."
                    primaryAction="Open CDA Breakdown"
                  />

                  {/* B. Missing Purchase Price */}
                  <StateCard
                    title="Missing Purchase Price"
                    trigger="Purchase price empty."
                    behavior="Disable CDA Breakdown."
                    variant="error"
                    primaryAction="Complete Transaction"
                  />

                  {/* C. Missing Commission Rate */}
                  <StateCard
                    title="Missing Commission Rate"
                    trigger="Commission rate empty."
                    behavior="Disable gross commission calculation."
                    variant="error"
                    primaryAction="Enter commission rate"
                  />

                  {/* D. Allocation Not 100% */}
                  <StateCard
                    title="Allocation Not 100%"
                    trigger="Agent splits total 90% or 110%."
                    behavior="Show validation. Disable request approval."
                    variant="warning"
                    primaryAction="Adjust splits to equal 100%"
                  />

                  {/* E. Missing Commission Plan */}
                  <StateCard
                    title="Missing Commission Plan"
                    trigger="Agent has no default plan."
                    behavior="Allow selection before continuing."
                    variant="warning"
                    primaryAction="Select commission plan"
                  />

                  {/* F. Missing Required Fee */}
                  <StateCard
                    title="Missing Required Fee"
                    trigger="Default fee not configured."
                    behavior="Warning only. Allow manual add."
                    variant="warning"
                    primaryAction="Add fee manually"
                    secondaryAction="Continue without fee"
                  />

                  {/* G. Radius Fee Pending */}
                  <StateCard
                    title="Radius Fee Pending"
                    trigger="Auditor has not entered Radius fee."
                    behavior="Company dollar pending. Disable finalization."
                    variant="warning"
                    primaryAction="Enter Radius fee"
                  />

                  {/* H. Agent Requests Correction */}
                  <StateCard
                    title="Agent Requests Correction"
                    trigger="Agent rejects confirmation."
                    behavior="Status returns to Team Lead review."
                    variant="warning"
                    primaryAction="Return to TL Review"
                  />

                  {/* I. TL Changes After Agent Confirmation */}
                  <StateCard
                    title="TL Changes After Confirmation"
                    trigger="TL edits values after agent confirmed."
                    behavior="Reset agent confirmation. Require re-confirmation."
                    variant="warning"
                    primaryAction="Notify agent of changes"
                    secondaryAction="Request re-confirmation"
                  />

                  {/* J. Tier Recalculation */}
                  <StateCard
                    title="Tier Recalculation"
                    trigger="Another deal closes and changes tier."
                    behavior="Recalculate CDA forecast. Show warning. Restart verification."
                    variant="warning"
                    primaryAction="Recalculate tiers"
                    secondaryAction="Review changes"
                  />

                  {/* K. Cap Reached */}
                  <StateCard
                    title="Cap Reached"
                    trigger="Agent cap reached."
                    behavior="Team split adjusts based on cap logic. Show background calculation note."
                    primaryAction="Show cap calculation"
                    secondaryAction="Review adjusted split"
                  />

                  {/* L. Under Contract Recalculation */}
                  <StateCard
                    title="Under Contract Recalculation"
                    trigger="Default commission plan changed with apply-to-under-contract enabled."
                    behavior="Show affected deals confirmation."
                    variant="warning"
                    primaryAction="Show affected deals"
                    secondaryAction="Confirm changes"
                  />

                  {/* M. Auditor Flags Discrepancy */}
                  <StateCard
                    title="Auditor Flags Discrepancy"
                    trigger="Auditor flags agent or TL values."
                    behavior="Status becomes 'Needs correction'."
                    variant="error"
                    primaryAction="Return for correction"
                  />

                  {/* N. PDF Generation Failed */}
                  <StateCard
                    title="PDF Generation Failed"
                    trigger="System cannot generate CDA PDF."
                    behavior="Show retry. Keep CDA finalized state safe."
                    variant="error"
                    primaryAction="Retry PDF generation"
                    secondaryAction="Contact support"
                  />

                  {/* O. DocuSign Send Failed */}
                  <StateCard
                    title="DocuSign Send Failed"
                    trigger="Envelope send fails."
                    behavior="Show retry and copy error."
                    variant="error"
                    primaryAction="Retry send"
                    secondaryAction="Copy error message"
                  />

                  {/* P. Read-only Agent View */}
                  <StateCard
                    title="Read-only Agent View"
                    trigger="Agent opens CDA after finalization."
                    behavior="Show final payout read-only."
                    variant="success"
                    primaryAction="View final payout"
                    secondaryAction="Download PDF"
                  />

                  {/* Q. Archived Fee Used In CDA */}
                  <StateCard
                    title="Archived Fee Used In CDA"
                    trigger="Fee type archived after CDA creation."
                    behavior="Keep historical fee on CDA."
                    primaryAction="Show archived indicator"
                  />

                  {/* R. Deleted/Inactive Agent */}
                  <StateCard
                    title="Deleted/Inactive Agent"
                    trigger="Agent removed from team after CDA draft."
                    behavior="Keep historical participant, flag inactive."
                    variant="warning"
                    primaryAction="Show inactive indicator"
                  />

                  {/* S. Duplicate CDA Attempt */}
                  <StateCard
                    title="Duplicate CDA Attempt"
                    trigger="User clicks CDA Breakdown repeatedly."
                    behavior="Open existing CDA draft. Do not create duplicate."
                    primaryAction="Open existing draft"
                  />

                  {/* T. Unsaved Changes */}
                  <StateCard
                    title="Unsaved Changes"
                    trigger="User edits and tries to leave."
                    behavior="Show unsaved changes dialog."
                    variant="warning"
                    primaryAction="Save changes"
                    secondaryAction="Discard changes"
                  />
                </div>
              </section>

              {/* Validation Examples Section */}
              <section>
                <h2 className="text-lg font-medium mb-4">Validation Examples</h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-start gap-3 p-3 border rounded-lg bg-red-50/30 dark:bg-red-950/20 border-red-200 dark:border-red-900/50">
                        <XCircle className="size-4 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-red-900 dark:text-red-100">
                            Split total must equal 100%
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                            Current total: 95%. Add 5% to continue.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 border rounded-lg bg-red-50/30 dark:bg-red-950/20 border-red-200 dark:border-red-900/50">
                        <XCircle className="size-4 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-red-900 dark:text-red-100">
                            Radius fee is required
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                            Auditor must enter Radius fee before finalization.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 border rounded-lg bg-amber-50/30 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
                        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-amber-900 dark:text-amber-100">
                            Fee amount is required
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            Enter fee amount or remove from deductions.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 border rounded-lg bg-amber-50/30 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
                        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-amber-900 dark:text-amber-100">
                            Percentage basis is required
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            Percentage fees require a basis amount.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 border rounded-lg bg-red-50/30 dark:bg-red-950/20 border-red-200 dark:border-red-900/50">
                        <XCircle className="size-4 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-red-900 dark:text-red-100">
                            Tier ranges cannot overlap
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                            Tier 2 starts at $50K but Tier 1 ends at $60K.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 border rounded-lg bg-amber-50/30 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
                        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-amber-900 dark:text-amber-100">
                            Finalize unavailable
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            Complete all approvals before finalization.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Permission Matrix Section */}
              <section>
                <h2 className="text-lg font-medium mb-4">Permission Matrix</h2>
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Role</TableHead>
                          <TableHead className="text-center">View CDA</TableHead>
                          <TableHead className="text-center">Edit Plan</TableHead>
                          <TableHead className="text-center">Edit Fees</TableHead>
                          <TableHead className="text-center">Edit Radius Fee</TableHead>
                          <TableHead className="text-center">Confirm Payout</TableHead>
                          <TableHead className="text-center">Finalize CDA</TableHead>
                          <TableHead className="text-center">Export PDF</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Agent</TableCell>
                          <TableCell className="text-center">
                            <Eye className="size-4 text-green-600 dark:text-green-500 mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <XCircle className="size-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <XCircle className="size-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <XCircle className="size-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <CheckCircle2 className="size-4 text-green-600 dark:text-green-500 mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <XCircle className="size-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Download className="size-4 text-green-600 dark:text-green-500 mx-auto" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Team Lead</TableCell>
                          <TableCell className="text-center">
                            <Eye className="size-4 text-green-600 dark:text-green-500 mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Edit className="size-4 text-green-600 dark:text-green-500 mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Edit className="size-4 text-green-600 dark:text-green-500 mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <XCircle className="size-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <XCircle className="size-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <XCircle className="size-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Download className="size-4 text-green-600 dark:text-green-500 mx-auto" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">TC</TableCell>
                          <TableCell className="text-center">
                            <Eye className="size-4 text-amber-600 dark:text-amber-500 mx-auto" title="Depends on assignment" />
                          </TableCell>
                          <TableCell className="text-center">
                            <XCircle className="size-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <XCircle className="size-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <XCircle className="size-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <XCircle className="size-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <XCircle className="size-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <XCircle className="size-4 text-muted-foreground mx-auto" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Auditor</TableCell>
                          <TableCell className="text-center">
                            <Eye className="size-4 text-green-600 dark:text-green-500 mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <XCircle className="size-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <XCircle className="size-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Edit className="size-4 text-green-600 dark:text-green-500 mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <XCircle className="size-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <CheckCircle2 className="size-4 text-green-600 dark:text-green-500 mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Download className="size-4 text-green-600 dark:text-green-500 mx-auto" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Admin</TableCell>
                          <TableCell className="text-center">
                            <Eye className="size-4 text-green-600 dark:text-green-500 mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Settings className="size-4 text-green-600 dark:text-green-500 mx-auto" title="Full settings access" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Settings className="size-4 text-green-600 dark:text-green-500 mx-auto" title="Full settings access" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Edit className="size-4 text-green-600 dark:text-green-500 mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <XCircle className="size-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <CheckCircle2 className="size-4 text-green-600 dark:text-green-500 mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Download className="size-4 text-green-600 dark:text-green-500 mx-auto" />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </section>

              {/* Empty States Section */}
              <section>
                <h2 className="text-lg font-medium mb-4">Empty States</h2>
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <FinanceEmptyState
                      icon={TrendingUp}
                      title="No commission plans"
                      description="Create your first commission plan"
                      action={{
                        label: "Add Plan",
                        onClick: () => console.log("Add plan"),
                      }}
                    />
                  </Card>
                  <Card>
                    <FinanceEmptyState
                      icon={Receipt}
                      title="No fee types"
                      description="Create your first fee type"
                      action={{
                        label: "Add Fee Type",
                        onClick: () => console.log("Add fee type"),
                      }}
                    />
                  </Card>
                  <Card>
                    <FinanceEmptyState
                      icon={Users}
                      title="No assigned agents"
                      description="Assign agents to this CDA"
                      action={{
                        label: "Add Agent",
                        onClick: () => console.log("Add agent"),
                      }}
                    />
                  </Card>
                  <Card>
                    <FinanceEmptyState
                      icon={FileText}
                      title="No CDA history"
                      description="No commission agreements yet"
                      action={{
                        label: "Create CDA",
                        onClick: () => console.log("Create CDA"),
                      }}
                    />
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
