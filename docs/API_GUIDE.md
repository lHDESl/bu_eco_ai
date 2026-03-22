# API Guide

The canonical machine-readable contract is `../specs/openapi.yaml`. This document explains the same API in implementation-friendly prose.

## API Principles

- The API is region-fixed to `천안시` in v1.
- The client receives stable, structured JSON.
- The server hides provider-specific response details.
- All non-error answers should include at least one citation.

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

### Example Success Response

```json
{
  "decision": "가연성 생활폐기물은 종량제 봉투에 담아 배출하세요.",
  "reason": "천안시 안내 기준으로 일반 가연성 생활폐기물은 종량제 봉투 배출 대상입니다.",
  "prep_steps": [
    "내용물을 비웁니다.",
    "천안시 종량제 봉투에 담습니다.",
    "생활폐기물 배출장소에 배출합니다."
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
  "request_id": "req_demo_001"
}
```

### Clarification Response Pattern

Use this when the system cannot safely decide from the input.

```json
{
  "decision": "정확한 배출 방법을 확정하기 어렵습니다.",
  "reason": "사진만으로는 재질과 오염 정도를 확실히 구분하기 어렵습니다.",
  "prep_steps": [],
  "citations": [],
  "needs_clarification": true,
  "follow_up_question": "플라스틱 용기인가요, 아니면 비닐이나 복합재질인가요?",
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
  -F "question=가정에서 나온 폐의약품은 어디에 버리나요?" \
  -F "region=cheonan-si"
```

## Versioning Note

The app is in pre-v1 prototype stage. The response schema should still be treated as stable once implementation starts, because UI rendering, prompt design, and evaluation fixtures depend on it.
