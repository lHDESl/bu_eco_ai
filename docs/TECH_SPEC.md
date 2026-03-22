# Technical Spec

## Document Status

- Version: `0.1`
- Status: target architecture
- Last updated: `2026-03-22`

## Architecture Summary

The planned v1 architecture is a `Next.js full-stack single repo` with a small server-side integration layer for OpenAI. Retrieval uses OpenAI `File Search` against uploaded official sources, and answer generation uses the OpenAI `Responses API`.

## Stack Baseline

Target package versions confirmed on `2026-03-22`:

| Layer | Target |
| --- | --- |
| Web framework | `next@16.2.1` |
| UI runtime | `react@19.2.4` |
| Language | `typescript@5.9.3` |
| OpenAI SDK | `openai@6.32.0` |
| AI SDK | `ai@6.0.134` |
| AI SDK OpenAI provider | `@ai-sdk/openai@3.0.47` |
| Styling | `tailwindcss@4.2.2` |
| Schema validation | `zod@4.3.6` |
| Linting | `eslint@10.1.0` |
| Formatting | `prettier@3.8.1` |

## Major Decisions

- Use `Next.js` only. No separate FastAPI or Streamlit service.
- Use OpenAI `Responses API` for new application work.
- Use OpenAI `File Search` instead of self-managed vector infrastructure for v1.
- Keep `천안시` as the fixed runtime region, but leave room for metadata-based region filtering later.
- Avoid a relational database in v1.
- Keep the API response schema explicit and stable.

## Planned Runtime Components

### Web UI

Responsibilities:

- collect Korean text questions
- support optional image upload
- display structured answer cards
- surface citations clearly
- show clarification prompts and error states

### API Layer

Planned endpoints:

- `GET /api/health`
- `POST /api/chat`

Responsibilities:

- validate request payloads
- load runtime configuration
- call OpenAI APIs
- map raw model output into the stable app schema
- normalize citations and error payloads

### OpenAI Integration Layer

Responsibilities:

- define system instructions and guardrails
- invoke `Responses API`
- attach `file_search` tool configuration
- pass image input when present
- normalize annotations or file-search results into UI citations

### Ingestion Workflow

Responsibilities:

- track official sources from the catalog
- normalize source metadata
- upload files to OpenAI
- attach file metadata for future filtering
- record vector store usage conventions

## Planned Data Flow

### Text Question

1. User submits Korean question.
2. API validates required fields.
3. API calls OpenAI `Responses API` with:
   - system instructions
   - user input
   - `file_search` tool with configured vector store
4. Model retrieves relevant official passages.
5. API maps result into the stable response schema.
6. UI renders decision, reasoning, preparation steps, and citations.

### Image + Text Question

1. User submits question and image.
2. API validates file type and size.
3. API sends text plus image input to the model.
4. Model infers likely item class, but still relies on retrieved source material for disposal guidance.
5. If image evidence is insufficient, the model returns `needs_clarification = true`.

## Output Contract

The app must converge on the following response shape:

- `decision: string`
- `reason: string`
- `prep_steps: string[]`
- `citations: Citation[]`
- `needs_clarification: boolean`
- `follow_up_question: string | null`

The canonical machine-readable contract lives in `specs/openapi.yaml`.

## Citation Strategy

Each final answer should expose citations as normalized UI-ready objects with fields such as:

- source title
- authority
- source URL when available
- local source identifier
- optional page or section hint
- short supporting excerpt when available

## Source Priority Strategy

When sources conflict:

1. prefer `천안시` if it is more specific to local disposal behavior
2. otherwise rely on national guidance from `환경부`
3. if conflict remains unresolved, surface uncertainty and ask a follow-up question

## Environment Variables

Planned minimum config:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_FALLBACK_MODEL`
- `OPENAI_VECTOR_STORE_ID`
- `OPENAI_FILE_SEARCH_MAX_RESULTS`
- `APP_REGION_CODE`
- `APP_REGION_NAME`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_REGION_LABEL`

## Planned File Layout For Implementation

These files are planned, not yet created:

- `src/app/page.tsx`
- `src/app/api/health/route.ts`
- `src/app/api/chat/route.ts`
- `src/components/chat-form.tsx`
- `src/components/answer-card.tsx`
- `src/components/citation-list.tsx`
- `src/lib/openai/client.ts`
- `src/lib/openai/prompt.ts`
- `src/lib/openai/response-schema.ts`
- `scripts/ingest-docs.ts`

## Error Handling Strategy

- Missing API key: return a clear configuration error.
- Missing vector store: return a clear readiness error.
- Invalid upload: return a validation error with fix guidance.
- Retrieval ambiguity: ask follow-up instead of inventing a rule.
- Upstream API failure: return retryable error shape with stable error codes.

## Security And Privacy Notes

- Do not persist uploaded images longer than required for request handling in v1.
- Do not expose raw internal OpenAI responses to the client.
- Keep prompts and source metadata server-side.
- Avoid logging sensitive user input verbatim in production.

## Future Evolution After V1

- add multi-city support through metadata filtering
- introduce evaluation automation and regression checks
- add a persistent source-ingestion run log
- consider moving retrieval to self-managed infrastructure only if scale or control requires it
