# API Guide

The canonical machine-readable contract is `../specs/openapi.yaml`. This document explains the same API in implementation-friendly prose.

## API Principles

- The API is region-fixed to `천안시` in v1.
- The client receives stable, structured JSON.
- The server hides provider-specific response details.
- All non-error answers should include at least one citation.
- When an image is present, the server may return a short inferred item label for UI feedback, but the disposal decision must still be grounded in official sources.

## Endpoint Summary

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Report service readiness and config status |
| `POST` | `/api/chat` | Accept a disposal question and optional image |

## GET /api/health

### Purpose

Report whether the app can serve requests safely.

### Response Fields

- `service`: fixed service name
- `status`: `ok` or `degraded`
- `region`: active municipality code
- `checks.openai_api_key`: whether API key is configured
- `checks.vector_store_id`: whether vector store is configured

### Example Response

```json
{
  "service": "EcoGuide AI",
  "status": "ok",
  "region": "cheonan-si",
  "checks": {
    "openai_api_key": true,
    "vector_store_id": true
  }
}
```

## POST /api/chat

### Purpose

Accept a disposal question, optionally with an image, and return a grounded disposal answer.

### Content Type

Use `multipart/form-data` for v1 because the request may contain an image.

### Request Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `question` | string | yes | User question in Korean |
| `image` | binary | no | Optional uploaded image |
| `region` | string | no | Defaults to `cheonan-si`; reserved for future expansion |
| `session_id` | string | no | Optional client-side correlation token |

### Successful Response Fields

| Field | Type | Description |
| --- | --- | --- |
| `decision` | string | Final disposal action |
| `reason` | string | Why the action is recommended |
| `prep_steps` | string[] | Short preparation steps before disposal |
| `citations` | object[] | Source references supporting the answer |
| `needs_clarification` | boolean | Whether more info is needed |
| `follow_up_question` | string or null | Next question to ask the user |
| `identified_item` | string or null | Short Korean label for the item inferred from the uploaded image, when available |
| `request_id` | string | Server-generated traceable request id |

### Citation Object

| Field | Type | Description |
| --- | --- | --- |
| `source_id` | string | ID from source catalog |
| `title` | string | Human-readable title |
| `authority` | string | Issuing authority |
| `url` | string or null | Public source URL when available |
| `page_hint` | string or null | Optional page or section hint |
| `excerpt` | string or null | Optional short supporting snippet |

Citation normalization rules:

- `source_id` must match an authoritative source in `data/catalog/source_catalog.yaml`
- the cited source must also appear in the current `file_search_call.results`
- `title`, `authority`, and `url` are canonicalized from the source catalog rather than trusting model-generated values

### Example Success Response

```json
{
  "decision": "오염이 심한 플라스틱 배달용기는 일반쓰레기로 배출해 주세요.",
  "reason": "천안시 안내와 환경부 분리배출 가이드를 기준으로 내용물이 많이 남았거나 세척이 어려운 플라스틱 용기는 재활용 품목으로 보기 어렵습니다.",
  "prep_steps": [
    "남은 음식물과 기름기를 최대한 비워 주세요.",
    "세척이 어렵다면 종량제 봉투에 담아 주세요.",
    "뚜껑이나 다른 재질 부품은 분리 가능하면 따로 떼어 주세요."
  ],
  "citations": [
    {
      "source_id": "cheonan-waste-disposal-page",
      "title": "생활폐기물 배출방법안내",
      "authority": "천안시",
      "url": "https://lll.cheonan.go.kr/kor/sub06_13_06.do",
      "page_hint": null,
      "excerpt": "가연성 생활폐기물은 종량제 봉투에 담아 생활폐기물 배출장소에 배출"
    }
  ],
  "needs_clarification": false,
  "follow_up_question": null,
  "identified_item": "플라스틱 배달용기",
  "request_id": "req_demo_001"
}
```

### Clarification Response Pattern

Use this when the system cannot safely decide from the input.

```json
{
  "decision": "정확한 배출 방법을 확정하기 어렵습니다.",
  "reason": "사진과 질문만으로는 재질과 오염 정도를 확실히 구분하기 어렵습니다.",
  "prep_steps": [],
  "citations": [],
  "needs_clarification": true,
  "follow_up_question": "플라스틱 용기인가요, 아니면 비닐이나 복합재질인가요?",
  "identified_item": null,
  "request_id": "req_demo_002"
}
```

## Error Shape

All error responses should use a stable structure.

```json
{
  "error": {
    "code": "VECTOR_STORE_NOT_CONFIGURED",
    "message": "OpenAI vector store ID is not configured.",
    "retryable": false
  }
}
```

## Suggested Error Codes

- `INVALID_REQUEST`
- `UNSUPPORTED_FILE_TYPE`
- `FILE_TOO_LARGE`
- `OPENAI_API_KEY_MISSING`
- `VECTOR_STORE_NOT_CONFIGURED`
- `UPSTREAM_OPENAI_ERROR`
- `INTERNAL_SERVER_ERROR`

## cURL Example

```bash
curl -X POST http://localhost:3000/api/chat \
  -F "question=폐의약품은 어디에 버리나요?" \
  -F "region=cheonan-si"
```

## Versioning Note

The app is in pre-v1 prototype stage. The response schema should still be treated as stable once implementation starts, because UI rendering, prompt design, and evaluation fixtures depend on it.
