# Docs Index

This directory is the canonical human-readable specification set for the project.

## Recommended Read Order

### If you are an AI agent

1. `../AGENTS.md`
2. `PRD.md`
3. `TECH_SPEC.md`
4. `API_GUIDE.md`
5. `PROMPT_AND_GUARDRAILS.md`
6. `IMPLEMENTATION_BACKLOG.md`
7. `../data/catalog/source_catalog.yaml`
8. `../specs/openapi.yaml`

### If you are deciding product scope

1. `PRD.md`
2. `DATA_SOURCES.md`
3. `EVALUATION_PLAN.md`
4. `DEMO_SCENARIOS.md`

### If you are implementing backend or RAG

1. `TECH_SPEC.md`
2. `API_GUIDE.md`
3. `INGESTION_GUIDE.md`
4. `PROMPT_AND_GUARDRAILS.md`
5. `adr/ADR-001-openai-responses-file-search.md`

### If you are setting repo conventions

1. `DEVELOPMENT_WORKFLOW.md`
2. `REPO_STRUCTURE.md`
3. `IMPLEMENTATION_BACKLOG.md`

## Document Map

- `PRD.md`: product requirements and v1 scope
- `TECH_SPEC.md`: target architecture and technical decisions
- `API_GUIDE.md`: human-readable API contract
- `DATA_SOURCES.md`: source-of-truth catalog and metadata rules
- `EVALUATION_PLAN.md`: evaluation goals, fixtures, rubric
- `INGESTION_GUIDE.md`: ingestion pipeline design and metadata conventions
- `DEPLOYMENT.md`: local, Vercel, and ingestion deployment workflow
- `PROMPT_AND_GUARDRAILS.md`: answer behavior and prompt contract
- `DEVELOPMENT_WORKFLOW.md`: workflow for humans and AI agents
- `IMPLEMENTATION_BACKLOG.md`: ordered build tasks with acceptance criteria
- `DEMO_SCENARIOS.md`: demo script candidates
- `REPO_STRUCTURE.md`: current and planned repository structure
- `adr/`: architecture decision records

## Machine-Readable Counterparts

- `../specs/openapi.yaml`
- `../data/catalog/source_catalog.yaml`
- `../data/evals/golden_questions.seed.yaml`

When a human-readable doc and a machine-readable spec disagree, update both in the same change.
