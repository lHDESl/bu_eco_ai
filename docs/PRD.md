# PRD

## Document Status

- Version: `0.1`
- Status: draft but implementation-oriented
- Last updated: `2026-03-22`
- Product scope owner: repository docs

## Product Summary

EcoGuide AI is a Cheonan-specific web assistant that helps residents decide how to dispose of household waste correctly. The assistant must ground every answer in official source material and return a concise, structured Korean response.

## Problem Statement

Residents often struggle with waste disposal because:

- municipal rules vary by location
- official guidance is fragmented across PDFs and web pages
- edge cases depend on contamination, material mix, or disposal category
- image-based intuition is useful, but unsafe without official grounding

The product exists to lower that friction while keeping the answer tied to verifiable public guidance.

## Primary Users

- Cheonan residents who want a quick disposal answer
- students and one-person households who frequently dispose of mixed household items
- demo viewers such as instructors or evaluators who need to understand the product quickly

## Jobs To Be Done

- When I have an item to throw away, I want to ask one question and get a disposal action I can follow.
- When I am unsure what the item is called, I want to upload a photo and still get a grounded answer.
- When the source rule is ambiguous, I want the system to ask the next best clarifying question instead of bluffing.

## Product Goals

- Deliver a disposal decision grounded in official source material.
- Support `text` questions and `optional image upload`.
- Keep the answer format stable enough for UI rendering and evaluation.
- Optimize for demo reliability over feature breadth.
- Keep future expansion to multi-city support possible, but do not build it into v1 scope.

## V1 Scope

### In Scope

- `천안시` only
- Korean language UI and answer format
- One web app prototype
- `GET /api/health`
- `POST /api/chat`
- source catalog for official documents
- seed evaluation set and demo scenarios
- OpenAI-based retrieval and generation using official source files

### Out Of Scope

- nationwide support
- login and account system
- admin dashboard
- voice input or output
- persistent relational database
- custom model training
- local SLM or on-device inference

## Functional Requirements

1. The user can ask a text question about waste disposal.
2. The user can optionally upload an image with the question.
3. The system returns a structured answer with:
   - `decision`
   - `reason`
   - `prep_steps[]`
   - `citations[]`
   - `needs_clarification`
   - `follow_up_question`
   - `identified_item` when an image is provided and the visible item can be inferred safely
4. Every non-error answer must cite at least one official source.
5. If confidence is insufficient, the system must ask a follow-up question instead of forcing a disposal instruction.
6. The system must treat `천안시` as the active region by default.
7. The system must expose a health endpoint that reveals whether required runtime config is present.

## Non-Functional Requirements

- Text-first answers should feel responsive in a demo setting.
- Image-assisted answers may be slower, but should remain usable for live presentation.
- Failure cases must produce user-friendly error messages.
- The repo must be understandable by another human or AI agent without tribal knowledge.

## Source Policy

Authoritative sources for v1:

1. `환경부` recycling guidance PDF
2. `천안시` waste disposal guidance page
3. local project requirement PDFs for project intent and deliverables

Non-authoritative sources such as blogs, forum posts, or generic lifestyle articles must not be treated as disposal truth.

## Key User Stories

- As a resident, I can ask "일반 쓰레기는 어떻게 버리나요?" and get a city-specific answer.
- As a resident, I can ask about household medicine and get drop-off guidance with an official citation.
- As a resident, I can ask about large waste disposal and get the official disposal route.
- As a user with an unclear item image, I can upload a photo and either receive a grounded answer or a follow-up question.
- As a demo reviewer, I can inspect the cited sources and see that the answer was not free-written from memory.

## Success Metrics

- Curated eval set decision accuracy target: `85%+`
- Citation presence target: `100%` for non-error final answers
- Clarification behavior: ambiguous cases should prefer follow-up over unsupported certainty
- Text query target latency: about `8s` or less in a demo setting
- Image query target latency: about `12s` or less in a demo setting

## Known Risks

- The environment ministry PDF content is available locally, but not yet fully extracted into machine-ready chunks.
- Municipal guidance can change over time and should be periodically re-verified.
- Image understanding may identify an item class correctly while disposal still depends on contamination or mixed material status.

## Launch Standard For V1

A demo-ready v1 is acceptable when:

- the repo has a working app shell
- official sources are ingested
- the API returns the agreed response schema
- at least three demo scenarios work end to end
- the seed eval set is expanded and checked against acceptance thresholds
