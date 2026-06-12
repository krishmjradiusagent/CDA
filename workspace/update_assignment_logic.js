const fs = require('fs');

const file = 'workspace/web-app/src/app/pages/CDASettings.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add overwriteAssignDefaults state
if (!content.includes('overwriteAssignDefaults: boolean;')) {
  content = content.replace(
    'isAssigning: boolean;\n  }>({',
    'isAssigning: boolean;\n    overwriteAssignDefaults: boolean;\n    pendingAssignmentSave: (() => void) | null;\n  }>({'
  );
  content = content.replace(
    'isAssigning: false,\n  });',
    'isAssigning: false,\n    overwriteAssignDefaults: false,\n    pendingAssignmentSave: null,\n  });'
  );
}

// Replace handleSaveAssignDefaults
const handleRegex = /function handleSaveAssignDefaults\(\) \{[\s\S]*?setState\(\(current\) => \{\n      let nextAssignments = current\.defaultAssignments;[\s\S]*?\}\);[\s\S]*?\}\n\n  function handleSavePlan\(\) \{/;

const newHandleSaveAssignDefaults = `function handleSaveAssignDefaults() {
    const source = state.assignDefaultsSource;
    const form = state.assignDefaultsForm;
    const errs: AssignDefaultsErrors = {};

    if (source.from !== "plan" && !form.planId) errs.planId = "Commission plan required";
    if (source.from !== "agent" && form.selectedAgentIds.length === 0) {
      errs.selectedAgentIds = "Select at least one agent";
    }

    if (Object.keys(errs).length > 0) {
      setState((current) => ({ ...current, assignDefaultsErrors: errs }));
      return;
    }

    const effectivePlanId = source.from === "plan" ? source.planId : form.planId || null;
    const effectiveFeeIds =
      source.from === "fee"
        ? [source.feeId, ...form.feeIds.filter((id) => id !== source.feeId)]
        : form.feeIds;
    const targetAgentIds =
      source.from === "agent"
        ? [source.agentId]
        : form.selectedAgentIds;

    const commitAssignment = () => {
      setState((current) => {
        let nextAssignments = [...current.defaultAssignments];

        if (source.from === "plan" || effectivePlanId) {
          const targetSet = new Set(targetAgentIds);
          const selectedTypesKeys = Object.keys(form.dealTypes).filter(k => form.dealTypes[k]);
          
          targetAgentIds.forEach(agentId => {
            // First, remove the overlapping deal types from existing assignments for this agent
            nextAssignments = nextAssignments.map(assignment => {
              if (assignment.agentId === agentId && assignment.planId !== effectivePlanId) {
                const newDealTypes = { ...assignment.dealTypes };
                selectedTypesKeys.forEach(k => { newDealTypes[k] = false; });
                return { ...assignment, dealTypes: newDealTypes };
              }
              return assignment;
            }).filter(assignment => {
              // Keep if it has at least one deal type, OR if it has fees
              const hasDealTypes = Object.values(assignment.dealTypes).some(v => v);
              return hasDealTypes || assignment.feeIds.length > 0;
            });

            // Now, find if there's an exact assignment for this plan already
            const existingSamePlan = nextAssignments.find(a => a.agentId === agentId && a.planId === effectivePlanId);
            if (existingSamePlan) {
              existingSamePlan.dealTypes = { ...existingSamePlan.dealTypes, ...form.dealTypes };
              existingSamePlan.feeIds = Array.from(new Set([...existingSamePlan.feeIds, ...effectiveFeeIds]));
              existingSamePlan.applyToActiveDeals = form.applyToActiveDeals;
            } else {
              nextAssignments.push({
                id: crypto.randomUUID(),
                agentId,
                planId: effectivePlanId,
                feeIds: effectiveFeeIds,
                dealTypes: form.dealTypes,
                applyToActiveDeals: form.applyToActiveDeals,
              });
            }
          });
        } else if (source.from === "fee") {
          const targetSet = new Set(targetAgentIds);
          nextAssignments = nextAssignments.map((assignment) => {
            if (targetSet.has(assignment.agentId)) {
              return {
                ...assignment,
                feeIds: Array.from(new Set([...assignment.feeIds, source.feeId]))
              };
            }
            return assignment;
          });
          // For agents that have NO assignments at all, create a blank one with just the fee
          targetAgentIds.forEach(agentId => {
            if (!nextAssignments.some(a => a.agentId === agentId)) {
              nextAssignments.push({
                id: crypto.randomUUID(),
                agentId,
                planId: null,
                feeIds: [source.feeId],
                dealTypes: { buyer: false, listing: false, referral: false, lease: false, "lease-listing": false },
                applyToActiveDeals: false,
              });
            }
          });
        } else if (source.from === "bulk" || source.from === "agent") {
          // Same logic as plan, just applying default plan + fees
          const targetSet = new Set(targetAgentIds);
          const selectedTypesKeys = Object.keys(form.dealTypes).filter(k => form.dealTypes[k]);
          
          targetAgentIds.forEach(agentId => {
            nextAssignments = nextAssignments.map(assignment => {
              if (assignment.agentId === agentId && assignment.planId !== effectivePlanId) {
                const newDealTypes = { ...assignment.dealTypes };
                selectedTypesKeys.forEach(k => { newDealTypes[k] = false; });
                return { ...assignment, dealTypes: newDealTypes };
              }
              return assignment;
            }).filter(assignment => Object.values(assignment.dealTypes).some(v => v) || assignment.feeIds.length > 0);

            const existingSamePlan = nextAssignments.find(a => a.agentId === agentId && a.planId === effectivePlanId);
            if (existingSamePlan) {
              existingSamePlan.dealTypes = { ...existingSamePlan.dealTypes, ...form.dealTypes };
              existingSamePlan.feeIds = Array.from(new Set([...existingSamePlan.feeIds, ...effectiveFeeIds]));
              existingSamePlan.applyToActiveDeals = form.applyToActiveDeals;
            } else {
              nextAssignments.push({
                id: crypto.randomUUID(),
                agentId,
                planId: effectivePlanId,
                feeIds: effectiveFeeIds,
                dealTypes: form.dealTypes,
                applyToActiveDeals: form.applyToActiveDeals,
              });
            }
          });
        }

        return {
          ...current,
          defaultAssignments: nextAssignments,
          activeDialog: null,
          assignDefaultsForm: getFreshAssignDefaultsForm(),
          assignDefaultsErrors: {},
          assignDefaultsSource: { from: "bulk" },
          overwriteAssignDefaults: false,
          pendingAssignmentSave: null,
        };
      });

      toast.success("Defaults assigned successfully");
    };

    // Check for conflicts before committing
    if (source.from === "plan" || effectivePlanId) {
      const selectedTypesKeys = Object.keys(form.dealTypes).filter(k => form.dealTypes[k]);
      const hasConflict = state.defaultAssignments.some(assignment => {
        if (!targetAgentIds.includes(assignment.agentId)) return false;
        if (assignment.planId === effectivePlanId) return false;
        return selectedTypesKeys.some(k => assignment.dealTypes[k]);
      });

      if (hasConflict) {
        setState(current => ({
          ...current,
          overwriteAssignDefaults: true,
          pendingAssignmentSave: commitAssignment,
        }));
        return;
      }
    }

    commitAssignment();
  }

  function handleSavePlan() {`;

content = content.replace(handleRegex, newHandleSaveAssignDefaults);

// Add AlertDialog for overwriteAssignDefaults near the other AlertDialogs
const alertRegex = /<AlertDialog\n\s*open=\{state\.overwriteOpen\}/;

const newAlert = `<AlertDialog
        open={state.overwriteAssignDefaults}
        onOpenChange={(open) => setState((current) => ({ ...current, overwriteAssignDefaults: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Override existing assignments?</AlertDialogTitle>
            <AlertDialogDescription>
              One or more selected agents already have a different commission plan assigned to the selected representation types. 
              Continuing will override their existing assignments for these representation types.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => state.pendingAssignmentSave && state.pendingAssignmentSave()}>
              Override Defaults
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={state.overwriteOpen}`;

content = content.replace(alertRegex, newAlert);

fs.writeFileSync(file, content);
console.log('Assignment logic updated to enforce 1 plan per representation type.');
