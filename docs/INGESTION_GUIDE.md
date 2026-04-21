# Ingestion Guide

## Purpose

This document describes the implemented ingestion workflow for official sources. The current CLI uploads authoritative sources to an OpenAI vector store and emits a machine-readable JSON report to stdout.

## Design Goals

- ingest only authoritative source material
- preserve source metadata for filtering and citation
- keep reruns idempotent by default
- separate raw source files from generated ingestion state

## Input Sources

Primary inputs come from `data/catalog/source_catalog.yaml`.

Expected source kinds:

- official PDF documents
- municipal web pages
- local project requirement PDFs for planning only

## Source Preparation Rules

- Keep raw PDFs in place under `DataSet/` or `Requirements/`.
- Do not overwrite source files during preprocessing.
- Prefer extraction into derived files or memory structures, not replacement of the originals.
- Preserve source ID, title, authority, and region on every chunk.

## Chunking Strategy

Planned chunking approach:

- split by heading or obvious section boundary when possible
- preserve page references for PDFs
- keep chunk size moderate so citations remain interpretable
- avoid mixing unrelated disposal categories in a single chunk

## Metadata To Attach Per Chunk

- `source_id`
- `authority`
- `region`
- `doc_type`
- `section_title`
- `page`
- `effective_date`
- `source_url`
- `tags`

## Vector Store Strategy

- Use one primary vector store per environment in v1.
- Keep `천안시` as the default runtime region.
- Leave room for future `filters` on region, authority, or topic.
- Prefer adding metadata now rather than retrofitting it later.

## Current CLI Contract

Current command:

```bash
npm run ingest
```

The script loads `.env.local` through Next.js environment loading before reading `OPENAI_API_KEY` and `OPENAI_VECTOR_STORE_ID`.

Supported flags:

- `--source-id <id>`
- `--dry-run`
- `--reindex`
- `--vector-store-id <id>`

## Current Outputs

The ingestion run currently produces:

- uploaded file references in OpenAI
- vector store association
- a machine-readable JSON report printed to stdout
- source metadata on each uploaded vector store file

Default rerun behavior:

- if a source already exists in the vector store with status `completed` or `in_progress`, the script skips re-upload for that `source_id`
- if prior files for a source are only `failed` or `cancelled`, the script removes them and retries
- if `--reindex` is passed, the script deletes existing vector store attachments and replaces them with a fresh upload

## Reindex Triggers

Reindex when:

- a source file changes
- metadata fields change in the catalog
- chunking logic changes
- prompt logic begins relying on new retrieval filters

## Safety Rules

- Never ingest a non-authoritative blog post as if it were an official source.
- Do not ingest undocumented source files.
- If a source cannot be parsed reliably, mark it and stop rather than inventing structure.

## Recommended Build Order

1. parse source catalog
2. extract text from official sources
3. normalize chunk metadata
4. upload files or chunks to OpenAI
5. emit ingestion report
6. verify retrieval manually with a small test question set
