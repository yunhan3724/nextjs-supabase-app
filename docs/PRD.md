# 모임 이벤트 관리 웹 MVP — PRD

**버전**: v1.0 | **작성일**: 2026-06-22 | **상태**: 확정

---

## 1. 개요

| 항목      | 내용                                                                                                            |
| --------- | --------------------------------------------------------------------------------------------------------------- |
| 제품명    | 모임 이벤트 관리 웹 (가칭)                                                                                      |
| 목적      | 일회성 모임(수영·헬스·친구 모임 등) 주최자의 운영 부담을 줄이고, 참여자가 한 링크로 모든 정보를 확인하도록 한다 |
| 타입      | 모바일 우선 웹 (PWA 미적용, 반응형)                                                                             |
| 기술 스택 | Next.js 15 App Router + Supabase (Postgres + Auth + RLS) + TypeScript 5                                         |
| 기반      | 공식 Supabase Next.js 스타터 (인증 흐름·3종 Supabase 클라이언트·proxy.ts 인증게이트 구현 완료)                  |

---

## 2. 문제 정의

수영·헬스·친구 모임의 주최자는 아래 업무를 **카카오톡 + 엑셀 + 머릿속**으로 분산 처리한다.

- 일정·장소 공지 → 단체 채팅방에 반복 공지
- 참석 여부 확인 → 일일이 물어보거나 이름 체크
- 카풀 조율 → 댓글 + DM으로 수동 매칭
- 정산 → 총무가 계산기 두드리고 개별 알림

이로 인해 주최자는 **모임 준비·운영에 과도한 시간을 소비**하고, 참여자는 **정보가 흩어져 찾기 어렵다**.

---

## 3. 목표 / 비목표

### 목표 (MVP 범위)

- 주최자가 이벤트를 만들고 → 초대 링크로 참여자를 모으고 → 공지·RSVP·카풀·정산을 한 곳에서 관리하는 end-to-end 흐름 완성
- 참여자가 링크 하나로 일정 확인, 참석 응답, 카풀 신청, 정산 확인까지 완료
- 서비스 운영자가 데스크톱 어드민에서 전체 현황 모니터링

### 비목표 (MVP 제외)

- 실결제·송금 연동 (payment_status 수동 토글만)
- 정기/반복 이벤트 (일회성만)
- 실시간(Realtime) 구독
- 푸시·이메일 알림 (인증 메일 제외)
- 정산 고급 분배 (n분의1 equal만, 가중치 분배 제외)
- 이미지 Storage 업로드 (URL 입력 우선)
- 채팅·댓글
- 다국어 (한국어 고정)
- 소프트 삭제·감사 로그

---

## 4. 타깃 사용자 & 역할

### 역할 구조

| 역할                      | 접근 방식         | 주요 화면                             | 특징                                      |
| ------------------------- | ----------------- | ------------------------------------- | ----------------------------------------- |
| **서비스 운영자** (admin) | 데스크톱 `/admin` | 통계 대시보드, 전체 이벤트/유저 관리  | `profiles.app_role = 'admin'`             |
| **주최자** (organizer)    | 모바일 `/(app)`   | 이벤트 생성·관리, 공지·카풀·정산 작성 | `event_participants.role = 'organizer'`   |
| **참여자** (participant)  | 모바일 `/(app)`   | RSVP, 카풀 신청, 정산 확인            | `event_participants.role = 'participant'` |

> 역할 이원화: 전역 역할(`profiles.app_role`)과 이벤트별 역할(`event_participants.role`)을 분리한다. 같은 사람이 A 이벤트는 주최자, B 이벤트는 참여자가 될 수 있다.

### 페르소나 (간략)

**민준 (주최자, 30대)** — 수영 동호회 총무. 매번 참석 체크와 정산이 귀찮다. 링크 하나 보내면 알아서 돌아가길 원한다.

**지은 (참여자, 20대)** — 친구 모임에 가끔 참여. 복잡한 가입 과정 없이 링크 클릭으로 바로 참여하고 싶다.

**운영자 (admin)** — 서비스 전체 현황을 확인하고 문제 발생 시 개입한다.

---

## 5. 핵심 기능 명세

### F001 — 이벤트 관리

| 항목       | 내용                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| **역할**   | 주최자, 운영자                                                                                       |
| **기능**   | 이벤트 생성·수정·상태 변경(draft→published→closed/cancelled), 이벤트 목록(내가 만든 / 내가 참여하는) |
| **페이지** | `/(app)/events/new`, `/(app)/dashboard`, `/(app)/events/[eventId]`                                   |

**이벤트 필드**

- 제목, 설명, 장소명, 장소 주소, 시작 일시(필수), 종료 일시, 최대 참여 인원, 커버 이미지 URL, 상태

---

### F002 — 공지 관리

| 항목       | 내용                                               |
| ---------- | -------------------------------------------------- |
| **역할**   | 작성: 주최자 / 조회: 전체 멤버                     |
| **기능**   | 공지 작성·수정·삭제, 핀 고정(상단 표시), 목록 조회 |
| **페이지** | `/(app)/events/[eventId]/announcements`            |

---

### F003 — 참여자 관리 (RSVP)

| 항목       | 내용                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| **역할**   | 응답: 참여자 본인 / 조회·관리: 주최자                                           |
| **기능**   | RSVP 응답(going/not_going/maybe/pending), 동반 인원 입력, 참여자 목록·현황 집계 |
| **페이지** | `/(app)/events/[eventId]/participants`, `/(app)/events/[eventId]` (홈 미리보기) |

---

### F004 — 초대 링크

| 항목       | 내용                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| **역할**   | 발급: 주최자 / 진입: 미가입자 포함 모두                                                      |
| **기능**   | 초대 링크 발급(토큰 생성), 최대 사용 횟수·만료일 설정, 링크 복사/공유, 링크 취소(revoke)     |
| **페이지** | `/(app)/events/[eventId]/invite`, `/invite/[token]` (공개 진입)                              |
| **RPC**    | `get_invite_preview(token)` — 제목·날짜 최소 정보 반환, `redeem_invite(token)` — 멤버십 획득 |

---

### F005 — 카풀 관리

| 항목       | 내용                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| **역할**   | 차량 등록: 멤버 누구나(본인이 운전자) / 탑승 신청: 멤버 / 확정: 운전자 또는 주최자                                         |
| **기능**   | 차량 등록(출발지·시간·좌석 수), 탑승 신청·취소, 탑승 확정·거절, 잔여 좌석 표시                                             |
| **페이지** | `/(app)/events/[eventId]/carpools`, `/(app)/events/[eventId]/carpools/new`, `/(app)/events/[eventId]/carpools/[carpoolId]` |

> 좌석 초과 신청은 운전자 수동 승인 방식으로 동시성 문제 회피 (자동 선착순 없음)

---

### F006 — 정산 관리

| 항목       | 내용                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| **역할**   | 항목 생성: 주최자 / 송금 현황 업데이트: 주최자(전체) 또는 참여자 본인                                                      |
| **기능**   | 정산 항목 생성(제목·총액·결제자), n분의1 자동 분배 → 참여자별 금액 생성, 송금 현황(unpaid→pending→paid) 토글, 내 정산 요약 |
| **페이지** | `/(app)/events/[eventId]/expenses`, `/(app)/events/[eventId]/expenses/new`, `/(app)/events/[eventId]/expenses/[expenseId]` |

> n분의1 분배는 서버 액션에서 expenses 생성 시 expense_shares를 함께 생성. 단수(나눗셈 나머지)는 결제자에게 귀속.

---

### F007 — 어드민 대시보드

| 항목       | 내용                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------ |
| **역할**   | 서비스 운영자 전용 (is_admin() 게이트)                                                           |
| **기능**   | 서비스 통계(이벤트/유저/참여 수), 전체 이벤트 목록·검색·필터·상태 변경, 전체 유저 목록·역할 변경 |
| **페이지** | `/admin`, `/admin/events`, `/admin/events/[eventId]`, `/admin/users`                             |

---

## 6. 사용자 스토리

```
[주최자] 이벤트를 생성하고 참여자를 초대하고 싶다.
  → 이벤트 생성 폼 작성 → 초대 링크 발급 → 링크 공유

[주최자] 누가 온다고 했는지 한눈에 보고 싶다.
  → 참여자 탭에서 RSVP 현황(going/not_going/maybe/pending) 카드 확인

[주최자] 카풀 조율을 대신해줬으면 한다.
  → 카풀 탭에서 차량 목록·잔여석 확인, 운전자가 탑승 확정

[주최자] 정산을 자동으로 계산해줬으면 한다.
  → 정산 항목 입력 → n분의1 자동 분배 → 송금 현황 체크박스로 추적

[참여자] 초대 링크를 클릭해서 바로 참여하고 싶다.
  → 링크 클릭 → 이벤트 미리보기 → 로그인(구글/이메일) → 참여하기

[참여자] 내 참석 여부를 언제든 바꿀 수 있어야 한다.
  → 이벤트 홈 또는 참여자 탭에서 RSVP 변경

[참여자] 내가 얼마를 내야 하는지 확인하고 싶다.
  → 정산 탭에서 내 분담금·송금 현황 확인

[운영자] 전체 이벤트와 유저 현황을 모니터링하고 싶다.
  → /admin 대시보드에서 통계·목록 확인
```

---

## 7. 화면 & 플로우

### 라우팅 구조

```
app/
  page.tsx                              # 공개 랜딩
  auth/                                 # 인증 (스타터 재사용)
    login/, sign-up/, sign-up-success/
    forgot-password/, update-password/
    error/, confirm/route.ts, oauth/route.ts

  (app)/                                # 인증 필수 모바일 영역
    layout.tsx                          # 로그인 확인 + 모바일 셸
    dashboard/page.tsx                  # 내 이벤트 허브(주최/참여 통합)
    events/
      new/page.tsx                      # 이벤트 생성
      [eventId]/
        layout.tsx                      # 멤버십·역할 로드 + 탭 네비
        page.tsx                        # 이벤트 홈(개요+공지미리보기+내 RSVP)
        announcements/page.tsx          # 공지 목록/작성(주최자)
        participants/page.tsx           # 참여자·RSVP 현황
        carpools/
          page.tsx                      # 카풀 목록 (잔여석 카드)
          new/page.tsx                  # 차량 등록
          [carpoolId]/page.tsx          # 탑승자 신청/관리
        expenses/
          page.tsx                      # 정산 목록 + 내 요약
          new/page.tsx                  # 정산 항목 생성
          [expenseId]/page.tsx          # 분담 상세 + 송금 현황
        invite/page.tsx                 # 초대 링크 발급/공유(주최자)
    profile/page.tsx                    # 내 프로필

  invite/
    [token]/page.tsx                    # 초대 진입 (미인증 허용)

  admin/                                # 운영자 전용 데스크톱
    layout.tsx                          # is_admin() 게이트 + 사이드바
    page.tsx                            # 통계 대시보드
    events/page.tsx                     # 전체 이벤트 관리
    events/[eventId]/page.tsx           # 이벤트 상세 운영 뷰
    users/page.tsx                      # 유저·역할 관리
```

### 참여자 초대 흐름

```
초대 링크 클릭
  ↓
/invite/[token]
  ├─ (미인증) → /auth/login?next=/invite/[token] → 로그인/구글 OAuth → 복귀
  └─ (인증됨) → get_invite_preview(token) 이벤트 미리보기 표시
       ↓
     "참여하기" 클릭 → redeem_invite(token)
       ↓
     /events/[eventId] (이벤트 홈)
```

> `proxy.ts`에 `/invite` 경로 예외 추가 필요 (미인증 접근 허용)

---

## 8. 데이터 요구사항

### Enum 타입 (6종)

| Enum               | 값                                                      |
| ------------------ | ------------------------------------------------------- |
| `app_role`         | `admin` \| `user`                                       |
| `event_role`       | `organizer` \| `participant`                            |
| `event_status`     | `draft` \| `published` \| `closed` \| `cancelled`       |
| `rsvp_status`      | `pending` \| `going` \| `not_going` \| `maybe`          |
| `passenger_status` | `requested` \| `confirmed` \| `rejected` \| `cancelled` |
| `payment_status`   | `unpaid` \| `pending` \| `paid`                         |

### 테이블 (9종)

| 테이블               | 핵심 컬럼                                                                                                                                  | 관계                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| `profiles`           | id, username, full_name, avatar_url, **app_role**(추가), created_at                                                                        | -                           |
| `events`             | id, organizer_id, title, description, location_name, location_address, starts_at(필수), ends_at, status, max_participants, cover_image_url | organizer_id → profiles     |
| `event_participants` | id, event_id, user_id, role, rsvp_status, rsvp_responded_at, guest_count, joined_at                                                        | UNIQUE(event_id, user_id)   |
| `event_invites`      | id, event_id, token(UNIQUE), created_by, max_uses, use_count, expires_at, revoked                                                          | -                           |
| `announcements`      | id, event_id, author_id, title, body, pinned                                                                                               | event_id → events(CASCADE)  |
| `carpools`           | id, event_id, driver_id, departure_place, departure_time, total_seats(CHECK>0), note                                                       | event_id → events(CASCADE)  |
| `carpool_passengers` | id, carpool_id, user_id, status, seats                                                                                                     | UNIQUE(carpool_id, user_id) |
| `expenses`           | id, event_id, created_by, title, total_amount numeric(12,2), payer_id, split_method DEFAULT 'equal'                                        | event_id → events(CASCADE)  |
| `expense_shares`     | id, expense_id, user_id, amount numeric(12,2), payment_status, paid_at                                                                     | UNIQUE(expense_id, user_id) |

> 모든 하위 테이블이 `event_id`를 직접 보유 → RLS 정책 단순화

### RLS 헬퍼 함수 (SECURITY DEFINER)

무한재귀 방지를 위해 정책 본문에서 직접 테이블 조인 금지. 아래 함수로 캡슐화.

```sql
is_admin()                          -- profiles.app_role = 'admin'
is_event_member(_event_id uuid)     -- event_participants에 (event_id, auth.uid()) 존재
is_event_organizer(_event_id uuid)  -- events.organizer_id = auth.uid()
                                    -- 또는 멤버십 role = 'organizer'
```

### RPC

| 함수                        | 역할                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `redeem_invite(token)`      | 유효성 검사 → event_participants UPSERT(participant) → use_count++ → event_id 반환 |
| `get_invite_preview(token)` | 제목·날짜 등 최소 정보만 반환 (전체 이벤트 RLS 우회 금지)                          |

---

## 9. 비기능 요구사항

| 항목            | 요구사항                                                                     |
| --------------- | ---------------------------------------------------------------------------- |
| **반응형**      | 모바일 우선(320px~), 어드민은 데스크톱(1024px+)                              |
| **인증**        | Supabase Auth (이메일 + 구글 OAuth). 기존 스타터 흐름 재사용                 |
| **보안**        | 전 테이블 RLS 필수. anon 접근 불가. 초대 토큰은 `gen_random_bytes` 충분 길이 |
| **타입 안전성** | `any` 타입 사용 금지. 스키마 변경 시 `lib/database.types.ts` 재생성 필수     |
| **코드 규칙**   | TypeScript, 2칸 들여쓰기, camelCase/PascalCase, 한국어 주석                  |
| **데이터 페칭** | RSC + server client 우선. 변경은 Server Actions 또는 RPC                     |
| **상태관리**    | zustand는 클라이언트 UI 상태(탭·필터·낙관적 RSVP)로만 사용                   |
| **성능**        | 초대 RPC는 단일 트랜잭션. 카풀 잔여석은 앱 레벨 계산(뷰 또는 집계)           |

---

## 10. 추가 설치 (기존 스타터 대비)

### shadcn/ui 컴포넌트 (미설치)

`form`, `dialog`, `select`, `tabs`, `avatar`, `table`, `sonner`(toast), `sheet`, `skeleton`, `separator`

기존 재사용: `badge`, `button`, `card`, `checkbox`, `dropdown-menu`, `input`, `label`

### npm 패키지 (미설치)

| 패키지                | 용도                                             |
| --------------------- | ------------------------------------------------ |
| `react-hook-form`     | 폼 상태·검증 핸들링                              |
| `zod`                 | 폼 스키마 + 서버 액션 입력 검증 (클라/서버 공유) |
| `@hookform/resolvers` | RHF ↔ zod 브리지                                 |
| `zustand`             | 클라이언트 UI 상태 관리                          |
| `date-fns`            | 한국 로캘 날짜·시간 포맷                         |

---

## 11. 마일스톤

| 단계                      | 내용                                                                                                                                                              | 산출물                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **M0** 기반 정리·스키마   | tutorial/hero 제거, 랜딩 교체, 라이브러리/shadcn 설치, 전체 테이블+enum+RLS+헬퍼함수+RPC 마이그레이션, database.types.ts 재생성, 라우트 그룹 골격·레이아웃 게이트 | 마이그레이션 완료, 타입 동기화     |
| **M1** 이벤트·참여자 코어 | 이벤트 CRUD·대시보드 목록, 멤버십+RSVP                                                                                                                            | 주최자→이벤트 생성→RSVP end-to-end |
| **M2** 초대 링크          | 초대 발급 UI + RPC + /invite 진입 흐름, proxy.ts /invite 예외                                                                                                     | 링크 클릭→로그인→참여 완전 동작    |
| **M3** 공지·카풀          | 공지 CRUD(핀 포함), 카풀 등록·신청·확정·잔여석                                                                                                                    | 공지·카풀 기능 완성                |
| **M4** 정산               | expenses 생성+n분의1 분배→expense_shares, 송금 현황 토글                                                                                                          | 정산 추적 완성                     |
| **M5** 어드민             | is_admin 게이트, 통계 대시보드, 이벤트/유저 테이블·역할 변경                                                                                                      | 운영자 어드민 완성                 |

> **MVP 최소 데모 경로**: M0 → M1 → M2

---

## 12. 성공 지표

| 지표            | 설명                                                              |
| --------------- | ----------------------------------------------------------------- |
| 주최자 완주율   | 이벤트 생성 → 초대 → 정산까지 완료한 주최자 비율                  |
| RSVP 응답률     | 이벤트당 참여자 중 going/not_going/maybe 응답 비율 (pending 제외) |
| 초대 전환율     | 초대 링크 클릭 → 실제 참여하기(redeem) 완료 비율                  |
| 주최자 재사용률 | 2회 이상 이벤트를 생성한 주최자 비율                              |
| 카풀 매칭률     | 카풀 등록이 있는 이벤트에서 탑승 confirmed 비율                   |

---

## 13. 리스크

| 리스크                                                 | 완화 방안                                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| **RLS 무한재귀** (event_participants↔events 상호 참조) | 모든 판정을 SECURITY DEFINER 헬퍼 함수로 캡슐화. 정책 본문 직접 조인 금지              |
| **초대 토큰 보안** (추측 가능 토큰)                    | `gen_random_bytes` 충분 길이, expires_at/max_uses/revoked 강제, redeem은 RPC 단일 경로 |
| **미인증 초대 ↔ 전역 인증게이트 충돌**                 | proxy.ts에 `/invite` 예외 추가, get_invite_preview는 최소 정보만 반환                  |
| **카풀 좌석 동시성 초과**                              | 확정은 운전자 수동 승인(자동 선착순 없음)으로 경합 회피                                |
| **정산 단수 합계 불일치**                              | 분배 후 합계 검증, 나머지는 결제자 귀속 규칙 고정                                      |
| **타입 동기화 누락** (any 타입 유발)                   | 마이그레이션마다 database.types.ts 재생성을 M0 체크리스트에 고정                       |
| **역할 혼동** (전역 admin vs 이벤트 organizer)         | 네이밍을 app_role / event_role로 명확히 분리, 코드 전반 일관성 유지                    |
