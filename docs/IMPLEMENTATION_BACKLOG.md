# Implementation Backlog

This backlog is intentionally implementation-ready. Each item is meant to be small enough for an AI agent to pick up with minimal extra planning.

## Status Legend

- `done`: already completed in the repository
- `next`: recommended immediate follow-up
- `planned`: intended but not started

## Phase 0: Repository Bootstrap

### DOC-001 `done`

- Outcome: initialize repository-level documents and working agreements
- Deliverables: `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, root config files
- Done when: a new contributor can understand the project without verbal context

### DOC-002 `done`

- Outcome: define product, tech, API, prompt, ingestion, and evaluation docs
- Deliverables: main docs under `docs/`
- Done when: implementation direction is stable enough to scaffold code

### DOC-003 `done`

- Outcome: add machine-readable source and API artifacts
- Deliverables: `specs/openapi.yaml`, `data/catalog/source_catalog.yaml`, `data/evals/golden_questions.seed.yaml`
- Done when: another agent can consume core contracts programmatically

## Phase 1: App Bootstrap

### APP-001 `next`

- Outcome: scaffold a `Next.js 16 + TypeScript + Tailwind 4` app shell
- Suggested files: `package.json`, `src/app/`, `src/components/`, `src/lib/`
- Acceptance criteria:
  - app starts locally
  - base layout renders
  - no business logic yet

### APP-002 `planned`

- Outcome: add repository scripts, linting, formatting, and env loading
- Suggested files: package config, lint config, app env utilities
- Acceptance criteria:
  - lint and format commands exist
  - env validation is centralized

## Phase 2: Source Ingestion

### INGEST-001 `next`

- Outcome: validate source catalog and normalize source metadata
- Suggested files: `scripts/ingest-docs.ts`, `src/lib/sources/`
- Acceptance criteria:
  - source catalog loads successfully
  - invalid source entries fail fast with readable errors

### INGEST-002 `planned`

- Outcome: extract official source text and upload to OpenAI vector store
- Acceptance criteria:
  - vector store upload can be run from the catalog
  - uploaded items preserve source metadata
  - ingestion report is emitted

## Phase 3: API

### API-001 `planned`

- Outcome: implement `GET /api/health`
- Acceptance criteria:
  - reports service status
  - detects missing `OPENAI_API_KEY`
  - detects missing `OPENAI_VECTOR_STORE_ID`

### API-002 `planned`

- Outcome: implement request validation and stable error shapes for `POST /api/chat`
- Acceptance criteria:
  - invalid form data returns structured errors
  - upload constraints are enforced

### API-003 `planned`

- Outcome: integrate OpenAI `Responses API` with `File Search`
- Acceptance criteria:
  - text-only flow works
  - citations are normalized into API response format
  - clarification path is supported

### API-004 `planned`

- Outcome: add optional image handling for `POST /api/chat`
- Acceptance criteria:
  - image and text can be submitted together
  - ambiguous image cases lead to clarification instead of unsupported certainty

## Phase 4: UI

### UI-001 `planned`

- Outcome: build the main page with question input and upload UI
- Acceptance criteria:
  - Korean-first interface
  - clear region label for `천안시`
  - example questions visible

### UI-002 `planned`

- Outcome: render answer card, preparation steps, citations, and clarification prompts
- Acceptance criteria:
  - stable rendering for full answer payload
  - clear error and loading states

## Phase 5: Evaluation And Demo

### EVAL-001 `planned`

- Outcome: expand eval set to `20-30` curated cases
- Acceptance criteria:
  - category coverage matches `docs/EVALUATION_PLAN.md`
  - expected outputs are reviewable by humans

### EVAL-002 `planned`

- Outcome: add regression execution path for seed and curated cases
- Acceptance criteria:
  - response schema can be checked automatically
  - scoring rules are documented in code or fixtures

### DEMO-001 `planned`

- Outcome: finalize three stable demo scenarios and a rehearsal checklist
- Acceptance criteria:
  - each scenario has a known expected answer shape
  - each scenario maps to authoritative source IDs
