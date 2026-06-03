### CDA System Overview & Settings Configuration

- Two main components: CDS settings (team lead access) and individual transaction processing
- Commission plan creation by team leads
    - Standard plans: flat 80/20 splits between team lead/agent
    - Tiered plans: progressive splits based on transaction volume, gross commission, or sales volume
    - Cap amounts calculated automatically per transaction
    - Pre-CDA vs post-CDA calculation options available
- Fee type management (PC, E&O, etc.)
    - Flat fee or percentage-based options
    - Percentage calculated from: pre-split amount, property value, post-split amount
    - Application timing: pre-split or post-split
    - Fee payer options: agent, team, or both (50/50 split)
- Sliding scale functionality for tier-based fee structures
    - Example: $1K-2K = 10%, $2K-3K = 15%
    - Min/max thresholds prevent fees below/above set amounts

### Transaction Processing & Deal Details

- CDA generation triggered when moving transaction from “new client” to “pending”
- Forced pop-up opens if agents skip cover sheet details
- Deal details section includes:
    - Purchase price, closing date, commission plans
    - Co-agent information (buyer/seller agents)
    - Default 50/50 splits for co-agents (editable)
    - Add fees functionality for agents (post-commission only)
- Commission plan assignment
    - Pre-selected if team lead assigned plan to agent
    - No plan = regular UI without commission features

### CDA Calculation & Approval Workflow

- Three-tier approval process: Agent → Team Lead → Auditor
- Commission breakdown page shows:
    - Total gross commission and sale price
    - Listing side vs buying side splits (0-100% range)
    - Individual agent breakdowns with commission plans
- Permission levels:
    1. Agents: post-commission deductions only, cannot add fees that benefit them
    2. Team leads: pre/post commission editing, can edit any values
    3. Auditors: full editing rights, can modify until closing date
- Approval reset mechanism
    - Any changes by higher authority resets entire approval chain
    - Process restarts from agent confirmation
- Comments system enables communication between all parties

### Next Steps

- Review calculation logic with Shelly for API integration
- Access GitHub repo and documentation for existing codebase
- Integrate design components with current system
- Implement notification system for approval workflow changes
- Disable CDA button until proper deal details completion
- Review Figma updates for cover sheet modifications