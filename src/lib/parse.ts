import type { Result } from '@/types'

export const parse = (str: string): Result[] => {
  const lines = str.split('\n')
  return lines
    .map((line) => line.trim())
    .filter((line) => line.match(/^[\d\.\)\-\*]+/))
    .filter((line) => line.match(/\(/))
    .map((line) => {
      const [first, ...rest] = line.split('(')
      const name = first
        .replace(/^[\d\.\)\-\*\w]+/g, '')
        .trim()
        .split(/\d/)[0]
        .trim()
      const total =
        +rest
          .join('')
          .split(')')[0]
          .replaceAll('(', '')
          .replaceAll(')', '')
          .replaceAll(',', '') || null
      return { name, total }
    })
}
