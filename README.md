---
project: Commission Breakdown
tags: [project/commission-breakdown, readme, type/documentation]
updated: 2026-07-05
---

# Commission Breakdown - Readme

**Connected to:** [[CLAUDE.md|Commission Breakdown CLAUDE]], [[workspace/CDA_SETTINGS_BACKEND_REFERENCE.md|CDA Settings Backend Reference]]

Clone this repo to start a Radius Agent product-design project.

This is the core Makato setup:
- no scripts
- no automation
- no vector DB
- no graph
- no Antigravity prompt pack
- no Figma Make prompt pack

Just markdown files, JSON output contracts, Radius Agent context, shadcn rules, and workspaces.

---

## What Makato Is

Makato is a context framework for LLM-assisted design work.

```txt
MA      = remove noisy context
KATA    = use repeatable task shapes
KAIZEN  = save lessons from mistakes
TRUTH   = product/design-system facts
HANDOFF = latest state between tools
```

Makato helps ChatGPT, Claude, Codex, and other LLMs use the same context.

---

## Folder Structure

```txt
makato-radius-core/
  AGENTS.md
  README.md

  makato/
    truth/
      product.md
      design-system.md
      shadcn.md
      roles.md
      radius-patterns.md
      figma.md

    knowledge/
      summaries.md
      decisions.md
      open-questions.md
      patterns.md
      meeting-converter-prompt.md

    ma/
      prune.md

    kata/
      task.md
      plan.md
      build.md
      audit.md
      handoff.md

    tools/
      chatgpt.md
      claude.md
      codex.md

    prompts/
      master-json-prompt.md
      meeting-to-knowledge.md

    kaizen/
      rules.md
      lessons.md

    handoff/
      latest.md

  workspace/
    html-prototype/
    web-app/
    mobile-design/
    docs/
    references/
```

---

## Where Work Goes

### HTML prototype

```txt
workspace/html-prototype/src/index.html
workspace/html-prototype/src/styles.css
workspace/html-prototype/assets/
```

Use for screenshot-to-code or code-to-Figma experiments.

### Web app

```txt
workspace/web-app/
```

Use for React, Next, Vite, shadcn, Tailwind implementations.

### Mobile design

```txt
workspace/mobile-design/
```

Use for mobile flows, screen notes, and design drafts.

### Docs

```txt
workspace/docs/
```

Use for PRDs, UX flows, audits, specs.

### References

```txt
workspace/references/
```

Use for screenshots, Figma exports, and visual references.

---

## Basic Workflow

1. Update `makato/kata/task.md`
2. Update `makato/ma/prune.md`
3. Add project knowledge into `makato/knowledge/`
4. Paste `makato/prompts/master-json-prompt.md` into your LLM
5. LLM returns JSON updates
6. Paste updates into matching markdown files
7. Continue from `makato/handoff/latest.md`

---

## Tool Flow

```txt
ChatGPT → shape task
Claude → plan / audit
Codex → implement
Kaizen → save lesson
```

---

## Radius Defaults

This repo assumes:
- Product: Radius Agent
- Domain: real estate CRM + transactions
- Roles: Agent, Team Lead, Team Member, TC, Admin
- Web stack: shadcn/ui + Tailwind
- Web mode: light default
- Mobile mode: dark default
- Style: quiet premium
- Accessibility: WCAG-AA
