import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**', 'public/**'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    rules: {
      // any 타입 사용 금지 (CLAUDE.md 규칙)
      '@typescript-eslint/no-explicit-any': 'error',

      // 미사용 변수 오류 처리 (언더스코어 prefix 허용)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // 빈 함수 허용 (초기 핸들러 등)
      '@typescript-eslint/no-empty-function': 'warn',

      // console.log 경고 (console.error/warn은 허용)
      'no-console': ['warn', { allow: ['error', 'warn'] }],

      // React import 생략 허용 (React 17+)
      'react/react-in-jsx-scope': 'off',

      // 사용하지 않는 import 경고
      'no-unused-expressions': 'warn',

      // 일관된 타입 import 강제
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
]

export default eslintConfig
