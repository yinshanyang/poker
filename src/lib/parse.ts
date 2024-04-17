import type { Result } from '@/types'

type Expression = [Start, Name, PnL]
type Node = Start | Name | PnL
type Start = { __type: 'START' }
type Name = { __type: 'NAME'; value: string }
type PnL = { __type: 'PNL'; value: number | null }

const START_REGEX = /^(( ?)+((\d+\))|(\d+\.)|\*|\-) ?)+/
const NAME_REGEX = /([a-zA-Z][_\- ]?)+/
const PNL_REGEX = /\(+(\+|\-)?((\d|,| )?)+(\)?)+/
const PNL_VALUE_REGEX = /[\d,\+\- ]+/

export const parse = (str: string): Result[] =>
  str
    .split('\n')
    .map(getNodes)
    .map(getExpression)
    .filter(isValidExpression)
    .map(([_, name, pnl]): Result => ({ name: name.value, total: pnl.value }))

function isValidExpression(
  expression: Expression | null
): expression is Expression {
  return !!expression
}

function getNodes(line: string): Node[] {
  const nodes: Node[] = []
  const start = line.match(START_REGEX)
  const name = line.match(NAME_REGEX)
  const pnl = line.match(PNL_REGEX)
  !!start && nodes.push({ __type: 'START' })
  !!name && nodes.push({ __type: 'NAME', value: name[0].trim() })
  !!pnl &&
    nodes.push({
      __type: 'PNL',
      value: ((pnl) => {
        const match = pnl[0].match(PNL_VALUE_REGEX)
        return !!match
          ? isNaN(+match[0].replace(/[, ]/g, ''))
            ? null
            : +match[0].replace(/[, ]/g, '')
          : null
      })(pnl),
    })
  return nodes
}

function getExpression(nodes: Node[]): Expression | null {
  const start = nodes.find((node): node is Start => node.__type === 'START')
  const name = nodes.find((node): node is Name => node.__type === 'NAME')
  const pnl = nodes.find((node): node is PnL => node.__type === 'PNL')
  return !!start && !!name && !!pnl ? [start, name, pnl] : null
}
