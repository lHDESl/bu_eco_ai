# EcoGuide AI

EcoGuide AI is a document-first repository for a Cheonan-focused waste disposal assistant. The product goal is simple: let a resident ask in Korean, with text or an image, how an item should be disposed of, and return an answer grounded in official sources.

This repository started as a documentation-first bootstrap and now includes the first working MVP implementation. The repo is still organized so that any AI coding agent can pick it up quickly without relying on tribal knowledge.

## Current Status

- Status: MVP scaffold implemented
- Product phase: v1 prototype in progress
- Geographic scope: `천안시` only
- Target interaction: `text + image upload`
- Intended AI backend: OpenAI `Responses API` + `File Search`
- Primary AI collaboration target: `Codex` via `AGENTS.md`
- Runtime application code: Next.js app, API routes, and ingestion starter are implemented

## Why This Repo Exists

- Local waste disposal rules are hard to remember and vary by municipality.
- Official guidance is spread across PDFs and municipal web pages.
- Citizens often need a fast answer, but the answer must stay tied to official rules.
- A RAG-style assistant can improve convenience without inventing unsupported disposal advice.

## V1 Scope

- One municipality: `천안시`
- One web application
- Inputs: typed question and optional image upload
- Outputs: disposal decision, reason, preparation steps, citations, and follow-up question when uncertain
- Authoritative sources: environment ministry guidance and Cheonan municipal disposal guidance

## Non-Goals For V1

- Nationwide coverage
- User accounts or admin console
- Voice I/O
- Persistent chat history database
- Fine-tuned or local SLM deployment

## Read This First

1. `AGENTS.md`
2. `docs/README.md`
3. `docs/PRD.md`
4. `docs/TECH_SPEC.md`
5. `docs/API_GUIDE.md`
6. `docs/IMPLEMENTATION_BACKLOG.md`
7. `data/catalog/source_catalog.yaml`
8. `docs/DEPLOYMENT.md`

## Repository Map

- `AGENTS.md`: working agreement for Codex and similar coding agents
- `docs/`: product, architecture, API, data, evaluation, workflow, ADR
- `data/catalog/`: source catalog and ingestion metadata conventions
- `data/evals/`: seed evaluation cases
- `specs/`: machine-readable interface definitions
- `src/`: Next.js UI, route handlers, shared server/client code
- `scripts/`: ingestion and maintenance scripts
- `Requirements/`: original project requirement inputs and team deliverable context
- `DataSet/`: raw authoritative domain documents used for retrieval planning
- `.github/`: standard repository templates only

## Planned Public Interfaces

- `GET /api/health`
- `POST /api/chat`
- local ingestion workflow for official source documents

The canonical API contract lives in `specs/openapi.yaml`.

## Baseline Stack Targets

These are the current implementation targets as of `2026-03-22`.

- `next@16.2.1`
- `react@19.2.4`
- `typescript@5.9.3`
- `openai@6.32.0`
- `tailwindcss@4.2.2`
- `zod@4.3.6`
- `eslint@9.39.4`
- `tsx@4.21.0`

## Source Of Truth

Priority order:

1. Local project requirements under `Requirements/`
2. Official public documents listed in `data/catalog/source_catalog.yaml`
3. Decision records under `docs/adr/`
4. Product and technical specs under `docs/`

If docs and code ever disagree, fix the mismatch immediately and record the decision.

## Raw Source Retention Policy

Keep `Requirements/` and `DataSet/` in the repository for now.

- `Requirements/` preserves the original assignment and team context.
- `DataSet/` preserves the raw authoritative source material.
- If these directories are reorganized later, move them deliberately and update the docs and source catalog in the same change.

## Working Principles

- Document first, then implement.
- Prefer official public sources over blog posts or guesswork.
- Keep prompts and output schemas explicit.
- Make changes reproducible by another engineer or AI agent.
- Record major architectural choices with an ADR.
- Treat ambiguity as a product problem, not just a prompt problem.

## Next Milestones

- M0: finalize repo documents and workflow
- M1: scaffold the Next.js application shell
- M2: implement ingestion pipeline for official sources
- M3: implement chat API and prompt guardrails
- M4: build the web UI and demo scenarios
- M5: add evaluation fixtures and prototype QA

## Quick Start

1. Install dependencies:
   - `npm install`
2. Copy env values from `.env.example` into `.env.local`
3. Set:
   - `OPENAI_API_KEY`
   - `OPENAI_VECTOR_STORE_ID`
4. Start the app:
   - `npm run dev`
5. Optional source ingestion:
   - `npm run ingest -- --dry-run`
   - `npm run ingest`

## Validation

The current implementation has been verified with:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run ingest -- --dry-run`

## Vercel Deployment

Vercel is a good fit for this project because the app is built on `Next.js App Router` and only needs server-side route handlers plus environment variables.

Recommended setup:

1. Import the repository into Vercel.
2. Keep the framework preset as `Next.js`.
3. Add the same environment variables used locally:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`
   - `OPENAI_FALLBACK_MODEL`
   - `OPENAI_VECTOR_STORE_ID`
   - `OPENAI_FILE_SEARCH_MAX_RESULTS`
   - `APP_REGION_CODE`
   - `APP_REGION_NAME`
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXT_PUBLIC_APP_REGION_LABEL`
4. Deploy to preview first, then production.

Notes:

- `POST /api/chat` is implemented as a Node runtime route handler and is Vercel-friendly.
- Uploaded images are handled per request and are not persisted by the app in v1.
- Re-ingesting official sources should be done locally or in a controlled environment, then the resulting vector store ID can be reused in Vercel.
- The Cheonan municipal source is stored as a local snapshot text file for reproducible ingestion when the public page is not reliably fetchable.
