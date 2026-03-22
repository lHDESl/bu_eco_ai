# ADR-001: Use OpenAI Responses API And File Search For V1

- Status: accepted
- Date: `2026-03-22`

## Context

The project needs a fast path to a demo-ready prototype that can answer disposal questions with grounded citations from official documents. The team wants to avoid outdated stacks and prefers hosted API-based LLM integration over local SLM deployment.

## Decision

Use:

- OpenAI `Responses API` as the model interface
- OpenAI `File Search` as the v1 retrieval mechanism
- a `Next.js full-stack single repo` as the app architecture

## Alternatives Considered

### FastAPI + separate frontend

Rejected for v1 because it adds service boundaries before the product behavior is validated.

### LangChain + ChromaDB

Rejected for v1 because it increases orchestration surface area and local infrastructure burden without being necessary for the first prototype.

### Postgres + pgvector

Deferred. It remains a reasonable future option if retrieval control, portability, or cost behavior requires it later.

### Local SLM

Rejected for v1 because the product currently values speed of implementation and hosted multimodal capability over local deployment.

## Consequences

### Positive

- faster prototype path
- simpler hosted retrieval setup
- easy alignment with image input and future structured outputs
- lower early infrastructure complexity

### Negative

- retrieval internals are less customizable than a self-managed stack
- runtime depends on OpenAI service availability and configuration
- migration to self-managed retrieval later will require deliberate interface boundaries

## Follow-Up

- keep source metadata explicit to preserve future migration options
- keep the API response schema provider-agnostic where practical
- document ingestion and prompt behavior clearly so a later backend migration is possible
