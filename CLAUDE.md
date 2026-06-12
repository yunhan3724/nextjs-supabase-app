# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 명령어

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```

## 환경 변수

`.env.local` 파일에 다음 값을 설정해야 앱이 정상 동작합니다:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

`lib/utils.ts`의 `hasEnvVars`가 이 값들의 존재 여부를 확인하며, 미설정 시 네비게이션에 경고 배너가 표시되고 proxy 인증 검사가 건너뜁니다.

## 아키텍처

### Supabase 클라이언트 패턴

세 가지 Supabase 클라이언트가 각 실행 컨텍스트에 맞게 분리되어 있습니다:

- **`lib/supabase/client.ts`** — 클라이언트 컴포넌트용 브라우저 클라이언트 (`createBrowserClient`)
- **`lib/supabase/server.ts`** — 서버 컴포넌트 및 Route Handler용 서버 클라이언트 (`createServerClient`, 쿠키 기반)
- **`lib/supabase/proxy.ts`** — Next.js proxy(`proxy.ts`)에서 세션 갱신용 (`updateSession`)

모든 클라이언트는 `lib/database.types.ts`의 `Database` 타입으로 제네릭 타입 안전성을 갖습니다. 서버 클라이언트는 Fluid compute 환경에서의 세션 문제를 방지하기 위해 **항상 함수 내부에서 새로 생성**해야 합니다 (전역 변수 사용 금지).

### 인증 흐름

- **`proxy.ts`** (루트) — Next.js 미들웨어 역할. `updateSession()`으로 세션 갱신 후 미인증 사용자를 `/auth/login`으로 리다이렉트 (단, `/`, `/auth/*` 경로 제외)
- **`app/auth/confirm/route.ts`** — 이메일 OTP 인증 처리 Route Handler
- **`app/protected/`** — 인증된 사용자만 접근 가능한 보호 페이지

### 라우팅 구조

```
app/
  page.tsx                  # 홈 (공개)
  layout.tsx                # 루트 레이아웃
  auth/
    login/                  # 로그인
    sign-up/                # 회원가입
    sign-up-success/        # 가입 완료
    forgot-password/        # 비밀번호 찾기
    update-password/        # 비밀번호 변경
    error/                  # 인증 오류
    confirm/route.ts        # OTP 확인 (Route Handler)
  protected/
    layout.tsx              # 보호 영역 레이아웃 (네비게이션 포함)
    page.tsx                # 사용자 정보 표시
```

### 컴포넌트 구조

- **`components/ui/`** — shadcn/ui 기반 기본 UI 컴포넌트
- **`components/tutorial/`** — 온보딩 튜토리얼 단계 컴포넌트 (개발 완료 후 제거 가능)
- **`components/*.tsx`** — 인증 폼, 버튼 등 기능 컴포넌트

### 타입 생성

Supabase 스키마가 변경되면 TypeScript 타입을 재생성해야 합니다:

```bash
npx supabase gen types typescript --project-id <project-id> > lib/database.types.ts
```

또는 MCP 도구 `mcp__supabase__generate_typescript_types`를 사용할 수 있습니다.
