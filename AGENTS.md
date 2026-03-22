# AGENTS.md

This file is the working agreement for any AI coding agent operating in this repository.

## Mission

Build `EcoGuide AI`, a Cheonan-specific waste disposal assistant that answers with official grounding, predictable output structure, and conservative handling of uncertainty.

## Current Repo Reality

- This repo is `document-first`.
- App code is intentionally not the first artifact.
- The first job of an AI agent is to read the docs and preserve their intent.
- If you start coding without reading the product and API docs, you are skipping required context.
- This repository is optimized for `Codex-first` collaboration. GitHub Copilot-specific instruction files are intentionally not part of the main workflow.

## Required Read Order

1. `README.md`
2. `docs/README.md`
3. `docs/PRD.md`
4. `docs/TECH_SPEC.md`
5. `docs/API_GUIDE.md`
6. `docs/PROMPT_AND_GUARDRAILS.md`
7. `docs/IMPLEMENTATION_BACKLOG.md`
8. `data/catalog/source_catalog.yaml`
9. `specs/openapi.yaml`

## Source Of Truth Hierarchy

1. Team requirements in `Requirements/`
2. Official source catalog in `data/catalog/source_catalog.yaml`
3. ADRs in `docs/adr/`
4. Product and technical docs in `docs/`
5. Application code

Never let prompts or UI copy override an official disposal rule.

## Product Constraints

- Municipality scope is `천안시` only unless a future ADR expands it.
- V1 must support `text` input and `optional image upload`.
- V1 must return:
  - disposal decision
  - reason
  - preparation steps
  - citations
  - follow-up question when confidence is insufficient
- V1 must prefer clarifying questions over confident but unsupported disposal advice.
- V1 does not include accounts, admin, national coverage, or long-term chat memory.

## Technical Constraints

- Planned app architecture: `Next.js full-stack single repo`
- Planned model interface: OpenAI `Responses API`
- Planned retrieval: OpenAI `File Search`
- Planned authoritative data inputs: official PDFs and municipal web pages only
- Planned persistent relational database: none for v1

## Documentation Rules

- Update docs whenever behavior, schema, workflow, or assumptions change.
- Add an ADR for architectural decisions that would be expensive to reverse.
- Keep API behavior aligned across:
  - `docs/API_GUIDE.md`
  - `specs/openapi.yaml`
  - any implementation code
- Keep source metadata aligned across:
  - `docs/DATA_SOURCES.md`
  - `data/catalog/source_catalog.yaml`

## Implementation Rules

- Favor small, reviewable changes over broad speculative scaffolding.
- Make output schemas explicit and machine-readable.
- Record fallbacks and error behavior, not only success paths.
- If a domain rule is ambiguous, surface a clarifying question or abstain.
- If a source is missing, mark it as missing. Do not fabricate disposal rules.

## Retrieval And Prompting Rules

- Only treat listed official sources as authoritative.
- Cite supporting sources in every final disposal answer.
- Separate model instructions from source content.
- Keep the answer style deterministic and compact.
- Design for explainability before polish.

## Raw Source Rules

- Keep `Requirements/` and `DataSet/` unless there is an explicit repo reorganization task.
- Do not delete or overwrite raw source files during ingestion work.
- If a raw source is superseded, document the replacement before removing anything.

## Branch And Commit Conventions

- Preferred AI branch prefix: `codex/`
- Keep one logical change per branch when possible.
- Use conventional-style commit summaries where practical, for example:
  - `docs: add api and ingestion guides`
  - `feat: scaffold chat endpoint`
  - `chore: initialize next app`

## Definition Of Done

A task is not done unless:

- relevant docs are updated
- machine-readable specs still match the docs
- assumptions are called out explicitly
- risks and follow-up items are documented
- another AI agent could pick up the repo and continue without guessing intent
