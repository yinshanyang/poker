import type { Result } from '@/types'

// const regex = /^(\d+\))|^(\d+\.)|^(\-)|^(\*)/
const regex = /^((\d+\))|(\d+\.)|(\-)|(\*))/g

export const parse = (str: string): Result[] => {
  const lines = str.split('\n')
  return lines
    .map((line) => line.trim())
    .filter((line) => line.match(regex))
    .filter((line) => line.match(/\(/))
    .map((line) => {
      const [first, ...rest] = line.split('(')
      const name = first
        .replace(regex, '')
        .trim()
        .replace(regex, '')
        .trim()
        .split(/\d/)[0]
        .trim()
      const total = rest
        .join('')
        .split(')')[0]
        .replaceAll('(', '')
        .replaceAll(')', '')
        .replaceAll(',', '')
      return {
        name,
        total: total === '' ? null : isNaN(+total) ? null : +total,
      }
    })
}
