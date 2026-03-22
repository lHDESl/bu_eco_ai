# Evaluation Plan

## Goal

Evaluate whether the assistant gives the correct disposal action with enough official grounding to be trusted in a demo setting.

## Evaluation Dimensions

| Dimension | Question |
| --- | --- |
| Decision accuracy | Did the answer tell the user the correct disposal route? |
| Citation completeness | Did the answer cite at least one relevant official source? |
| Clarification quality | Did the assistant ask a follow-up instead of bluffing on ambiguous input? |
| Preparation guidance | Did the assistant include actionable prep steps when needed? |
| UX stability | Is the response shape stable enough for UI rendering? |

## Dataset Tiers

### Tier 1: Verified Seed Cases

- Located in `data/evals/golden_questions.seed.yaml`
- Derived only from directly verified source facts
- Safe for early regression checks

### Tier 2: Curated V1 Eval Set

- Target size: `20-30` cases
- Should cover all major disposal categories used in the demo
- Should include both straightforward and ambiguous cases

### Tier 3: Stretch Multimodal Set

- Photo-assisted questions
- Especially useful after image upload flow exists
- Requires stronger source extraction from the environment ministry PDF

## Minimum Category Coverage For V1

- combustible household waste
- non-combustible or construction-related waste
- household medicine
- large waste
- recycling guidance lookup
- ambiguous mixed-material or contamination case

## Scoring Guidance

### Decision Accuracy

- `1.0`: correct disposal route
- `0.5`: partially correct but missing local specificity or key caveat
- `0.0`: incorrect or unsafe disposal route

### Citation Completeness

- `1.0`: at least one relevant official citation appears
- `0.0`: no official citation or irrelevant citation only

### Clarification Behavior

- `1.0`: asks a helpful follow-up when ambiguity is material
- `0.5`: answer is cautious but follow-up could be better
- `0.0`: bluffs or gives unsupported certainty

## Acceptance Gates

The prototype is demo-ready when:

- average decision accuracy is `85%` or better
- citation completeness is `100%` for final non-error answers
- ambiguous cases show conservative clarification behavior
- the response schema stays stable across evaluated cases

## Execution Plan

1. Start with verified seed cases.
2. Expand to a curated set after PDF extraction and ingestion exist.
3. Run manual review first, then add automated checks once API implementation stabilizes.
4. Re-run the curated set whenever prompt logic, source catalog, or answer schema changes.

## Tooling Notes

- Manual review is acceptable at bootstrap stage.
- Later automation can use JSON fixtures, contract tests, and model eval tooling.
- The response schema must remain stable enough to support deterministic evaluation parsing.

## Known Gaps

- The environment ministry PDF is present locally but not yet normalized into chunk-level testable records.
- The current seed file intentionally favors verified text-only cases over speculative multimodal examples.
