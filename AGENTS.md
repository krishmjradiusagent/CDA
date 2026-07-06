---
project: Commission Breakdown
tags: [project/commission-breakdown, agents, type/documentation]
updated: 2026-07-05
---

# AGENTS.md

**Connected to:** [[CLAUDE.md|Commission Breakdown CLAUDE]], [[README.md|Readme]]


## Purpose

This repo uses Makato.

Makato is a markdown + JSON context framework for Radius Agent product design work.

Every AI tool must read this file first.

---

## Core Rule

Do not work from model memory alone.

Work from:
- Makato truth files
- current task
- knowledge files
- latest handoff
- selected tool instructions

---

## What Makato Means

```txt
MA = remove noise
KATA = follow repeatable form
KAIZEN = improve from mistakes
TRUTH = product/design-system facts
HANDOFF = current project state
```

---

## Required Read Order

1. `AGENTS.md`
2. `makato/truth/product.md`
3. `makato/truth/design-system.md`
4. `makato/truth/shadcn.md`
5. `makato/truth/roles.md`
6. `makato/truth/radius-patterns.md`
7. `makato/truth/figma.md`
8. `makato/knowledge/decisions.md`
9. `makato/knowledge/summaries.md`
10. `makato/knowledge/open-questions.md`
11. `makato/knowledge/patterns.md`
12. `makato/ma/prune.md`
13. `makato/kata/task.md`
14. `makato/kaizen/rules.md`
15. `makato/handoff/latest.md`

---

## Priority Order

When context conflicts:

```txt
Task > Decisions > Figma/Screenshot Truth > Product Truth > Design System > Radius Patterns > Handoff > Summaries > Model Memory
```

If unknown, write `unknown`.

Do not guess.

---

## JSON Output Contract

Every useful response must end with JSON.

```json
{
  "makato_updates": [
    {
      "path": "makato/handoff/latest.md",
      "action": "replace|append|none",
      "content": ""
    }
  ],
  "workspace_outputs": [
    {
      "type": "html|css|component|prd|ux-flow|screen|other",
      "path": "workspace/...",
      "status": "created|updated|not_created",
      "notes": ""
    }
  ],
  "knowledge_updates": [
    {
      "path": "makato/knowledge/summaries.md|makato/knowledge/decisions.md|makato/knowledge/open-questions.md|makato/knowledge/patterns.md",
      "action": "append|replace|none",
      "content": ""
    }
  ],
  "kaizen": {
    "lesson_needed": false,
    "target_path": "makato/kaizen/lessons.md",
    "lesson": ""
  },
  "next_tool": {
    "recommended": "chatgpt|claude|codex",
    "reason": "",
    "prompt": ""
  }
}
```

---

## Hard Rules

Do not:
- invent Radius product rules
- invent Figma values
- invent design-system tokens
- change global styles unless requested
- create random UI patterns
- skip role matrix
- skip edge states
- skip handoff
- paste raw transcripts into knowledge files

Always:
- keep scope tight
- use shadcn component names for web
- use Tailwind semantic tokens
- support WCAG-AA
- include empty/loading/error/success states when relevant
- write output as file-ready markdown or JSON
