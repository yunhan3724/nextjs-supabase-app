# Development Guidelines

## 프로젝트 개요

- **제품**: 모임 이벤트 관리 웹 MVP (이벤트·공지·RSVP·카풀·정산·초대 링크 통합)
- **스택**: Next.js 15 App Router + Supabase(Postgres·Auth·RLS) + TypeScript 5 + Tailwind CSS + shadcn/ui + React Hook Form + Zod + Zustand
- **개발 전략**: UI 우선(Phase 0~2, 더미 데이터) → DB 연결(Phase 3~6)
- **참조 문서**: `docs/PRD.md` (기능 명세), `docs/ROADMAP.md` (단계별 체크리스트)

---

## 디렉토리 구조 규칙

### 라우트 그룹 배치

- `app/(app)/` — 모바일 앱 화면 (인증 필요), 로그인 사용자 전용
- `app/admin/` — 데스크톱 어드민 (`app_role='admin'` 전용, 1024px+)
- `app/auth/` — 인증 흐름 (공개 접근 허용)
- `app/invite/[token]/` — 초대 미리보기 (미인증 접근 허용)
- `components/ui/` — shadcn/ui 기본 컴포넌트 (수동 편집 금지)
- `components/` — 기능 컴포넌트 (인증 폼, 공통 버튼 등)
- `lib/supabase/` — Supabase 클라이언트 3종 (수정 시 아래 패턴 필수)
- `lib/mock/` — 더미 데이터 모듈 (Phase 0~2 UI 개발용, Phase 4에서 교체)
- `types/ui.ts` — UI 전용 임시 타입 (Phase 3 이후 `database.types.ts`로 교체)
- `lib/database.types.ts` — Supabase 자동 생성 타입 (직접 편집 금지)

### 파일 생성 규칙

- 페이지: `app/(app)/events/[eventId]/participants/page.tsx` 형식 준수
- 컴포넌트: PascalCase, 기능별로 분리하여 재사용 가능하게 작성
- Server Action: `app/(app)/events/actions.ts` 또는 해당 라우트 폴더 내 `actions.ts`

---

## Supabase 클라이언트 패턴

### 3종 클라이언트 사용 규칙

| 파일                     | 사용 위치                                 | 임포트                |
| ------------------------ | ----------------------------------------- | --------------------- |
| `lib/supabase/client.ts` | 클라이언트 컴포넌트                       | `createBrowserClient` |
| `lib/supabase/server.ts` | 서버 컴포넌트·Route Handler·Server Action | `createServerClient`  |
| `lib/supabase/proxy.ts`  | `proxy.ts` (미들웨어)에서만               | `updateSession`       |

- **반드시** 서버 클라이언트는 함수 내부에서 매번 새로 생성 (전역 변수 금지 — Fluid compute 세션 누락 방지)
- **금지**: 서버 컴포넌트에서 `lib/supabase/client.ts` 임포트
- **금지**: 클라이언트 컴포넌트에서 `lib/supabase/server.ts` 임포트

### 올바른 서버 클라이언트 생성 예시

```typescript
// ✅ 올바름
export async function getEvents() {
  const supabase = await createClient() // 함수 내부에서 생성
  return supabase.from('events').select('*')
}

// ❌ 금지
const supabase = await createClient() // 전역 또는 모듈 레벨
```

---

## 인증 & 라우팅 규칙

### proxy.ts (미들웨어)

- `proxy.ts` (루트)는 수정 시 반드시 `lib/supabase/proxy.ts`의 `updateSession` 패턴 유지
- 공개 경로 예외: `/`, `/auth/*`, `/invite/*` — 이 경로들은 미인증 접근 허용
- 새 공개 경로 추가 시: `lib/supabase/proxy.ts`의 경로 예외 조건과 `proxy.ts`의 matcher 동시 업데이트
- `supabase.auth.getClaims()` 호출과 `createServerClient` 사이에 코드 삽입 금지

### 인증 게이트 위치

- `app/(app)/layout.tsx` — 모든 `(app)` 라우트의 로그인 확인 게이트
- `app/admin/layout.tsx` — `is_admin()` 검증 게이트
- 개별 페이지에서 중복 게이트 구현 금지 — layout에서 일괄 처리

---

## 개발 단계별 규칙

### Phase 0~2 (UI 단계): 더미 데이터 규칙

- 모든 데이터는 `lib/mock/` 모듈에서 import
- Server Action 연결 금지 — 제출 핸들러는 더미 동작(토스트) + 더미 리다이렉트
- 권한 분기는 더미 `currentUser` 플래그로 처리 (실제 RLS 검증은 Phase 4~5)
- `lib/mock/` 설계 원칙: Phase 4에서 import 경로만 바꿔 실제 쿼리로 교체 가능하도록 인터페이스 일치

### Phase 3 (DB 단계): 마이그레이션 규칙

- 마이그레이션은 `mcp__supabase__apply_migration` 사용, 단위별로 분리 적용
- 마이그레이션 완료 후 즉시 `mcp__supabase__generate_typescript_types` 로 `lib/database.types.ts` 재생성
- 타입 재생성 후 `npm run build` 타입 에러 없음 확인 필수
- `mcp__supabase__get_advisors` 로 보안 경고 0건 확인 필수

### Phase 4~5 (백엔드 연결 단계): 교체 규칙

- UI 컴포넌트는 그대로 유지, 더미 데이터 소스만 실제 쿼리/액션으로 교체
- `types/ui.ts` 임시 타입을 `lib/database.types.ts` 기반으로 교체
- zustand 낙관적 업데이트는 유지하되 서버 응답으로 확정

---

## RLS & DB 규칙

### RLS 헬퍼 함수 (Phase 3에서 생성)

- `is_admin()` — `profiles.app_role = 'admin'` 확인
- `is_event_member(_event_id uuid)` — `event_participants` 멤버 여부
- `is_event_organizer(_event_id uuid)` — `event_participants.role = 'organizer'` 여부
- **RLS 정책 내에서 테이블 직접 조인 금지** — 반드시 헬퍼 함수로 판정 (무한재귀 방지)

### DB 설계 원칙

- 모든 하위 테이블(`announcements`, `carpools`, `expenses` 등)에 `event_id` 직접 보유 (RLS 단순화)
- 초대 토큰은 `gen_random_bytes`로 생성, `event_invites.token` UNIQUE 제약
- `redeem_invite(token)` RPC 단일 트랜잭션으로 처리, 직접 insert 금지
- 정산 금액 타입: `numeric(12,2)` — `float` 사용 금지

---

## 코드 규칙

### TypeScript

- `any` 타입 사용 금지 — 반드시 명시적 타입 또는 `unknown` + type guard
- Supabase 쿼리는 `lib/database.types.ts`의 `Database` 제네릭 타입 적용
- 컴포넌트 props는 반드시 인터페이스 또는 타입으로 정의

### 컴포넌트

- shadcn/ui 컴포넌트 추가: `npx shadcn@latest add <component>` (직접 `components/ui/` 편집 금지)
- 기존 설치된 shadcn 컴포넌트 재설치 금지: `badge`, `button`, `card`, `checkbox`, `dropdown-menu`, `input`, `label`
- 폼: React Hook Form + Zod resolver 필수 (`useState` 직접 폼 관리 금지)
- 상태관리: zustand는 클라이언트 UI 상태(탭·필터·낙관적 업데이트)에만 사용 — 서버 데이터 캐시 목적 금지

### 스타일링

- Tailwind CSS 클래스 직접 사용, 인라인 style 금지
- 반응형 필수: 모바일 우선 (`(app)` 라우트: 320px~), 어드민 데스크톱 (1024px+)
- 날짜 표시: `date-fns` 한국 로캘 (`ko`) 사용

### 데이터 페칭

- 데이터 읽기: RSC(React Server Component) + server client 우선
- 데이터 변경: Server Action 또는 RPC — 클라이언트에서 직접 Supabase 뮤테이션 금지
- `'use client'` 지시어는 상호작용이 필요한 최소 범위에만 적용

---

## 커밋 규칙

- 형식: `<type>: <한국어 설명>` (예: `feat: 이벤트 생성 폼 UI 추가`)
- 허용 타입: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `revert`
- 제목 최대 100자, 한국어 허용
- 커밋 전 자동 실행: ESLint + Prettier (husky pre-commit, lint-staged)
- 커밋 전 수동 확인: `npm run validate` (type-check + lint + format:check)

---

## 주요 파일 상호작용 규칙

### 동시 수정 필요 케이스

| 변경 내용                         | 함께 수정해야 할 파일                                  |
| --------------------------------- | ------------------------------------------------------ |
| 새 공개 라우트 추가               | `proxy.ts` matcher + `lib/supabase/proxy.ts` 경로 예외 |
| Supabase 마이그레이션 적용        | `lib/database.types.ts` 재생성 필수                    |
| `types/ui.ts` 타입 변경           | 해당 타입 사용하는 모든 컴포넌트·페이지                |
| `lib/mock/` 더미 데이터 구조 변경 | 해당 mock을 import하는 모든 페이지·컴포넌트            |
| shadcn 컴포넌트 추가              | `components.json` 자동 업데이트 확인                   |
| ROADMAP.md 태스크 완료            | 해당 체크박스 `[x]` + 상태 `✅` 로 업데이트            |

### 보존 필수 파일 (수정 시 기존 패턴 유지)

- `proxy.ts` — Next.js 미들웨어, `updateSession` 패턴 유지
- `lib/supabase/client.ts`, `server.ts`, `proxy.ts` — 클라이언트 패턴 유지
- `app/auth/` 전체 — 스타터 인증 흐름 보존
- `lib/database.types.ts` — 자동 생성 파일, 직접 편집 금지

---

## AI 결정 기준

### 현재 개발 단계 판단

1. `lib/mock/` 폴더가 존재하고 `lib/database.types.ts`에 실제 테이블 타입이 없으면 → Phase 0~2 (UI 단계)
2. 마이그레이션이 적용되고 `database.types.ts`에 테이블 타입이 있으면 → Phase 3 이상
3. Server Action이 구현되어 있으면 → Phase 4 이상

### 기능 구현 우선순위

1. 현재 Phase에 해당하는 작업만 구현 (Phase 미리 구현 금지)
2. UI Phase에서 Server Action 연결 요청 시 → 더미 동작으로 구현하고 Phase 4 시 교체 안내
3. RLS 정책 추가 시 → 헬퍼 함수 경유 여부 먼저 확인

---

## 금지 사항

- **`any` 타입 사용 금지**
- **서버 클라이언트 전역 변수 선언 금지** (함수 내부 생성 필수)
- **`lib/database.types.ts` 직접 편집 금지** (마이그레이션 후 재생성)
- **`components/ui/` 직접 편집 금지** (shadcn CLI로 관리)
- **RLS 정책 내 테이블 직접 조인 금지** (헬퍼 함수 경유 필수)
- **정산 금액에 `float`/`number` 사용 금지** (`numeric(12,2)`)
- **`redeem_invite` 외 경로로 초대 처리 금지** (RPC 단일 경로)
- **UI Phase에서 실제 DB 쿼리/Server Action 연결 금지** (더미 데이터 유지)
- **클라이언트 컴포넌트에서 직접 Supabase 뮤테이션 금지** (Server Action 경유)
- **이미 설치된 shadcn 컴포넌트 재설치 금지**: `badge`, `button`, `card`, `checkbox`, `dropdown-menu`, `input`, `label`
- **인라인 `style={{}}` 사용 금지** (Tailwind 클래스만)
- **커밋 타입 외 타입 사용 금지**: feat/fix/docs/style/refactor/test/chore/perf/ci/revert 외 금지
