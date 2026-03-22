# Ingestion Guide

## Purpose

This document describes the planned ingestion workflow for official sources. The workflow itself is not implemented yet, but this is the contract future code should follow.

## Design Goals

- ingest only authoritative source material
- preserve source metadata for filtering and citation
- keep reruns idempotent where practical
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

## Planned CLI Contract

Future implementation should support a command similar to this:

```bash
npm run ingest -- --catalog data/catalog/source_catalog.yaml
```

Optional flags can be added later, for example:

- `--source-id <id>`
- `--dry-run`
- `--reindex`
- `--vector-store-id <id>`

## Expected Outputs

The ingestion run should eventually produce:

- uploaded file references in OpenAI
- vector store association
- a machine-readable ingestion report
- enough metadata to reconstruct citations later

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
5. save ingestion report
6. verify retrieval manually with a small test question set
