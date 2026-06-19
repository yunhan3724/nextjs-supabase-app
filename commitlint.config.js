/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 새 기능
        'fix', // 버그 수정
        'docs', // 문서 변경
        'style', // 포매팅, 세미콜론 등 (코드 변경 없음)
        'refactor', // 리팩토링
        'test', // 테스트 추가/수정
        'chore', // 빌드, 설정 변경
        'perf', // 성능 개선
        'ci', // CI 설정 변경
        'revert', // 커밋 되돌리기
      ],
    ],
    'subject-max-length': [2, 'always', 100],
    'subject-case': [0], // 한국어 커밋 메시지 허용
  },
}

export default config
