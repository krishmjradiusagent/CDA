import { useMemo, useState, type ReactNode } from "react";
import {
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { Checkbox } from "../components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { cn } from "../components/ui/utils";

export type SettingsRole =
  | "agent"
  | "team_lead"
  | "group_lead"
  | "radius_auditing"
  | "soul_auditor";

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl?: string;
  groupId: string | null;
  internalCap: number;
  teamSplit: number;
  preRadiusContribution: number;
  auditor: boolean;
  agentToGroupResetDate: string;
};

type GroupRecord = {
  id: string;
  name: string;
  leadId: string;
  memberIds: string[];
  internalCap: number;
  groupToTeamResetDate: string;
};

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

const SEED_MEMBERS: Member[] = [
  {
    id: "a1",
    firstName: "Ila",
    lastName: "Corcoran",
    email: "ila@radiusagent.com",
    phone: "415-555-0101",
    role: "Agent",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    groupId: "gr-west",
    internalCap: 250000,
    teamSplit: 20,
    preRadiusContribution: 0,
    auditor: false,
    agentToGroupResetDate: "2027-01-01",
  },
  {
    id: "a2",
    firstName: "Michael",
    lastName: "Tran",
    email: "michael@radiusagent.com",
    phone: "415-555-0102",
    role: "Agent",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    groupId: "gr-west",
    internalCap: 180000,
    teamSplit: 20,
    preRadiusContribution: 0,
    auditor: false,
    agentToGroupResetDate: "2027-01-01",
  },
  {
    id: "a3",
    firstName: "Sarah",
    lastName: "Jenkins",
    email: "sarah@radiusagent.com",
    phone: "415-555-0103",
    role: "Team Lead",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
    groupId: null,
    internalCap: 1000000,
    teamSplit: 0,
    preRadiusContribution: 0,
    auditor: true,
    agentToGroupResetDate: "",
  },
  {
    id: "a4",
    firstName: "David",
    lastName: "Chen",
    email: "david@radiusagent.com",
    phone: "415-555-0104",
    role: "Broker",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    groupId: "gr-east",
    internalCap: 400000,
    teamSplit: 20,
    preRadiusContribution: 15000,
    auditor: false,
    agentToGroupResetDate: "2026-12-31",
  },
  {
    id: "a5",
    firstName: "Emma",
    lastName: "Wilson",
    email: "emma@radiusagent.com",
    phone: "415-555-0105",
    role: "Group Lead",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
    groupId: "gr-west",
    internalCap: 500000,
    teamSplit: 20,
    preRadiusContribution: 0,
    auditor: false,
    agentToGroupResetDate: "2027-01-01",
  },
  {
    id: "a6",
    firstName: "James",
    lastName: "Miller",
    email: "james@radiusagent.com",
    phone: "415-555-0106",
    role: "Group Lead",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop",
    groupId: "gr-east",
    internalCap: 500000,
    teamSplit: 20,
    preRadiusContribution: 0,
    auditor: false,
    agentToGroupResetDate: "2026-12-31",
  },
  {
    id: "a7",
    firstName: "Olivia",
    lastName: "Taylor",
    email: "olivia@radiusagent.com",
    phone: "415-555-0107",
    role: "Agent",
    avatarUrl:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=150&auto=format&fit=crop",
    groupId: "gr-west",
    internalCap: 120000,
    teamSplit: 20,
    preRadiusContribution: 0,
    auditor: false,
    agentToGroupResetDate: "2027-01-01",
  },
  {
    id: "a8",
    firstName: "Noah",
    lastName: "Garcia",
    email: "noah@radiusagent.com",
    phone: "415-555-0108",
    role: "Agent",
    avatarUrl:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop",
    groupId: "gr-east",
    internalCap: 150000,
    teamSplit: 20,
    preRadiusContribution: 0,
    auditor: false,
    agentToGroupResetDate: "2026-12-31",
  },
  {
    id: "a9",
    firstName: "Sophia",
    lastName: "Brown",
    email: "sophia@radiusagent.com",
    phone: "415-555-0109",
    role: "Agent",
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop",
    groupId: "gr-east",
    internalCap: 200000,
    teamSplit: 20,
    preRadiusContribution: 0,
    auditor: false,
    agentToGroupResetDate: "2026-12-31",
  },
];

const SEED_GROUPS: GroupRecord[] = [
  {
    id: "gr-west",
    name: "West",
    leadId: "a5",
    memberIds: ["a5", "a1", "a2", "a7"],
    internalCap: 750000,
    groupToTeamResetDate: "2027-01-01",
  },
  {
    id: "gr-east",
    name: "East",
    leadId: "a6",
    memberIds: ["a6", "a4", "a8", "a9"],
    internalCap: 800000,
    groupToTeamResetDate: "2026-12-31",
  },
];

function initials(m: Member) {
  return `${m.firstName[0] ?? ""}${m.lastName[0] ?? ""}`.toUpperCase();
}

function fullName(m: Member) {
  return `${m.firstName} ${m.lastName}`.trim();
}

type MemberForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  internalCap: string;
  capResetDate: string;
  teamSplit: string;
  preRadiusContribution: string;
  auditor: boolean;
  groupId: string;
};

type GroupForm = {
  name: string;
  leadId: string;
  memberIds: string[];
  internalCap: string;
  groupToTeamResetDate: string;
};

const emptyMemberForm = (): MemberForm => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  internalCap: "",
  capResetDate: "",
  teamSplit: "",
  preRadiusContribution: "0",
  auditor: false,
  groupId: "",
});

const emptyGroupForm = (): GroupForm => ({
  name: "",
  leadId: "",
  memberIds: [],
  internalCap: "",
  groupToTeamResetDate: "",
});

export function TeamSettingsPanel({ userRole }: { userRole: SettingsRole }) {
  const isTeamLead = userRole === "team_lead" || userRole === "soul_auditor" || userRole === "radius_auditing";
  const isGroupLead = userRole === "group_lead";
  const isAgent = userRole === "agent";
  const canEditTeam = isTeamLead && !isAgent;
  const canEditGroup = isGroupLead && !isAgent;
  const readOnly = isAgent;

  const [openSection, setOpenSection] = useState<"members" | "groups" | "team-info" | null>(
    isGroupLead ? "groups" : null,
  );
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const [groups, setGroups] = useState<GroupRecord[]>(SEED_GROUPS);
  const [query, setQuery] = useState("");
  const [activeGroupId, setActiveGroupId] = useState<string | null>(
    isGroupLead ? "gr-west" : null,
  );

  const [memberDialog, setMemberDialog] = useState<"edit" | "cap" | "add" | null>(null);
  const [memberTargetId, setMemberTargetId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<MemberForm>(emptyMemberForm);

  const [groupDialog, setGroupDialog] = useState<"edit" | "cap" | "add" | null>(null);
  const [groupTargetId, setGroupTargetId] = useState<string | null>(null);
  const [groupForm, setGroupForm] = useState<GroupForm>(emptyGroupForm);

  const [confirm, setConfirm] = useState<
    | { kind: "member"; id: string; name: string }
    | { kind: "group"; id: string; name: string }
    | null
  >(null);

  const scopedMembers = useMemo(() => {
    if (isGroupLead) return members.filter((m) => m.groupId === "gr-west");
    return members;
  }, [members, isGroupLead]);

  const scopedGroups = useMemo(() => {
    if (isGroupLead) return groups.filter((g) => g.id === "gr-west");
    return groups;
  }, [groups, isGroupLead]);

  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null;

  const memberList = useMemo(() => {
    const source =
      openSection === "groups" && activeGroup
        ? members.filter((m) => m.groupId === activeGroup.id)
        : scopedMembers;
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter(
      (m) =>
        fullName(m).toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q),
    );
  }, [openSection, activeGroup, members, scopedMembers, query]);

  function openAddMember() {
    if (readOnly) return;
    setMemberTargetId(null);
    setMemberForm({
      ...emptyMemberForm(),
      groupId: activeGroupId ?? (isGroupLead ? "gr-west" : ""),
    });
    setMemberDialog("add");
  }

  function openEditMember(m: Member) {
    if (readOnly) return;
    setMemberTargetId(m.id);
    setMemberForm({
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      phone: m.phone,
      internalCap: String(m.internalCap || ""),
      capResetDate: m.agentToGroupResetDate,
      teamSplit: String(m.teamSplit || ""),
      preRadiusContribution: String(m.preRadiusContribution || 0),
      auditor: m.auditor,
      groupId: m.groupId ?? "",
    });
    setMemberDialog("edit");
  }

  function openMemberCap(m: Member) {
    if (readOnly) return;
    setMemberTargetId(m.id);
    setMemberForm({
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      phone: m.phone,
      internalCap: String(m.internalCap || ""),
      capResetDate: m.agentToGroupResetDate,
      teamSplit: String(m.teamSplit || ""),
      preRadiusContribution: String(m.preRadiusContribution || 0),
      auditor: m.auditor,
      groupId: m.groupId ?? "",
    });
    setMemberDialog("cap");
  }

  function saveMember() {
    if (!memberForm.firstName.trim() || !memberForm.email.trim()) {
      toast("First name and email required");
      return;
    }
    const cap = Number(memberForm.internalCap) || 0;
    const split = Number(memberForm.teamSplit) || 0;
    const pre = Number(memberForm.preRadiusContribution) || 0;
    const reset = canEditGroup ? memberForm.capResetDate : undefined;

    if (memberDialog === "add") {
      const id = `m-${Date.now()}`;
      const next: Member = {
        id,
        firstName: memberForm.firstName.trim(),
        lastName: memberForm.lastName.trim(),
        email: memberForm.email.trim(),
        phone: memberForm.phone.trim(),
        role: "Agent",
        groupId: memberForm.groupId || null,
        internalCap: cap,
        teamSplit: split,
        preRadiusContribution: pre,
        auditor: memberForm.auditor,
        agentToGroupResetDate: reset ?? "",
      };
      setMembers((cur) => [...cur, next]);
      if (memberForm.groupId) {
        setGroups((cur) =>
          cur.map((g) =>
            g.id === memberForm.groupId
              ? { ...g, memberIds: [...g.memberIds, id] }
              : g,
          ),
        );
      }
      toast("Team member added");
    } else if (memberTargetId) {
      setMembers((cur) =>
        cur.map((m) =>
          m.id === memberTargetId
            ? {
                ...m,
                firstName: memberForm.firstName.trim(),
                lastName: memberForm.lastName.trim(),
                email: memberForm.email.trim(),
                phone: memberForm.phone.trim(),
                internalCap: cap,
                teamSplit: split,
                preRadiusContribution: pre,
                auditor: memberForm.auditor,
                groupId: memberForm.groupId || null,
                agentToGroupResetDate:
                  reset !== undefined ? reset : m.agentToGroupResetDate,
              }
            : m,
        ),
      );
      toast(memberDialog === "cap" ? "Internal cap saved" : "Team member updated");
    }
    setMemberDialog(null);
  }

  function removeMember(id: string) {
    if (readOnly) return;
    setMembers((cur) => cur.filter((m) => m.id !== id));
    setGroups((cur) =>
      cur.map((g) => ({ ...g, memberIds: g.memberIds.filter((x) => x !== id) })),
    );
    toast("Team member removed");
  }

  function requestRemoveMember(m: Member) {
    if (readOnly) return;
    setConfirm({ kind: "member", id: m.id, name: fullName(m) });
  }

  function openAddGroup() {
    if (!canEditTeam) return;
    setGroupTargetId(null);
    setGroupForm(emptyGroupForm());
    setGroupDialog("add");
  }

  function openEditGroup(g: GroupRecord) {
    if (readOnly) return;
    setGroupTargetId(g.id);
    setGroupForm({
      name: g.name,
      leadId: g.leadId,
      memberIds: [...g.memberIds],
      internalCap: String(g.internalCap || ""),
      groupToTeamResetDate: g.groupToTeamResetDate,
    });
    setGroupDialog("edit");
  }

  function openGroupCap(g: GroupRecord) {
    if (readOnly) return;
    setGroupTargetId(g.id);
    setGroupForm({
      name: g.name,
      leadId: g.leadId,
      memberIds: [...g.memberIds],
      internalCap: String(g.internalCap || ""),
      groupToTeamResetDate: g.groupToTeamResetDate,
    });
    setGroupDialog("cap");
  }

  function saveGroup() {
    if (!groupForm.name.trim()) {
      toast("Group name required");
      return;
    }
    const cap = Number(groupForm.internalCap) || 0;
    const reset = canEditTeam ? groupForm.groupToTeamResetDate : undefined;

    if (groupDialog === "add") {
      const id = `gr-${Date.now()}`;
      setGroups((cur) => [
        ...cur,
        {
          id,
          name: groupForm.name.trim(),
          leadId: groupForm.leadId,
          memberIds: groupForm.memberIds,
          internalCap: cap,
          groupToTeamResetDate: reset ?? "",
        },
      ]);
      setMembers((cur) =>
        cur.map((m) =>
          groupForm.memberIds.includes(m.id) ? { ...m, groupId: id } : m,
        ),
      );
      toast("Group created");
    } else if (groupTargetId) {
      setGroups((cur) =>
        cur.map((g) =>
          g.id === groupTargetId
            ? {
                ...g,
                name: groupForm.name.trim(),
                leadId: groupForm.leadId,
                memberIds: groupForm.memberIds,
                internalCap: cap,
                groupToTeamResetDate:
                  reset !== undefined ? reset : g.groupToTeamResetDate,
              }
            : g,
        ),
      );
      setMembers((cur) =>
        cur.map((m) =>
          m.groupId === groupTargetId && !groupForm.memberIds.includes(m.id)
            ? { ...m, groupId: null }
            : groupForm.memberIds.includes(m.id)
              ? { ...m, groupId: groupTargetId }
              : m,
        ),
      );
      toast(groupDialog === "cap" ? "Group internal cap saved" : "Group updated");
    }
    setGroupDialog(null);
  }

  function removeGroup(id: string) {
    if (!canEditTeam) return;
    setGroups((cur) => cur.filter((g) => g.id !== id));
    setMembers((cur) =>
      cur.map((m) => (m.groupId === id ? { ...m, groupId: null } : m)),
    );
    if (activeGroupId === id) {
      setActiveGroupId(null);
    }
    toast("Group removed");
  }

  function requestRemoveGroup(g: GroupRecord) {
    if (!canEditTeam) return;
    setConfirm({ kind: "group", id: g.id, name: g.name });
  }

  function confirmRemove() {
    if (!confirm) return;
    if (confirm.kind === "member") removeMember(confirm.id);
    else removeGroup(confirm.id);
    setConfirm(null);
  }

  function toggleGroupMember(id: string) {
    setGroupForm((f) => ({
      ...f,
      memberIds: f.memberIds.includes(id)
        ? f.memberIds.filter((x) => x !== id)
        : [...f.memberIds, id],
    }));
  }

  const leadName = (leadId: string) => {
    const m = members.find((x) => x.id === leadId);
    return m ? fullName(m) : "—";
  };

  function toggleSection(section: "members" | "groups" | "team-info") {
    setQuery("");
    setOpenSection((cur) => {
      const next = cur === section ? null : section;
      return next;
    });
    if (section === "groups") {
      setActiveGroupId((id) => id ?? (isGroupLead ? "gr-west" : null));
    }
  }

  return (
    <div className="px-4 py-9">
      {isGroupLead ? (
        <>
          <p className="mb-6 text-[13px] text-muted-foreground">
            Your group cap and reset date are set by the Team Lead. You set the internal cap for each
            member of your group.
          </p>
          <div className="flex flex-col gap-3.5">
            <div className="rounded-[14px] border border-border bg-card p-4">
              <HubRow
                title={activeGroup ? `${activeGroup.name} group` : "Group"}
                count={String(memberList.length)}
                description="Members of your group and their internal caps."
                expanded={openSection === "groups"}
                onClick={() => toggleSection("groups")}
              />
              {openSection === "groups" && activeGroup && (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <MetaCard label="Group lead" value={leadName(activeGroup.leadId)} />
                    <MetaCard
                      label="Group internal cap"
                      value={activeGroup.internalCap ? money(activeGroup.internalCap) : "—"}
                      hint="Set by Team Lead"
                    />
                    <MetaCard
                      label="Reset date"
                      value={formatDate(activeGroup.groupToTeamResetDate) || "—"}
                      hint="Set by Team Lead"
                    />
                  </div>
                  <GroupCapTable
                    title={`${activeGroup.name} members`}
                    query={query}
                    onQuery={setQuery}
                    rows={memberList}
                    onSetCap={openMemberCap}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
      <>
      <p className="mb-6 text-[13px] text-muted-foreground">
        Caps roll up Agent → Group → Team. Group Leads set the reset date for agents; Team Leads set the reset date for groups.
      </p>
      <div className="flex flex-col gap-3.5">
        <div className="rounded-[14px] border border-border bg-card p-4">
          <HubRow
            title="Team member"
            count={String(scopedMembers.length)}
            description="Efficiently manage your real estate team in Radius Agent."
            expanded={openSection === "members"}
            onClick={() => toggleSection("members")}
          />
          {openSection === "members" && (
            <div className="mt-4">
              <MemberTable
                title="Team member"
                count={scopedMembers.length}
                query={query}
                onQuery={setQuery}
                rows={memberList}
                groups={groups}
                showAgentGroupReset={false}
                canEdit={!readOnly}
                embedded
                onAdd={readOnly ? undefined : openAddMember}
                onEdit={openEditMember}
                onSetCap={openMemberCap}
                onRemove={requestRemoveMember}
              />
            </div>
          )}
        </div>

        <div className="rounded-[14px] border border-border bg-card p-4">
          <HubRow
            title="Groups"
            count={String(scopedGroups.length)}
            description="Create a group and add members to it."
            expanded={openSection === "groups"}
            onClick={() => toggleSection("groups")}
            action={
              canEditTeam ? (
                <Button size="sm" onClick={openAddGroup}>
                  <Plus className="size-4" />
                  New group
                </Button>
              ) : undefined
            }
          />
          {openSection === "groups" && (
            <div className="mt-4 space-y-4">
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Name</TableHead>
                      <TableHead>Group lead</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Internal cap</TableHead>
                      <TableHead>Reset date</TableHead>
                      <TableHead className="w-12 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scopedGroups.map((g) => (
                      <TableRow key={g.id} className="h-14">
                        <TableCell className="font-medium">{g.name}</TableCell>
                        <TableCell>{leadName(g.leadId)}</TableCell>
                        <TableCell>{g.memberIds.length}</TableCell>
                        <TableCell>
                          <CapCell
                            amount={g.internalCap}
                            canSet={canEditTeam}
                            onSet={() => openGroupCap(g)}
                          />
                        </TableCell>
                        <TableCell>
                          {g.groupToTeamResetDate ? (
                            formatDate(g.groupToTeamResetDate)
                          ) : canEditTeam ? (
                            <button
                              type="button"
                              className="text-[13px] font-medium text-primary"
                              onClick={() => openGroupCap(g)}
                            >
                              Set reset date
                            </button>
                          ) : (
                            <span className="text-[13px] text-muted-foreground">Set by Team Lead</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {canEditTeam && (
                            <RowMenu
                              onEdit={() => openEditGroup(g)}
                              onSetCap={() => openGroupCap(g)}
                              onRemove={() => requestRemoveGroup(g)}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[14px] border border-border bg-card p-4">
          <HubRow
            title="Team Information"
            description="Informations about team name, about your team, benefits."
            expanded={openSection === "team-info"}
            onClick={() => toggleSection("team-info")}
          />
          {openSection === "team-info" && (
            <div className="mt-4 space-y-3">
              <div>
                <Label>Team name</Label>
                <Input defaultValue="Radius Agent" disabled={!canEditTeam} className="mt-1" />
              </div>
              <div>
                <Label>About your team</Label>
                <Input defaultValue="Bay Area residential" disabled={!canEditTeam} className="mt-1" />
              </div>
              <div>
                <Label>Benefits</Label>
                <Input defaultValue="Cap sharing, group splits, CDA automation" disabled={!canEditTeam} className="mt-1" />
              </div>
            </div>
          )}
        </div>
      </div>
      </>
      )}

      <Dialog open={memberDialog !== null} onOpenChange={(o) => !o && setMemberDialog(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {memberDialog === "add"
                ? "Add team member"
                : memberDialog === "cap"
                  ? "Set internal cap"
                  : "Edit team member"}
            </DialogTitle>
            <DialogDescription>
              {memberDialog === "cap"
                ? "Internal cap on this member. Agent > Group reset date is set by the Group Lead."
                : "Modify team member information below."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {memberDialog !== "cap" && (
              <>
                <Field label="First name" required>
                  <Input
                    value={memberForm.firstName}
                    onChange={(e) => setMemberForm((f) => ({ ...f, firstName: e.target.value }))}
                  />
                </Field>
                <Field label="Last name">
                  <Input
                    value={memberForm.lastName}
                    onChange={(e) => setMemberForm((f) => ({ ...f, lastName: e.target.value }))}
                  />
                </Field>
                <Field label="Email address" required>
                  <Input
                    type="email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </Field>
                <Field label="Phone number">
                  <Input
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </Field>
              </>
            )}
            <Field label="Internal team cap">
              <Input
                placeholder="Enter internal team cap"
                value={memberForm.internalCap}
                onChange={(e) => setMemberForm((f) => ({ ...f, internalCap: e.target.value }))}
              />
            </Field>
            <Field label="Cap reset date">
              {canEditGroup ? (
                <DateField
                  value={memberForm.capResetDate}
                  onChange={(v) => setMemberForm((f) => ({ ...f, capResetDate: v }))}
                />
              ) : (
                <p className="text-[13px] text-foreground">
                  {formatDate(memberForm.capResetDate) || "—"}
                  <span className="mt-0.5 block text-[13px] text-muted-foreground">Set by Group Lead</span>
                </p>
              )}
            </Field>
            {memberDialog !== "cap" && (
              <>
                <Field label="Team Split">
                  <div className="relative">
                    <Input
                      placeholder="Enter team split"
                      value={memberForm.teamSplit}
                      onChange={(e) => setMemberForm((f) => ({ ...f, teamSplit: e.target.value }))}
                      className="pr-8"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                </Field>
                <Field label="Pre-Radius Contribution to Cap">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      value={memberForm.preRadiusContribution}
                      onChange={(e) =>
                        setMemberForm((f) => ({ ...f, preRadiusContribution: e.target.value }))
                      }
                      className="pl-7"
                    />
                  </div>
                </Field>
                <Field label="Group">
                  <Select
                    value={memberForm.groupId || "none"}
                    onValueChange={(v) =>
                      setMemberForm((f) => ({ ...f, groupId: v === "none" ? "" : v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No group</SelectItem>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={memberForm.auditor}
                    onCheckedChange={(v) => setMemberForm((f) => ({ ...f, auditor: v === true }))}
                  />
                  Auditor
                </label>
              </>
            )}
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={saveMember}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={groupDialog !== null} onOpenChange={(o) => !o && setGroupDialog(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {groupDialog === "add"
                ? "Create a group"
                : groupDialog === "cap"
                  ? "Set internal cap"
                  : "Edit group"}
            </DialogTitle>
            <DialogDescription>
              {groupDialog === "add"
                ? "Create new groups to organize agents for efficient lead assignment and management."
                : "Internal cap can be set on a group. Group > Team reset date is set by the Team Lead."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {groupDialog !== "cap" && (
              <>
                <Field label="Choose a unique name">
                  <Input
                    placeholder="Choose a unique name..."
                    value={groupForm.name}
                    onChange={(e) => setGroupForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </Field>
                <Field label="Select group lead">
                  <Select
                    value={groupForm.leadId || undefined}
                    onValueChange={(v) => setGroupForm((f) => ({ ...f, leadId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select group lead" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {fullName(m)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <div>
                  <Label className="text-sm">Add agents to rotation</Label>
                  <div className="mt-2 max-h-40 overflow-y-auto rounded-md border p-2">
                    {members.map((m) => (
                      <label key={m.id} className="flex items-center gap-2 py-1 text-sm">
                        <Checkbox
                          checked={groupForm.memberIds.includes(m.id)}
                          onCheckedChange={() => toggleGroupMember(m.id)}
                        />
                        {fullName(m)}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
            <Field label="Internal cap">
              <Input
                placeholder="Enter internal cap"
                value={groupForm.internalCap}
                onChange={(e) => setGroupForm((f) => ({ ...f, internalCap: e.target.value }))}
              />
            </Field>
            <Field label="Cap reset date">
              {canEditTeam ? (
                <DateField
                  value={groupForm.groupToTeamResetDate}
                  onChange={(v) => setGroupForm((f) => ({ ...f, groupToTeamResetDate: v }))}
                />
              ) : (
                <p className="text-[13px] text-foreground">
                  {formatDate(groupForm.groupToTeamResetDate) || "—"}
                  <span className="mt-0.5 block text-[13px] text-muted-foreground">Set by Team Lead</span>
                </p>
              )}
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDialog(null)}>
              Cancel
            </Button>
            <Button onClick={saveGroup}>
              {groupDialog === "add" ? "Create group" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.kind === "group" ? "Remove group?" : "Remove team member?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm
                ? confirm.kind === "group"
                  ? `Remove ${confirm.name}? Members stay on the team, ungrouped.`
                  : `Remove ${confirm.name} from the team? This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={confirmRemove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


function formatDate(value: string) {
  if (!value) return "";
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}

function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const selected = value ? parseISO(value) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start font-normal">
          <CalendarIcon className="size-4" />
          {selected ? format(selected, "MMM d, yyyy") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => d && onChange(format(d, "yyyy-MM-dd"))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function CapCell({
  amount,
  canSet,
  onSet,
}: {
  amount: number;
  canSet: boolean;
  onSet: () => void;
}) {
  if (amount > 0) return <span>{money(amount)}</span>;
  if (canSet) {
    return (
      <button type="button" className="text-[13px] font-medium text-primary" onClick={onSet}>
        Set internal cap
      </button>
    );
  }
  return <span className="text-muted-foreground">—</span>;
}

function HubRow({
  title,
  count,
  description: _description,
  expanded,
  onClick,
  action,
}: {
  title: string;
  count?: string;
  description: string;
  expanded?: boolean;
  onClick: () => void;
  action?: ReactNode;
}) {
  void _description;
  return (
    <div className="flex min-h-8 w-full items-center gap-3">
      <button type="button" onClick={onClick} className="flex-1 text-left">
        <span className="text-sm font-semibold leading-[1.3] text-foreground">{title}</span>
      </button>
      {action && <div className="shrink-0">{action}</div>}
      <button
        type="button"
        onClick={onClick}
        className="flex shrink-0 items-center gap-2"
        aria-label={expanded ? "Collapse" : "Expand"}
      >
        {count !== undefined && (
          <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
        )}
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-[180ms] ease-out motion-reduce:transition-none",
            !expanded && "-rotate-90",
          )}
        />
      </button>
    </div>
  );
}

function MemberTable({
  title,
  count,
  query,
  onQuery,
  rows,
  groups,
  showAgentGroupReset,
  canEdit,
  onAdd,
  onEdit,
  onSetCap,
  onRemove,
  embedded,
}: {
  title: string;
  count: number;
  query: string;
  onQuery: (v: string) => void;
  rows: Member[];
  groups: GroupRecord[];
  showAgentGroupReset: boolean;
  canEdit: boolean;
  onAdd?: () => void;
  onEdit: (m: Member) => void;
  onSetCap: (m: Member) => void;
  onRemove: (m: Member) => void;
  embedded?: boolean;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          {!embedded && (
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-semibold text-[#373758]">{title}</h2>
              <span className="text-[13px] tabular-nums text-muted-foreground">{count}</span>
            </div>
          )}
          {embedded && (
            <p className="text-[13px] font-medium text-[#373758]">{title}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="relative w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search agents"
              className="h-9 rounded-full pl-9"
            />
          </div>
          {onAdd && (
            <Button size="sm" onClick={onAdd}>
              <Plus className="size-4" />
              Add team members
            </Button>
          )}
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-violet-50/80">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Internal cap</TableHead>
              {showAgentGroupReset && <TableHead>Reset date</TableHead>}
              <TableHead className="w-12 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((m) => (
              <TableRow key={m.id} className="h-10">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt="" />}
                      <AvatarFallback className="text-[13px]">{initials(m)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{fullName(m)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{m.email}</TableCell>
                <TableCell>{m.role}</TableCell>
                <TableCell>
                  {groups.find((g) => g.id === m.groupId)?.name ?? "—"}
                </TableCell>
                <TableCell>
                  <CapCell amount={m.internalCap} canSet={canEdit} onSet={() => onSetCap(m)} />
                </TableCell>
                {showAgentGroupReset && (
                  <TableCell>
                    {m.agentToGroupResetDate ? (
                      formatDate(m.agentToGroupResetDate)
                    ) : canEdit ? (
                      <button
                        type="button"
                        className="text-[13px] font-medium text-primary"
                        onClick={() => onSetCap(m)}
                      >
                        Set reset date
                      </button>
                    ) : (
                      <span className="text-[13px] text-muted-foreground">Set by Group Lead</span>
                    )}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  {canEdit && (
                    <RowMenu
                      onEdit={() => onEdit(m)}
                      onSetCap={() => onSetCap(m)}
                      onRemove={() => onRemove(m)}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function GroupCapTable({
  title,
  query,
  onQuery,
  rows,
  onSetCap,
}: {
  title: string;
  query: string;
  onQuery: (v: string) => void;
  rows: Member[];
  onSetCap: (m: Member) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="min-w-0 text-[13px] font-medium text-[#373758]">{title}</p>
        <div className="relative w-56 shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search agents"
            className="h-9 rounded-full pl-9"
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-violet-50/80">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Internal cap</TableHead>
              <TableHead>Reset date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((m) => (
              <TableRow key={m.id} className="h-10">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt="" />}
                      <AvatarFallback className="text-[13px]">{initials(m)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{fullName(m)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{m.email}</TableCell>
                <TableCell>{m.role}</TableCell>
                <TableCell>
                  <CapCell amount={m.internalCap} canSet onSet={() => onSetCap(m)} />
                </TableCell>
                <TableCell>
                  {m.agentToGroupResetDate ? (
                    formatDate(m.agentToGroupResetDate)
                  ) : (
                    <button
                      type="button"
                      className="text-[13px] font-medium text-primary"
                      onClick={() => onSetCap(m)}
                    >
                      Set reset date
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function RowMenu({
  onEdit,
  onSetCap,
  onRemove,
}: {
  onEdit: () => void;
  onSetCap: () => void;
  onRemove?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSetCap}>
          Set internal cap
        </DropdownMenuItem>
        {onRemove && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onRemove}>
              <Trash2 className="size-4" />
              Remove
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label className="text-sm">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-1 text-[13px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function MetaCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <span className="text-sm font-semibold text-[#373758]">{value}</span>
        {hint && <span className="text-[13px] text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

