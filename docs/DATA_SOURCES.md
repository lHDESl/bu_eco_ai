# Data Sources

## Purpose

This document defines which documents are authoritative for the product and how they should be represented in the repository and future ingestion pipeline.

## Authoritative Domain Sources

| Source ID | Authority | Title | Local Path | Public URL | Published / Checked | Scope | Usage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `me-recycling-guide-2018` | 환경부 | 재활용품 분리배출 가이드라인(웹용)-최종.pdf | `DataSet/재활용품 분리배출 가이드라인(웹용)-최종.pdf` | `https://www.me.go.kr/m/mob/board/read.do%3Bjsessionid%3D6ZEOzR00wQsaUCjfdc9jAKQX7RCjYe41HeKW8xgk.mehome1?boardCategoryId=&boardId=875840&boardMasterId=54&maxIndexPages=10&maxPageItems=10&menuId=51&orgCd=&pagerOffset=0&searchKey=&searchValue=` | published `2018-07-03`, checked `2026-03-22` | national recycling guidance | primary national retrieval source |
| `cheonan-waste-disposal-page` | 천안시 | 생활폐기물 배출방법안내 | `DataSet/천안시_생활폐기물_배출방법안내_2026-03-22.txt` | `https://lll.cheonan.go.kr/kor/sub06_13_06.do` | checked `2026-03-22` | Cheonan disposal guidance | primary municipal retrieval source via local snapshot |

## Project Input Documents

| Source ID | Type | Local Path | Usage |
| --- | --- | --- | --- |
| `project-requirements-main` | requirement PDF | `Requirements/인공지능.pdf` | project scope and deliverables |
| `project-report-team4` | team report PDF | `Requirements/[인공지능 4팀] 추진보고서_20214318_이병현hwp.pdf` | context, team framing, presentation alignment |

## Known Verified Facts From Municipal Source

These are directly confirmed from the Cheonan waste disposal page and safe to use in seed docs and tests.

- Combustible household waste should be disposed of in a volume-rate trash bag.
- Non-combustible and small construction-related household waste use dedicated bags.
- Household medicine should be dropped off at nearby pharmacies, health centers, or similar collection points.
- Large waste can be handled through sticker purchase, internet reporting, or the dedicated app flow.
- The municipal page links residents to `분리배출.kr` as an additional disposal information site.

## Source Priority Rules

1. Use `천안시` guidance when it contains a more specific local disposal rule.
2. Use `환경부` guidance when there is no stricter or more specific local override.
3. If the two sources appear to conflict, record the conflict and prefer clarification over forced certainty.

## Metadata Schema For Ingestion

Every source chunk should eventually carry metadata for retrieval filtering.

| Field | Required | Description |
| --- | --- | --- |
| `source_id` | yes | Stable ID from the catalog |
| `authority` | yes | Issuing body such as `환경부` or `천안시` |
| `region` | yes | `korea` or `cheonan-si` |
| `doc_type` | yes | `guideline_pdf`, `webpage`, `requirements_pdf`, etc. |
| `effective_date` | no | Official publication or update date |
| `section_title` | no | Human-readable section heading |
| `page` | no | Page number for PDFs when available |
| `tags` | no | Topic tags like `medicine`, `large_waste`, `recycling` |
| `source_url` | no | Public URL if available |

## Freshness Policy

- Re-check municipal pages before major demos.
- If a source is updated, keep the old source metadata until the new version is validated.
- Never silently replace a source without updating `data/catalog/source_catalog.yaml` and this document.

## Follow-Up Work

- extract structured text from the environment ministry PDF
- refresh the Cheonan municipal snapshot when the official page changes
- expand the source catalog with section-level metadata after ingestion tooling exists
