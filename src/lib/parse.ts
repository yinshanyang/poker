import type { Result } from '@/types'

type Expression = Node[]

type Node = Start | Name | PnL

type Start = { __type: 'START' }
type Name = { __type: 'NAME'; value: string }
type PnL = { __type: 'PNL'; value: number | null }

const START_REGEX = /^((\d+\))|(\d+\.)|(\-)|(\*))/
const NAME_REGEX = /[a-zA-Z_\- ]+/
const PNL_REGEX = /\(+(\+|\-)?((\d|,)?)+(\)?)+/
const PNL_VALUE_REGEX = /(\d|,|\+|\-)+/

export const parse = (str: string): Result[] =>
  str
    .split('\n')
    .map(lex)
    .filter(
      ([node, ...nodes]) =>
        node &&
        node.__type === 'START' &&
        !!nodes.find((node) => node.__type === 'PNL')
    )
    .map((nodes) => {
      const name = nodes.find((node): node is Name => node.__type === 'NAME')
      const pnl = nodes.find((node): node is PnL => node.__type === 'PNL')
      return { name: !!name ? name.value : '', total: !!pnl ? pnl.value : null }
    })

function lex(line: string): Expression {
  let l = line.trim()
  const expression: Node[] = []

  let start = l.match(START_REGEX)
  while (!!start) {
    l = l.replace(START_REGEX, '').trim()
    expression.push({ __type: 'START' })
    start = l.match(START_REGEX)
  }

  const name = l.match(NAME_REGEX)
  if (!!name) {
    l = l.replace(NAME_REGEX, '')
    expression.push({ __type: 'NAME', value: name[0].trim() })
  }

  const pnl = l.match(PNL_REGEX)
  if (!!pnl) {
    l = l.replace(PNL_REGEX, '')
    const valueString = pnl[0].match(PNL_VALUE_REGEX)
    const value = !!valueString ? +valueString[0].replace(/,/g, '') : null
    expression.push({ __type: 'PNL', value })
  }

  return expression
}
