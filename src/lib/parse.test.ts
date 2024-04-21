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

  it('should handle valid expression, [Start, Name, PnL]', () => {
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

  it('should handle numbers with commas and spaces', () => {
    const actual = parse(`
      1. thousand-comma (1,000)
      1. million-comma (1,000,000)
      1. thousand-space (1 000)
      1. million-space (1 000 000)
    `)
    const expected = [
      { name: 'thousand-comma', total: 1_000 },
      { name: 'million-comma', total: 1_000_000 },
      { name: 'thousand-space', total: 1_000 },
      { name: 'million-space', total: 1_000_000 },
    ]
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
      1. ultra magical sunshine unicorn 1, 2, 5 (+100)
      1. super ultra magical sunshine unicorn 1,2,5 (+100)
    `)
    const expected = [
      { name: 'magical sunshine unicorn', total: 100 },
      { name: 'ultra magical sunshine unicorn', total: 100 },
      { name: 'super ultra magical sunshine unicorn', total: 100 },
    ]
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
      This line does not have a START token but has a valid PnL (+100)
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

  it('should handle malformed but valid PnL', () => {
    const actual = parse(`
      1. magic(+100)
      2. magical (+100
      3. sunshine ((+100)
      4. unicorn (+100))
      5. rainbow ((+100))
      6. awesome (+100) with comments at the back
      7. possum ( -100 )
      8. ultra ( 100)
    `)
    const expected = [
      { name: 'magic', total: 100 },
      { name: 'magical', total: 100 },
      { name: 'sunshine', total: 100 },
      { name: 'unicorn', total: 100 },
      { name: 'rainbow', total: 100 },
      { name: 'awesome', total: 100 },
      { name: 'possum', total: -100 },
      { name: 'ultra', total: 100 },
    ]
    assert.deepEqual(actual, expected)
  })

  it('it should ignore malformed and invalid PnL', () => {
    const actual = parse(`
      1. ultra (not a number)
      2. possum ()
      3. plus (+)
      4. minus (-)
      5. magical ( )
      6. sunshine ( + what the fuck is this? - )
    `)
    const expected = []
    assert.deepEqual(actual, expected)
  })

  it('should handle PnL before name', () => {
    const actual = parse(`
      1. (+100) magic
      2. (-100) sunshine
    `)
    const expected = [
      { name: 'magic', total: 100 },
      { name: 'sunshine', total: -100 },
    ]
    assert.deepEqual(actual, expected)
  })

  it('should handle multiple brackets and take the first valid set', () => {
    const actual = parse(`
      1. magic (dealer) (100)
      2. sunshine (-100) (100)
      2. unicorn (100) (dealer)
    `)
    const expected = [
      { name: 'magic', total: 100 },
      { name: 'sunshine', total: -100 },
      { name: 'unicorn', total: 100 },
    ]
    assert.deepEqual(actual, expected)
  })
})
