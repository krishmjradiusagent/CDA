# Plan for Bulk Assign/Unassign Modal

1. In `AssignDefaultsForm`, add a new field: `actionType: "assign" | "unassign"`. Default to `"assign"`.
2. In `AssignDefaultsDialog`, when `showAssignTo` is true and `source.from === "plan"` or `source.from === "bulk"`, show a ToggleGroup or Tabs for `Action: [ Assign ] [ Unassign ]`.
3. If `actionType === "assign"`, the modal behaves like an Add operation:
   - "Apply To CDA Types": Select the types to ADD.
   - Text: "These types will be added to the selected agents."
4. If `actionType === "unassign"`, the modal behaves like a Remove operation:
   - "Remove From CDA Types": Select the types to REMOVE.
   - Text: "These types will be removed from the selected agents."
5. Update `saveAssignDefaults`:
   - If `actionType === "assign"`:
     - For each selected agent, ADD the selected `dealTypes` to `existingSamePlan.dealTypes`.
     - DO NOT overwrite `false` for types that were not selected in the modal! Only set `true` for selected ones. (Wait, what if they want to explicitly set a type to false? That's what "Unassign" is for!)
   - If `actionType === "unassign"`:
     - For each selected agent, REMOVE the selected `dealTypes` from `existingSamePlan.dealTypes`.
     - If all `dealTypes` for that plan become false, and `feeIds` is empty, remove the `AgentAssignment` entirely.
