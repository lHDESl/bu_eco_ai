# Repo Structure

## Current Structure

| Path | Status | Purpose |
| --- | --- | --- |
| `Requirements/` | existing | project requirement inputs and original assignment context |
| `DataSet/` | existing | raw authoritative domain documents |
| `docs/` | active | human-readable specifications |
| `docs/adr/` | active | architecture decision records |
| `data/catalog/` | active | source metadata catalog |
| `data/evals/` | active | evaluation fixtures |
| `specs/` | active | machine-readable API contract |
| `.github/` | active | standard repository templates |

## Planned Implementation Structure

These paths are expected once coding begins.

| Path | Purpose |
| --- | --- |
| `src/app/` | Next.js app routes and pages |
| `src/components/` | UI components |
| `src/lib/openai/` | OpenAI client, prompt, schema, citation normalization |
| `src/lib/sources/` | source catalog loading and metadata helpers |
| `scripts/` | ingestion and maintenance scripts |
| `tests/` | contract tests and evaluation helpers |

## Structure Rules

- Raw sources stay separate from generated ingestion artifacts.
- Machine-readable contracts live outside implementation code when practical.
- Product intent stays in `docs/`, not in ad hoc chat history.
- Future code should conform to the contracts already defined in docs and specs.

## Raw Source Retention Policy

- Keep `Requirements/` and `DataSet/` during bootstrap and early implementation.
- Prefer moving them only as part of an explicit repo reorganization task.
- If paths change, update the docs and `data/catalog/source_catalog.yaml` in the same change.
