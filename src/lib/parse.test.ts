import assert from 'node:assert'
import { describe, it } from 'node:test'

import type { Result } from '../types'
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
      3. magical unicorn (+100)
    `)
    const expected = [
      { name: 'magic', total: 100 },
      { name: 'ultra', total: -100 },
      { name: 'magical unicorn', total: 100 },
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
      1. sunshine 100,200,300 (+100)
    `)
    const expected = [
      { name: 'magic', total: 100 },
      { name: 'sunshine', total: 100 },
    ]
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
      - dash (+100)
      - dash_negative (-100)
      * asterisk (+100)
      1. ordered-list_one (+100)
      1. ordered-list_repeat (+100)
      2. ordered-list_two (+100)
      99. ordered-list_ninety-nine (+100)
      1) ordered-list-parenthesis_one (+100)
      99) ordered-list-parenthesis_ninety-nine (+100)
    `)
    const expected = [
      { name: 'dash', total: 100 },
      { name: 'dash_negative', total: -100 },
      { name: 'asterisk', total: 100 },
      { name: 'ordered-list_one', total: 100 },
      { name: 'ordered-list_repeat', total: 100 },
      { name: 'ordered-list_two', total: 100 },
      { name: 'ordered-list_ninety-nine', total: 100 },
      { name: 'ordered-list-parenthesis_one', total: 100 },
      { name: 'ordered-list-parenthesis_ninety-nine', total: 100 },
    ]
    assert.deepEqual(actual, expected)
  })

  it('should handle non-PnL lines', () => {
    const actual = parse(`
      Thur 7-12.30am I host 1/2 (cap buy in $1200), who can play:
      This line does not matter
      (neither) does this line
      This line (doesn’t matter)
      This-1 line doesn’t matter (really)
      1234 this is not a PnL line
      -100 is also not a PnL line
      1. magic (+100)
      nor does this line
      * this almost looks like a PnL line
      99. this also looks like a PnL line
    `)
    const expected = [{ name: 'magic', total: 100 }]
    assert.deepEqual(actual, expected)
  })

  it('should handle PnL === 0', () => {
    const actual = parse(`
      1. magic (0)
      2. ultra (+0)
      3. sunshine (-0)
    `)
    const expected = [
      { name: 'magic', total: 0 },
      { name: 'ultra', total: 0 },
      { name: 'sunshine', total: 0 },
    ]
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

  it('should handle malformed names', () => {
    const actual = parse(`
      1.magic (+100)
      2)ultra (+100)
      -magical (+100)
      *sunshine (+100)
      5)5)unicorn (+100)
      5) 5) rainbow (+100)
      5.5.awesome (+100)
      5. 5. possum (+100)
    `)
    const expected = [
      { name: 'magic', total: 100 },
      { name: 'ultra', total: 100 },
      { name: 'magical', total: 100 },
      { name: 'sunshine', total: 100 },
      { name: 'unicorn', total: 100 },
      { name: 'rainbow', total: 100 },
      { name: 'awesome', total: 100 },
      { name: 'possum', total: 100 },
    ]
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
      8. possum ()
    `)
    const expected = [
      { name: 'magic', total: 100 },
      { name: 'ultra', total: null },
      { name: 'magical', total: 100 },
      { name: 'sunshine', total: 100 },
      { name: 'unicorn', total: 100 },
      { name: 'rainbow', total: 100 },
      { name: 'awesome', total: 100 },
      { name: 'possum', total: null },
    ]
    assert.deepEqual(actual, expected)
  })
})
