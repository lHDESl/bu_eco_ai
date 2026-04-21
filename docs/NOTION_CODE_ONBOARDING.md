# Notion Code Onboarding Guide

## Purpose

This document is a Notion-ready guide for teammates who need to understand the EcoGuide AI codebase well enough to:

- explain the project in meetings or presentations
- review the implementation
- suggest refactoring ideas
- join the project without prior deep AI or web-development knowledge

This guide is intentionally written in a student-friendly way.

## Recommended Notion Structure

Create one parent page named `코드 이해 가이드` and add the following subpages:

1. `코드 읽는 순서`
2. `전체 흐름 한눈에 보기`
3. `파일별 쉬운 설명`
4. `코드리뷰 체크리스트`
5. `리팩토링 후보`
6. `질문 메모`
7. `전체 코드 전문`

For `전체 코드 전문`, paste or attach `docs/CODE_REVIEW_PACK.md`.

---

## Page 1. 코드 읽는 순서

### Why This Page Exists

코드를 처음 보는 사람은 모든 파일을 처음부터 끝까지 읽으면 오히려 더 헷갈릴 수 있습니다.
이 페이지는 “무슨 순서로 보면 가장 빨리 이해되는가”를 알려주는 가이드입니다.

### Recommended Reading Order

#### Step 1. 화면의 시작점 보기

먼저 사용자가 처음 보게 되는 화면부터 확인합니다.

- `src/app/page.tsx`
- `src/components/home-hero.tsx`
- `src/components/example-questions.tsx`
- `src/components/question-workspace.tsx`
- `src/components/answer-card.tsx`

이 단계의 목표:

- 사용자가 어떤 화면을 보게 되는지 이해하기
- 질문 입력부터 답변 출력까지 흐름 감 잡기

#### Step 2. API가 무엇을 받는지 보기

다음으로 서버가 어떤 요청을 받고 어떤 응답을 주는지 봅니다.

- `src/app/api/chat/route.ts`
- `src/app/api/health/route.ts`
- `src/lib/contracts.ts`

이 단계의 목표:

- 프론트엔드와 백엔드가 어떤 형식으로 대화하는지 이해하기
- 응답 구조가 어떻게 고정되어 있는지 파악하기

#### Step 3. AI 핵심 로직 보기

이제 실제로 AI가 어떻게 답변을 만드는지 봅니다.

- `src/lib/openai/chat.ts`
- `src/lib/openai/prompt.ts`
- `src/lib/openai/response-schema.ts`
- `src/lib/openai/client.ts`

이 단계의 목표:

- 질문이 OpenAI로 어떻게 전달되는지 이해하기
- 공식 문서 검색 결과가 어떻게 citation으로 연결되는지 보기

#### Step 4. 환경설정과 데이터 보기

- `src/lib/config.ts`
- `src/lib/source-catalog.ts`
- `data/catalog/source_catalog.yaml`
- `.env.example`

이 단계의 목표:

- 앱이 어떤 환경변수로 동작하는지 이해하기
- 어떤 공식 자료를 신뢰하는지 이해하기

#### Step 5. ingestion 보기

- `scripts/ingest-docs.ts`

이 단계의 목표:

- 공식 문서를 벡터스토어에 넣는 과정을 이해하기
- 왜 RAG가 가능한지 이해하기

### Fast Path For Non-Developers

코딩이 익숙하지 않은 사람은 아래 5개만 먼저 보면 됩니다.

1. `src/app/page.tsx`
2. `src/components/question-workspace.tsx`
3. `src/app/api/chat/route.ts`
4. `src/lib/openai/chat.ts`
5. `scripts/ingest-docs.ts`

---

## Page 2. 전체 흐름 한눈에 보기

### Simple Flow

```text
사용자 질문
  -> 웹 화면에서 입력
  -> /api/chat 전송
  -> 서버가 입력 검사
  -> OpenAI Responses API 호출
  -> File Search로 공식 문서 검색
  -> 검색 결과를 바탕으로 답변 생성
  -> citation 정리
  -> 화면에 결론 / 이유 / 준비 단계 / 출처 표시
```

### What Each Layer Does

| 레이어 | 역할 |
| --- | --- |
| UI | 질문을 받고 결과를 보여준다 |
| API Route | 요청을 검사하고 AI 로직을 호출한다 |
| OpenAI Layer | 검색과 답변 생성을 담당한다 |
| Source Catalog | 공식 문서 목록과 메타데이터를 관리한다 |
| Ingestion Script | 공식 문서를 벡터스토어에 올린다 |

### Visual Block Recommendation

In Notion, add a 5-column callout or simple table:

| 1. User | 2. UI | 3. API | 4. Search | 5. Answer |
| --- | --- | --- | --- | --- |
| 질문 입력 | 폼 제출 | 입력 검사 | 공식 문서 검색 | 답변 + 출처 표시 |

---

## Page 3. 파일별 쉬운 설명

### File Map

| 파일 | 쉬운 설명 | 중요도 |
| --- | --- | --- |
| `src/app/page.tsx` | 메인 화면을 조립하는 시작점 | 높음 |
| `src/components/question-workspace.tsx` | 질문 입력, 파일 업로드, API 호출을 담당하는 화면 핵심 파일 | 매우 높음 |
| `src/components/answer-card.tsx` | AI가 준 답을 보기 좋게 보여주는 파일 | 높음 |
| `src/components/citation-list.tsx` | 출처 목록을 보여주는 파일 | 중간 |
| `src/app/api/chat/route.ts` | 질문 요청을 받아 검사하고 AI 로직으로 넘기는 서버 입구 | 매우 높음 |
| `src/app/api/health/route.ts` | 서비스가 준비됐는지 확인하는 간단한 API | 중간 |
| `src/lib/contracts.ts` | API 응답 형식을 정하는 약속 문서 같은 코드 | 매우 높음 |
| `src/lib/config.ts` | 환경변수를 읽고 앱 설정을 꺼내는 파일 | 높음 |
| `src/lib/source-catalog.ts` | 공식 자료 목록을 읽어오는 파일 | 높음 |
| `src/lib/openai/chat.ts` | AI 호출과 citation 정규화를 처리하는 핵심 파일 | 매우 높음 |
| `src/lib/openai/prompt.ts` | AI에게 어떤 규칙으로 답하라고 지시하는 파일 | 높음 |
| `src/lib/openai/response-schema.ts` | AI 응답이 어떤 형태여야 하는지 검증하는 파일 | 높음 |
| `scripts/ingest-docs.ts` | 공식 문서를 검색 가능한 형태로 업로드하는 스크립트 | 매우 높음 |

### Easy Explanation Blocks

#### `src/components/question-workspace.tsx`

이 파일은 사용자가 실제로 가장 많이 상호작용하는 부분입니다.
질문 입력, 이미지 선택, 제출 버튼, 에러 메시지, 답변 상태가 모두 이 파일에 모여 있습니다.
즉 “사용자 입력의 중심”이라고 보면 됩니다.

#### `src/app/api/chat/route.ts`

이 파일은 웹 화면과 AI 로직 사이의 문지기 역할을 합니다.
사용자가 보낸 질문이 비어 있는지, 이미지 형식이 맞는지, 이미지 크기가 너무 크지 않은지 검사하고, 문제가 없으면 AI 처리 로직으로 넘깁니다.

#### `src/lib/openai/chat.ts`

이 파일은 프로젝트의 두뇌에 가장 가까운 부분입니다.
OpenAI에 요청을 보내고, 검색 결과를 포함한 답변을 받아온 뒤, citation을 공식 source catalog 기준으로 다시 정리합니다.

#### `scripts/ingest-docs.ts`

이 파일은 공식 문서를 벡터스토어에 넣어 검색 가능하게 만드는 도구입니다.
쉽게 말하면 “AI가 참고할 교과서를 미리 등록하는 과정”을 담당합니다.

---

## Page 4. 코드리뷰 체크리스트

### Basic Review Questions

코드리뷰를 할 때는 아래 질문을 기준으로 보면 좋습니다.

1. 이 파일의 역할이 분명한가?
2. 함수 이름이 역할을 잘 설명하는가?
3. 입력 검사가 충분한가?
4. 에러 메시지가 사용자 친화적인가?
5. 코드 중복이 많은가?
6. 한 파일에 너무 많은 책임이 몰려 있지는 않은가?
7. 공식 출처와 관련된 규칙이 잘 지켜지고 있는가?

### API Review Checklist

- 잘못된 입력이 들어왔을 때 안전하게 막는가?
- 에러 응답 형식이 일관적인가?
- 업로드 파일 형식과 크기 제한이 적절한가?
- AI 호출 실패 시 사용자에게 너무 불친절하지 않은가?

### AI / RAG Review Checklist

- citation이 실제 검색 결과와 연결되는가?
- source_id가 authoritative source와 일치하는가?
- 애매한 경우 추가 질문으로 빠질 수 있는가?
- 모델이 출처를 꾸며낼 가능성을 줄였는가?

### UI Review Checklist

- 질문 입력 흐름이 직관적인가?
- 로딩 상태가 충분히 보이는가?
- 결과 카드가 이해하기 쉬운가?
- 출처가 눈에 잘 띄는가?

### Student-Friendly Review Rule

리뷰할 때 “이 코드가 맞나?”만 보지 말고,
“이 코드를 처음 보는 친구도 이해할 수 있나?”를 함께 보면 좋습니다.

---

## Page 5. 리팩토링 후보

### Why Refactoring Matters

리팩토링은 기능을 바꾸지 않고 코드를 더 읽기 쉽고 관리하기 쉽게 만드는 작업입니다.
학부 프로젝트에서는 새로운 기능 추가보다 “이해하기 쉬운 구조 만들기”가 더 큰 가치가 있을 때가 많습니다.

### Current Refactoring Candidates

| 우선순위 | 대상 | 이유 | 기대 효과 |
| --- | --- | --- | --- |
| 높음 | `src/components/question-workspace.tsx` | 상태 관리, fetch, 에러 처리, UI가 한 파일에 몰려 있음 | 화면 코드가 더 읽기 쉬워짐 |
| 높음 | `src/app/api/chat/route.ts` | 입력 검증과 사용자 메시지 문자열이 inline으로 많음 | API 코드가 더 명확해짐 |
| 높음 | `src/lib/openai/chat.ts` | OpenAI 호출, 검색 결과 수집, citation 정규화가 한 파일에 있음 | AI 로직 테스트와 수정이 쉬워짐 |
| 중간 | 사용자 메시지 문자열 관리 | 여러 파일에 사용자 문구가 퍼져 있음 | 유지보수성과 발표용 문구 정리가 쉬워짐 |
| 중간 | 테스트 부재 | 자동 회귀 테스트가 아직 없음 | 기능 변경 시 안정성 향상 |
| 중간 | config / env 설명 강화 | 환경변수 의미를 모르면 진입 장벽이 있음 | 신규 참여자 onboarding 개선 |

### Refactoring Ideas In Plain Language

#### 1. 화면 코드와 데이터 처리 코드를 나누기

현재 질문 입력 컴포넌트는 화면 표시와 API 호출 로직을 모두 들고 있습니다.
나중에는 “질문 제출 로직”을 custom hook이나 별도 함수로 분리하면 더 읽기 쉬워질 수 있습니다.

#### 2. API 입력 검증 전용 함수 만들기

현재 `chat` API route 안에서 질문 검사와 이미지 검사가 직접 이루어집니다.
이를 별도 validator 함수로 분리하면 테스트와 재사용이 쉬워집니다.

#### 3. citation 정규화 로직 분리

현재 OpenAI 호출과 citation 정규화가 같은 파일에 있습니다.
이를 `citation-normalizer.ts` 같은 파일로 분리하면 코드 리뷰가 쉬워집니다.

#### 4. 사용자 문구 중앙 관리

오류 메시지나 안내 문구를 한 곳에서 관리하면,
나중에 발표용 문구 수정이나 다국어 지원이 쉬워집니다.

#### 5. 테스트 추가

가장 먼저 추가하면 좋은 테스트는 아래와 같습니다.

- contracts 스키마 테스트
- chat route 입력 검증 테스트
- citation 정규화 테스트
- ingestion 중복 방지 테스트

---

## Page 6. 질문 메모

### Purpose

이 페이지는 팀원이 코드를 읽다가 생긴 질문을 기록하는 곳입니다.
질문을 적어두면 회의 때 빠뜨리지 않고 논의할 수 있습니다.

### Recommended Table

| 질문 | 관련 파일 | 질문자 | 답변 여부 | 메모 |
| --- | --- | --- | --- | --- |
|  |  |  | 미해결 / 해결 |  |

---

## Page 7. 전체 코드 전문

### How To Use

이 페이지에는 전체 코드 전문을 넣습니다.
방법은 두 가지 중 하나를 추천합니다.

1. `docs/CODE_REVIEW_PACK.md` 전체를 붙여넣기
2. `App Layer`, `Components`, `Core Logic`, `Scripts & Config` 4개 하위 페이지로 나눠 붙여넣기

### Recommendation

노션 가독성을 위해 아래처럼 나누는 것을 추천합니다.

- `01 App Layer`
- `02 Components`
- `03 Core Logic`
- `04 Scripts & Config`

---

## Presentation Connection Notes

This code onboarding section is also useful for presentation and reports.

Use it when preparing:

- architecture slide
- implementation slide
- role explanation slide
- refactoring or improvement slide
- future work slide

### Easy PPT Connection

| 발표 슬라이드 | 이 문서에서 가져올 것 |
| --- | --- |
| 시스템 구조 | Page 2 전체 흐름 한눈에 보기 |
| 주요 구현 설명 | Page 3 파일별 쉬운 설명 |
| 개선 사항 | Page 5 리팩토링 후보 |
| 팀 학습 과정 | Page 4 코드리뷰 체크리스트 |
