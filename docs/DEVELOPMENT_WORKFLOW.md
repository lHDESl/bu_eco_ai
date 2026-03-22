# Development Workflow

## Workflow Goal

Make the repository easy to evolve through both human contributors and AI coding agents.

## Start Protocol For Any Agent

1. Read `README.md`.
2. Read `AGENTS.md`.
3. Read `docs/README.md` and the docs required for the task.
4. Check `docs/IMPLEMENTATION_BACKLOG.md` for the current recommended task order.
5. Identify whether docs, API schema, source catalog, or eval fixtures must change.

## Change Types

### Documentation Change

Use when behavior is being defined or clarified before code exists.

### Contract Change

Use when request or response shapes change.

### Implementation Change

Use when code is added or modified to satisfy an already documented contract.

## Working Rules

- Prefer doc-first clarification over speculative code.
- Keep machine-readable files in sync with human-readable docs.
- Record architectural shifts in `docs/adr/`.
- Leave enough notes that another agent can continue from the current state.

## Branch Guidance

- Preferred AI branch prefix: `codex/`
- One coherent task per branch when practical
- Keep branch scope narrow enough to review quickly

## Definition Of Ready

A task is ready to implement when:

- scope is described
- acceptance criteria exist
- source-of-truth docs are known
- expected files or modules are clear

## Definition Of Done

A change is done when:

- required docs are updated
- contracts and schemas match the docs
- known risks are written down
- follow-up work is listed if the change is partial

## Handoff Expectations

At the end of a task, leave:

- what changed
- what was validated
- what remains open
- which doc is now the canonical reference
