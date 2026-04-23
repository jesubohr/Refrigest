import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Enforce core/ boundary — no framework imports allowed inside src/core/
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react/*', 'react-dom', 'react-dom/*'],
              message:
                'src/core/ must be framework-agnostic. Move this import to lib/ or components/.',
            },
            {
              group: ['next', 'next/*'],
              message:
                'src/core/ must be framework-agnostic. Move this import to lib/ or app/.',
            },
            {
              group: ['dexie', 'dexie/*'],
              message:
                'src/core/ must be framework-agnostic. Move this import to lib/dexie/.',
            },
          ],
        },
      ],
    },
    files: ['src/core/**/*.ts', 'src/core/**/*.tsx'],
  },
]

export default eslintConfig
