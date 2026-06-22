# 모임 이벤트 관리 웹 MVP — 개발 로드맵

한 링크로 모임의 공지·RSVP·카풀·정산을 한 곳에서 끝내는 모바일 우선 웹 서비스를 만든다.

> **기준일**: 2026-06-22 | **PRD**: [docs/PRD.md](./PRD.md) | **기술 스택**: Next.js 15 App Router + Supabase(Postgres·Auth·RLS) + TypeScript 5

---

## 개요

이 로드맵은 PRD의 마일스톤(M0~M5)을 7개 Phase로 변환한 실행 계획이다. 각 Phase는 착수 가능한 수준의 태스크 체크리스트, 담당 역할, 관련 파일/RPC, 기술 힌트를 포함한다.

> **개발 전략 (변경 이유)**: UI 우선(목업 → 검증 → 백엔드 연결) 전략을 채택한다. 화면 구조와 사용자 흐름을 하드코딩 더미 데이터로 먼저 빠르게 완성해 눈으로 검증·보완한 뒤, 실제 DB 스키마와 Supabase 연결 작업을 진행한다. 따라서 UI(Phase 0~2)를 선행하고 DB·백엔드(Phase 3~5)를 후행하며, 어드민(Phase 6)은 UI+백엔드를 한 번에 처리한다.

### 핵심 기능(PRD 기능 ID)

- **F001 이벤트 관리** — 이벤트 CRUD·상태 전환·대시보드 목록
- **F002 공지 관리** — 공지 CRUD·핀 고정
- **F003 참여자 관리(RSVP)** — RSVP 응답·동반 인원·현황 집계
- **F004 초대 링크** — 토큰 발급·미리보기·redeem 진입 흐름
- **F005 카풀 관리** — 차량 등록·탑승 신청·확정·잔여석
- **F006 정산 관리** — n분의1 자동 분배·송금 현황 토글
- **F007 어드민 대시보드** — 통계·전체 이벤트/유저 관리

### MVP 최소 데모 경로

> **UI 목업 완료 (Phase 0 → Phase 1 → Phase 2)** 시점에 "이벤트 생성 → 초대 링크 공유 → 링크 클릭 → 참여 → RSVP" 전체 화면 흐름을 더미 데이터로 클릭하며 검증할 수 있다. 이후 **DB 연결 (Phase 3 → Phase 4)** 이 완료되면 동일 경로가 실제 데이터로 end-to-end 동작한다. 즉 UI 검증 지점(~07-08)과 실데이터 동작 지점(~08-13)을 분리해 진행한다.

### 상태 범례

- ✅ 완료
- 🚧 진행중
- ⏳ 예정

---

## 진행 현황 요약

| Phase                                               | 마일스톤 | 내용                             | 기능 ID                | 예상 기간              | 상태    |
| --------------------------------------------------- | -------- | -------------------------------- | ---------------------- | ---------------------- | ------- |
| Phase 0                                             | M0       | 기반 정리 & UI 스캐폴딩          | (공통 기반)            | ~1주 (06-22 ~ 06-28)   | ⏳ 예정 |
| Phase 1                                             | M1       | 이벤트 & 참여자 UI               | F001, F003             | ~1주 (06-29 ~ 07-04)   | ⏳ 예정 |
| Phase 2                                             | M2       | 공지·카풀·정산·초대 UI           | F002, F004, F005, F006 | ~1주 (07-05 ~ 07-11)   | ⏳ 예정 |
| **— UI 목업 완료 / 화면 흐름 검증 지점 (~07-11) —** |          |                                  |                        |                        |         |
| Phase 3                                             | M3       | DB 스키마 & RLS & RPC            | (공통 기반)            | ~1.5주 (07-12 ~ 07-22) | ⏳ 예정 |
| Phase 4                                             | M4       | 백엔드 연결 (이벤트·참여자·초대) | F001, F003, F004       | ~1.5주 (07-23 ~ 08-01) | ⏳ 예정 |
| **— MVP 실데이터 end-to-end 동작 지점 (~08-01) —**  |          |                                  |                        |                        |         |
| Phase 5                                             | M5       | 백엔드 연결 (공지·카풀·정산)     | F002, F005, F006       | ~1.5주 (08-02 ~ 08-12) | ⏳ 예정 |
| Phase 6                                             | —        | 어드민 대시보드 (UI+백엔드)      | F007                   | ~1.5주 (08-13 ~ 08-23) | ⏳ 예정 |

---

## Phase 0 (M0): 기반 정리 & UI 스캐폴딩 ⏳ — 우선순위

> **목적**: 스타터 잔재 제거, 라이브러리/shadcn 컴포넌트 설치, 전체 라우트 골격 구성, 모든 페이지 빈 껍데기 + 목업 UI 작성. DB 연결 없이 하드코딩 더미 데이터로 전체 화면을 클릭 가능하게 만든다.
> **예상 기간**: ~1주 (2026-06-22 ~ 2026-06-28)
> **산출물**: 모든 라우트 진입 가능, 목업 데이터 기반 화면 흐름 클릭 가능, 레이아웃·네비게이션 골격 완성

### 스타터 정리 & 랜딩 교체 (담당: 프론트엔드)

- [ ] `components/tutorial/` 온보딩 튜토리얼 컴포넌트 제거
- [ ] hero/스타터 데모 섹션 제거, `app/page.tsx` 를 서비스 랜딩으로 교체
- [ ] 스타터 잔재 import·미사용 컴포넌트 정리 (`npm run build` 통과 확인)
- 힌트: `starter-cleaner` 에이전트 활용 가능. 기존 인증 흐름(`app/auth/*`, `proxy.ts`)은 보존

### 라이브러리 & shadcn/ui 설치 (담당: 프론트엔드)

- [ ] npm 패키지 설치: `react-hook-form`, `zod`, `@hookform/resolvers`, `zustand`, `date-fns`
- [ ] shadcn 추가: `form`, `dialog`, `select`, `tabs`, `avatar`, `table`, `sonner`, `sheet`, `skeleton`, `separator`
- [ ] `app/layout.tsx` 에 sonner `<Toaster />` 마운트
- 힌트: 기존 재사용 컴포넌트(`badge`,`button`,`card`,`checkbox`,`dropdown-menu`,`input`,`label`)는 재설치 금지

### 라우트 골격 & 레이아웃 (담당: 프론트엔드)

- [ ] 라우트 그룹 골격: `app/(app)/layout.tsx`(모바일 셸+네비게이션), `app/admin/layout.tsx`(데스크톱 사이드바)
- [ ] 빈 페이지 스캐폴딩: `dashboard`, `events/new`, `events/[eventId]/*`, `profile`, `invite/[token]`, `admin/*`
- [ ] `app/(app)/events/[eventId]/layout.tsx` — 이벤트 탭 네비게이션 골격(개요·공지·참여자·카풀·정산·초대)
- 힌트: `nextjs-app-developer` 에이전트로 라우트 골격 스캐폴딩. 이 단계에서는 인증 게이트 로직 없이 화면 구조만 우선 (게이트는 Phase 4 백엔드 연결 시 결합)

### 목업 데이터 & 공통 UI 토대 (담당: 프론트엔드)

- [ ] `lib/mock/` — 하드코딩 더미 데이터 모듈 작성(이벤트·참여자·공지·카풀·정산·초대 샘플)
- [ ] UI 전용 타입 정의(`types/ui.ts` 등) — DB 스키마 확정 전 화면용 임시 타입 (Phase 3에서 `database.types.ts`로 교체 예정)
- [ ] 공통 레이아웃 컴포넌트: 모바일 헤더·하단 탭바·빈 상태(empty)·스켈레톤 골격
- 힌트: 더미 데이터는 한 모듈에 모아 Phase 4 교체 시 import 경로만 바꾸도록 설계. 날짜 포맷은 `date-fns` 한국 로캘

### 테스트 체크리스트 (Playwright MCP)

- [ ] 모든 주요 라우트(`/`, `/dashboard`, `/events/new`, `/events/[id]/*`, `/invite/[token]`, `/admin/*`)가 에러 없이 렌더
- [ ] 모바일 뷰포트(320~)에서 네비게이션·하단 탭바 동작 확인
- [ ] `npm run build` 통과 + 콘솔 에러 없음

---

## Phase 1 (M1): 이벤트 & 참여자 UI ⏳ — 우선순위

> **목적**: 이벤트 생성/수정 폼, 대시보드 목록, 참여자 RSVP 화면을 더미 데이터로 완성. 실제 데이터 연결 없이 UI·컴포넌트·상호작용을 완성한다.
> **기능 ID**: F001(이벤트 관리), F003(참여자 관리/RSVP)
> **예상 기간**: ~1주 (2026-06-29 ~ 2026-07-04)
> **산출물**: 이벤트 생성 폼·대시보드·RSVP 화면 UI 완성 (더미 데이터)

### F001 — 이벤트 생성/수정 폼 UI (담당: 프론트엔드)

- [ ] zod 스키마 정의: 제목·설명·장소명·장소주소·시작일시(필수)·종료일시·최대인원·커버이미지URL·상태
- [ ] `app/(app)/events/new/page.tsx` — React Hook Form + zod resolver 폼 (제출 시 더미 동작/토스트)
- [ ] 폼 검증 UX: 필수값·최대인원 등 클라이언트 검증 에러 표시
- [ ] 이벤트 수정 폼 UI(동일 컴포넌트 재사용, 더미 초기값 주입)
- 힌트: Server Action 연결은 Phase 4. 지금은 제출 핸들러가 더미로 동작. 커버 이미지는 URL 입력 우선

### F001 — 이벤트 홈 & 상태 뱃지 UI (담당: 프론트엔드)

- [ ] `app/(app)/events/[eventId]/page.tsx` — 이벤트 홈(개요 + 공지 미리보기 자리 + 내 RSVP 위젯) 더미 렌더
- [ ] 상태 뱃지(`draft/published/closed/cancelled`) 표시 + 권한별 UI 분기(주최자 수정/상태변경 버튼 노출)
- [ ] 상태 전환 버튼 UI(클릭 시 더미 상태 변경/토스트)
- 힌트: 권한 분기는 더미 `currentUser` 플래그로 처리. 실제 검증은 Phase 4

### F001 — 대시보드 목록 UI (담당: 프론트엔드)

- [ ] `app/(app)/dashboard/page.tsx` — "내가 만든 이벤트" / "내가 참여하는 이벤트" 탭 허브 (더미 목록)
- [ ] 상태 뱃지(`badge`)·날짜 표시·빈 상태(skeleton/empty) 처리
- 힌트: 더미 데이터를 `lib/mock`에서 import. 카드 컴포넌트는 재사용 가능하게 분리

### F003 — RSVP 응답 & 현황 UI (담당: 프론트엔드)

- [ ] RSVP 토글 UI: `pending/going/not_going/maybe` 선택 + 더미 상태 반영
- [ ] 동반 인원(`guest_count`) 입력 UI
- [ ] `app/(app)/events/[eventId]/participants/page.tsx` — 참여자 목록 + 상태별 집계 카드 (더미 집계)
- [ ] zustand로 낙관적 RSVP 상태 관리 (클라이언트 UI 상태 한정)
- 힌트: 집계는 going/not_going/maybe/pending 카운트. 실제 응답 권한·저장은 Phase 4

### 테스트 체크리스트 (Playwright MCP)

- [ ] 이벤트 생성 폼 입력 → 더미 제출 → 토스트/리다이렉트 확인
- [ ] 필수값(시작일시) 누락·최대인원 초과 시 폼 검증 에러 표시
- [ ] 대시보드 탭 전환(만든/참여) 시 더미 목록 변화 확인
- [ ] RSVP going 토글 → 참여자 탭 집계 카드 수치 변화(클라이언트 상태) 확인
- [ ] 모바일 뷰포트에서 폼·목록·집계 카드 반응형 확인

---

## Phase 2 (M2): 공지·카풀·정산·초대 UI ⏳ — 우선순위 (UI 목업 완료 단계)

> **목적**: 공지·카풀·정산·초대 화면을 더미 데이터로 완성. 이 Phase 완료 시 전체 서비스 화면 흐름을 클릭으로 검증 가능(UI 목업 완료 = MVP 화면 검증 지점).
> **기능 ID**: F002(공지), F004(초대), F005(카풀), F006(정산)
> **예상 기간**: ~1주 (2026-07-05 ~ 2026-07-11)
> **산출물**: 공지·카풀·정산·초대 화면 UI 완성 (더미 데이터)

### F002 — 공지 UI (담당: 프론트엔드)

- [ ] `app/(app)/events/[eventId]/announcements/page.tsx` — 공지 목록(핀 고정 상단 정렬) 더미 렌더
- [ ] 공지 작성·수정·삭제 폼/다이얼로그 UI (더미 동작)
- [ ] 핀 고정 토글 UI + 이벤트 홈 공지 미리보기 위젯 연결(Phase 1 자리 채우기)
- 힌트: 작성 권한 UI는 더미 주최자 플래그로 분기. 저장 로직은 Phase 5

### F004 — 초대 링크 UI (담당: 프론트엔드)

- [ ] `app/(app)/events/[eventId]/invite/page.tsx` — `max_uses`·`expires_at` 설정 폼 + 발급 이력 목록 (더미)
- [ ] 링크 복사/공유 버튼 + 취소(revoke) 버튼 UI
- [ ] `app/invite/[token]/page.tsx` — 미리보기(제목·날짜) + "참여하기" 버튼 + 로그인 유도 UI (더미)
- 힌트: 미인증 진입·redeem 실제 흐름은 Phase 4. 지금은 미리보기/CTA 화면만

### F005 — 카풀 UI (담당: 프론트엔드)

- [ ] `app/(app)/events/[eventId]/carpools/new/page.tsx` — 출발지·출발시간·좌석수 등록 폼 UI
- [ ] `app/(app)/events/[eventId]/carpools/page.tsx` — 카풀 목록 + 잔여석 카드 (더미)
- [ ] `app/(app)/events/[eventId]/carpools/[carpoolId]/page.tsx` — 탑승자 신청/관리 뷰 + 신청/확정/거절 버튼 UI
- 힌트: 잔여석 표시는 더미 계산값. 신청·확정 권한 로직은 Phase 5

### F006 — 정산 UI (담당: 프론트엔드)

- [ ] `app/(app)/events/[eventId]/expenses/new/page.tsx` — 제목·총액·결제자 입력 폼 UI
- [ ] `app/(app)/events/[eventId]/expenses/page.tsx` — 정산 목록 + 내 분담 요약 (더미)
- [ ] `app/(app)/events/[eventId]/expenses/[expenseId]/page.tsx` — 분담 상세 + 송금 현황 토글 UI (`unpaid/pending/paid`)
- 힌트: n분의1 분배 표시는 더미 계산값. 자동 분배·저장 로직은 Phase 5

### 테스트 체크리스트 (Playwright MCP)

- [ ] 공지 목록 핀 고정 정렬·작성 다이얼로그 UI 동작 확인
- [ ] 초대 발급 폼 → 더미 토큰/이력 표시, 링크 복사 버튼 동작 확인
- [ ] `/invite/[token]` 미리보기·참여하기 CTA 화면 렌더 확인
- [ ] 카풀 등록 폼 → 목록·잔여석 카드, 탑승 신청/확정 버튼 UI 확인
- [ ] 정산 생성 폼 → 더미 n분의1 분담 요약·송금 토글 UI 확인
- [ ] **전체 화면 흐름 클릭 검증**: 이벤트 생성 → 초대 → 참여 → RSVP → 공지/카풀/정산까지 더미로 끊김 없이 이동

---

## Phase 3 (M3): DB 스키마 & RLS & RPC ⏳

> **목적**: UI 검증 완료 후 실제 Supabase 스키마를 구축한다. Enum·테이블·RLS 헬퍼·RPC를 마이그레이션하고 타입을 재생성해 백엔드 연결의 토대를 만든다.
> **기능 ID**: (공통 기반)
> **예상 기간**: ~1.5주 (2026-07-12 ~ 2026-07-22)
> **산출물**: 마이그레이션 완료, `lib/database.types.ts` 동기화, RLS·RPC 적용

### DB 스키마 마이그레이션 — Enum & 테이블 (담당: 백엔드/DB)

- [ ] Enum 6종 생성: `app_role`, `event_role`, `event_status`, `rsvp_status`, `passenger_status`, `payment_status`
- [ ] `profiles` 확장: `app_role` 컬럼 추가(DEFAULT `'user'`)
- [ ] 테이블 9종 생성: `events`, `event_participants`, `event_invites`, `announcements`, `carpools`, `carpool_passengers`, `expenses`, `expense_shares`
- [ ] 제약 조건: `event_participants` UNIQUE(event_id,user_id), `carpool_passengers` UNIQUE(carpool_id,user_id), `expense_shares` UNIQUE(expense_id,user_id), `carpools.total_seats` CHECK(>0), `event_invites.token` UNIQUE
- [ ] FK ON DELETE CASCADE: 하위 테이블(`announcements`,`carpools`,`expenses` 등) → `events`
- [ ] 모든 하위 테이블에 `event_id` 직접 보유 (RLS 단순화 위해)
- 힌트: 확정된 UI 화면을 기준으로 컬럼을 역설계하면 누락이 적다. `mcp__supabase__apply_migration` 사용, 마이그레이션 단위로 분리 적용

### RLS 헬퍼 함수 & 정책 (담당: 백엔드/DB)

- [ ] SECURITY DEFINER 헬퍼: `is_admin()`, `is_event_member(_event_id uuid)`, `is_event_organizer(_event_id uuid)`
- [ ] 전 테이블 RLS 활성화 + anon 접근 차단
- [ ] 정책 본문에서 테이블 직접 조인 금지 → 반드시 헬퍼 함수로 판정 (무한재귀 방지)
- 힌트: 리스크 #1(RLS 무한재귀) 완화. `mcp__supabase__get_advisors` 로 보안 경고 점검

### RPC 함수 (담당: 백엔드/DB)

- [ ] `redeem_invite(token)` — 유효성 검사(만료·max_uses·revoked) → `event_participants` UPSERT(participant) → `use_count++` → `event_id` 반환 (단일 트랜잭션)
- [ ] `get_invite_preview(token)` — 제목·날짜 등 최소 정보만 반환 (전체 이벤트 RLS 우회 금지)
- 힌트: 토큰은 `gen_random_bytes` 충분 길이로 생성. redeem은 RPC 단일 경로만 허용

### 타입 동기화 (담당: 풀스택)

- [ ] `lib/database.types.ts` 재생성 (`mcp__supabase__generate_typescript_types`)
- [ ] Phase 0의 UI 전용 임시 타입(`types/ui.ts`)을 `database.types.ts` 기반으로 정리/교체 준비
- 힌트: 타입 재생성은 마이그레이션마다 필수(리스크 #6). 이후 Phase 4·5에서 import 경로 교체

### 테스트 체크리스트 (검증)

- [ ] `mcp__supabase__list_tables` 로 테이블 9종·Enum·제약 조건 생성 확인
- [ ] `mcp__supabase__get_advisors` 보안 경고 0건(특히 RLS 미적용·재귀)
- [ ] `redeem_invite` / `get_invite_preview` RPC 단위 호출(execute_sql)로 정상 동작·예외(만료·revoked) 확인
- [ ] 타입 재생성 후 `npm run build` 타입 에러 없음

---

## Phase 4 (M4): 백엔드 연결 (이벤트·참여자·초대) ⏳

> **목적**: Phase 1·2에서 만든 UI에 실제 Server Actions/RPC를 연결한다. 이벤트·참여자·초대를 DB와 붙이고 인증 게이트를 결합해 MVP 핵심 경로를 실데이터로 동작시킨다.
> **기능 ID**: F001(이벤트), F003(참여자), F004(초대)
> **예상 기간**: ~1.5주 (2026-07-23 ~ 2026-08-01)
> **산출물**: 이벤트 생성 → 초대 → 참여 → RSVP 실데이터 end-to-end 동작

### 인증 게이트 결합 (담당: 풀스택)

- [ ] `app/(app)/layout.tsx` 에 로그인 확인 게이트 추가(미인증 리다이렉트)
- [ ] `app/(app)/events/[eventId]/layout.tsx` — 멤버십·역할 로드 + 권한별 탭 노출
- [ ] `proxy.ts` 에 `/invite` 경로 인증게이트 예외 추가
- 힌트: Phase 0에서 만든 화면 골격에 게이트만 얹는다. 리스크 #3(미인증 초대↔인증게이트 충돌) 완화

### F001 — 이벤트 CRUD 연결 (담당: 풀스택)

- [ ] 이벤트 생성 Server Action: `events` insert + 생성자를 `event_participants(role='organizer')` 자동 등록
- [ ] 이벤트 수정 Server Action + 입력값 zod 재검증 (클라/서버 공유)
- [ ] 상태 전환 액션: `draft → published → closed/cancelled` (`is_event_organizer` 검증)
- [ ] 대시보드/이벤트 홈 더미 데이터를 실제 쿼리(RSC + server client)로 교체
- 힌트: 참여 이벤트는 `event_participants` 조인, 주최 이벤트는 `events.organizer_id`. UI는 그대로 두고 데이터 소스만 교체

### F003 — RSVP 연결 (담당: 풀스택)

- [ ] RSVP 토글 Server Action: `pending/going/not_going/maybe` + `rsvp_responded_at` 기록
- [ ] 동반 인원(`guest_count`) 저장 + 참여자 집계를 실제 쿼리로 교체
- [ ] 응답 권한(본인) / 조회·관리 권한(주최자) RLS 검증
- 힌트: zustand 낙관적 업데이트 유지하되 서버 응답으로 확정

### F004 — 초대 연결 (담당: 풀스택)

- [ ] 초대 발급/취소 Server Action: 토큰 생성(`gen_random_bytes`), `max_uses`·`expires_at`, `revoked`
- [ ] `app/invite/[token]/page.tsx` — `get_invite_preview(token)` 연결(미인증 허용) + `/auth/login?next=` 복귀
- [ ] "참여하기" → `redeem_invite(token)` 호출 → `/events/[eventId]` 이동
- 힌트: 미리보기는 최소 정보만, 전체 이벤트 RLS 우회 금지. redeem은 RPC 단일 경로

### 테스트 체크리스트 (Playwright MCP)

- [ ] 주최자 로그인 → 이벤트 생성 → 대시보드 실데이터 노출 확인
- [ ] 상태 전환(draft→published) 후 권한별 UI + RLS 동작 검증
- [ ] 미인증 `/invite/[token]` 접근 → 미리보기 → 로그인 → 복귀 → "참여하기" → participant 등록 + `use_count` 증가
- [ ] 참여자 RSVP going → 참여자 탭 실집계 증가 확인
- [ ] 엣지: 만료/소진/revoked 토큰 거부, 재진입 UPSERT 멱등성, 비주최자 수정 차단(RLS)

---

## Phase 5 (M5): 백엔드 연결 (공지·카풀·정산) ⏳

> **목적**: Phase 2에서 만든 공지·카풀·정산 UI에 실제 Server Actions/RPC를 연결한다. 핵심 부가 기능을 실데이터로 동작시킨다.
> **기능 ID**: F002(공지), F005(카풀), F006(정산)
> **예상 기간**: ~1.5주 (2026-08-02 ~ 2026-08-12)
> **산출물**: 공지·카풀·정산 기능 실데이터 동작 완성

### F002 — 공지 연결 (담당: 풀스택)

- [ ] 공지 작성·수정·삭제 Server Action (작성: 주최자 `is_event_organizer` / 조회: 멤버 `is_event_member`)
- [ ] 핀 고정 토글(`announcements.pinned`) + 목록 정렬을 실데이터로 교체
- [ ] 이벤트 홈 공지 미리보기 위젯 실데이터 연결
- 힌트: UI는 Phase 2 그대로, 더미를 실제 쿼리/액션으로 교체

### F005 — 카풀 연결 (담당: 풀스택)

- [ ] 차량 등록 Server Action(본인=운전자) + 목록·잔여석 실데이터 교체
- [ ] 탑승 신청·취소 액션: `carpool_passengers.status`(`requested/cancelled`) + `seats`
- [ ] 확정·거절 액션: 운전자/주최자만 `confirmed/rejected`, 잔여석 = `total_seats - confirmed 합` 집계
- 힌트: 리스크 #4 — 좌석 초과는 운전자 수동 승인으로 회피(자동 선착순 없음)

### F006 — 정산 연결 (담당: 풀스택)

- [ ] 정산 생성 Server Action: `expenses` 생성 + n분의1 분배로 참여자별 `expense_shares` 일괄 생성(단일 액션)
- [ ] 나눗셈 단수(나머지)는 결제자(`payer_id`)에게 귀속, 분배 후 합계 검증
- [ ] 송금 현황 토글: `unpaid → pending → paid` + `paid_at` (주최자 전체 / 참여자 본인)
- 힌트: `total_amount`/`amount` 는 `numeric(12,2)`. 리스크 #5(단수 합계 불일치) 완화. equal 분배만

### 테스트 체크리스트 (Playwright MCP)

- [ ] 주최자 공지 작성 → 멤버 화면 노출, 핀 고정 상단 정렬, 비주최자 작성 차단
- [ ] 차량 등록 → 탑승 신청(requested) → 운전자 확정(confirmed) → 잔여석 감소, 거절 시 미차감
- [ ] 정산 생성 → `expense_shares` 자동 생성, 분배 합계 = 총액, 나머지 결제자 귀속
- [ ] 송금 토글(unpaid→pending→paid) 동작, 주최자 전체 / 참여자 본인 권한 검증
- [ ] 엣지: 잔여석 0 통제, 참여자 0~1명 분배·소수점 경계값

---

## Phase 6: 어드민 대시보드 (UI + 백엔드) ⏳

> **목적**: 서비스 운영자 전용 데스크톱 어드민. UI와 백엔드를 한 번에 구현해 통계·전체 이벤트/유저 관리를 완성한다.
> **기능 ID**: F007(어드민 대시보드)
> **예상 기간**: ~1.5주 (2026-08-13 ~ 2026-08-23)
> **산출물**: 운영자 어드민 완성

### F007 — 통계 대시보드 (담당: 풀스택)

- [ ] `app/admin/layout.tsx` — `is_admin()` 게이트 + 데스크톱 사이드바
- [ ] `app/admin/page.tsx` — 서비스 통계(이벤트/유저/참여 수) 카드 + 실집계 쿼리
- 힌트: 어드민은 데스크톱(1024px+) 반응형. 비관리자 접근은 게이트에서 차단

### F007 — 전체 이벤트 관리 (담당: 풀스택)

- [ ] `app/admin/events/page.tsx` — 전체 이벤트 목록·검색·필터(`table` 컴포넌트)
- [ ] `app/admin/events/[eventId]/page.tsx` — 이벤트 상세 운영 뷰 + 상태 변경
- 힌트: 운영자는 RLS상 전체 이벤트 접근(`is_admin` 정책)

### F007 — 유저·역할 관리 (담당: 풀스택)

- [ ] `app/admin/users/page.tsx` — 전체 유저 목록 + 역할 변경
- [ ] 전역 역할(`profiles.app_role`) 변경 액션 (admin/user)
- 힌트: 리스크 #7 — 전역 `app_role` vs 이벤트 `event_role` 네이밍 일관성 유지

### 테스트 체크리스트 (Playwright MCP)

- [ ] 비관리자(`app_role='user'`)의 `/admin` 접근 차단 검증
- [ ] 관리자 로그인 → 통계 카드 수치 정확성 확인
- [ ] 전체 이벤트 검색·필터·상태 변경 동작 검증
- [ ] 유저 역할 변경(user→admin) 반영 확인
- [ ] 엣지: 자기 자신 역할 강등 등 경계 케이스 처리

---

## 개발 워크플로우

1. **작업 계획** — 코드베이스 현황 파악 후 `ROADMAP.md` 업데이트. 우선순위 작업은 마지막 완료 작업 다음에 삽입
2. **작업 생성** — `/tasks` 디렉토리에 `XXX-description.md` 형식으로 작업 파일 생성. API/비즈니스 로직 작업은 "## 테스트 체크리스트" 섹션(Playwright MCP 시나리오) 필수
3. **작업 구현** — 명세 구현 → API/비즈니스 로직은 Playwright MCP로 E2E 테스트 → 통과 후 다음 단계. 마이그레이션마다 `database.types.ts` 재생성
4. **로드맵 업데이트** — 완료 작업을 ✅, 체크박스를 `[x]` 로 표시

## 비기능 요구사항 (전 Phase 공통)

- **반응형**: 모바일 우선(320px~), 어드민은 데스크톱(1024px+)
- **인증**: Supabase Auth(이메일 + 구글 OAuth), 기존 스타터 흐름 재사용
- **보안**: 전 테이블 RLS 필수, anon 접근 불가, 초대 토큰 `gen_random_bytes`
- **타입 안전성**: `any` 금지, 스키마 변경 시 `lib/database.types.ts` 재생성 필수
- **데이터 페칭**: RSC + server client 우선, 변경은 Server Actions 또는 RPC
- **상태관리**: zustand는 클라이언트 UI 상태(탭·필터·낙관적 RSVP)로만 사용

---

**문서 버전**: v2.0 | **최종 업데이트**: 2026-06-22 | **진행 상황**: 전체 예정 (0/7 Phase 완료)
