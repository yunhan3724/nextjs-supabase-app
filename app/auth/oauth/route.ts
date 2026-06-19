import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

/**
 * Google OAuth 콜백 Route Handler
 *
 * signInWithOAuth (PKCE 흐름)이 완료되면 Supabase가
 * 이 경로로 ?code=... 파라미터를 전달합니다.
 * 서버 클라이언트로 코드를 세션으로 교환한 뒤 지정된 경로로 이동합니다.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  // next 파라미터가 있으면 해당 경로로, 없으면 보호 페이지로
  const next = searchParams.get('next') ?? '/protected'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      redirect(next)
    }

    redirect(`/auth/error?error=${encodeURIComponent(error.message)}`)
  }

  redirect(`/auth/error?error=${encodeURIComponent('인증 코드가 없습니다')}`)
}
