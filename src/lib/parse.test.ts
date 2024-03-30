import assert from 'node:assert'
import { describe, it } from 'node:test'

import type { Result } from '@/types'
import { parse } from './parse'

describe('lib/parse', () => {
  it('should handle empty string', () => {
    const actual = parse('hello')
    const expected: Result[] = []
    assert.deepEqual(actual, expected)
  })

  it('should handle valid input: (+100), (-100)', () => {
    const actual = parse(`
      1. magic (+100)
      2. ultra (-100)
    `)
    const expected = [
      { name: 'magic', total: 100 },
      { name: 'ultra', total: -100 },
    ]
    assert.deepEqual(actual, expected)
  })

  it('should handle positives without `+` symbol', () => {
    const actual = parse(`
      1. magic (100)
    `)
    const expected = [{ name: 'magic', total: 100 }]
    assert.deepEqual(actual, expected)
  })

  it('should handle numbers with commas', () => {
    const actual = parse(`
      1. magic (1,000)
    `)
    const expected = [{ name: 'magic', total: 1000 }]
    assert.deepEqual(actual, expected)
  })

  it('should handle entries with buy-ins', () => {
    const actual = parse(`
      1. magic 1,2, 3 (+100)
    `)
    const expected = [{ name: 'magic', total: 100 }]
    assert.deepEqual(actual, expected)
  })

  it('should handle names with spaces', () => {
    const actual = parse(`
      1. magical sunshine unicorn (+100)
    `)
    const expected = [{ name: 'magical sunshine unicorn', total: 100 }]
    assert.deepEqual(actual, expected)
  })

  it('should handle names with spaces and buy-ins', () => {
    const actual = parse(`
      1. magical sunshine unicorn 1, 2, 5 (+100)
    `)
    const expected = [{ name: 'magical sunshine unicorn', total: 100 }]
    assert.deepEqual(actual, expected)
  })

  it('should handle different list styles', () => {
    const actual = parse(`
      - magic (+100)
      * ultra (+100)
      1. unicorn (+100)
      1. magical (+100)
      2. sunshine (+100)
      99. rainbow (+100)
      1) awesome (+100)
      99) possum (+100)
    `)
    const expected = [
      { name: 'magic', total: 100 },
      { name: 'ultra', total: 100 },
      { name: 'unicorn', total: 100 },
      { name: 'magical', total: 100 },
      { name: 'sunshine', total: 100 },
      { name: 'rainbow', total: 100 },
      { name: 'awesome', total: 100 },
      { name: 'possum', total: 100 },
    ]
    assert.deepEqual(actual, expected)
  })

  it('should handle non-PnL lines', () => {
    const actual = parse(`
      This line does not matter
      (neither) does this line
      1234 this is not a PnL line
      -100 is also not a PnL line
      1. magic (+100)
      nor does this line
    `)
    const expected = [{ name: 'magic', total: 100 }]
    assert.deepEqual(actual, expected)
  })

  it('should handle lines without PnL', () => {
    const actual = parse(`
      1. magic (+100)
      2. ultra
    `)
    const expected = [{ name: 'magic', total: 100 }]
    assert.deepEqual(actual, expected)
  })

  it('should handle malformed PnL', () => {
    const actual = parse(`
      1. magic(+100)
      2. ultra (not a number)
      3. magical (+100
      4. sunshine ((+100)
      5. unicorn (+100))
      6. rainbow ((+100))
      7. awesome (+100) with comments at the back
    `)
    const expected = [
      { name: 'magic', total: 100 },
      { name: 'ultra', total: null },
      { name: 'magical', total: 100 },
      { name: 'sunshine', total: 100 },
      { name: 'unicorn', total: 100 },
      { name: 'rainbow', total: 100 },
      { name: 'awesome', total: 100 },
    ]
    assert.deepEqual(actual, expected)
  })
})
