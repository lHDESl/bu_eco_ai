# Contributing

## Principles

- Prefer official source grounding over speed.
- Prefer documentation updates before or alongside code.
- Prefer small changes with explicit acceptance criteria.

## Recommended Workflow

1. Read `AGENTS.md` and `docs/README.md`.
2. Confirm the source-of-truth documents for the task.
3. Update specs or docs first if the task changes behavior.
4. Implement the smallest coherent change.
5. Validate that docs, schemas, and code still agree.
6. Leave clear follow-up notes when a task is intentionally partial.

## Before Starting Code

- Check whether the task already exists in `docs/IMPLEMENTATION_BACKLOG.md`.
- Confirm whether an ADR is needed.
- Confirm whether API or prompt behavior changes.
- Confirm whether source metadata or evaluation fixtures need updates.

## Pull Request Expectations

Every PR should state:

- what changed
- why it changed
- which docs were updated
- whether source-of-truth documents changed
- what remains intentionally unfinished

## Commit Guidance

Use short, specific commit subjects. Examples:

- `docs: add prompt and ingestion guidance`
- `feat: implement health endpoint`
- `refactor: extract response schema`
- `test: add golden question fixtures`

## Documentation Checklist

Update the relevant files when applicable:

- `README.md`
- `AGENTS.md`
- `docs/API_GUIDE.md`
- `docs/TECH_SPEC.md`
- `docs/PROMPT_AND_GUARDRAILS.md`
- `data/catalog/source_catalog.yaml`
- `specs/openapi.yaml`

## Source Handling

- Do not replace official source material with summaries.
- Do not delete raw source files from `Requirements/` or `DataSet/`.
- If a source becomes outdated, add a note and superseding source metadata before removal.
