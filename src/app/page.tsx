'use client'
import { useState } from 'react'
import { parse } from '@/lib/parse'

import type { ChangeEventHandler } from 'react'
import type { Result } from '@/types'

const Home = () => {
  const [value, setValue] = useState<string>('')
  const [results, setResults] = useState<Result[]>([])
  const placeholder = `
Paste results here…

For example:
1. John 1,1,1 (-50)
2. Andy 1 (+100)
3. Simon 1,2 (-50)
  `
  const delta = results
    .map(({ total }) => total)
    .reduce((memo, d) => memo! + d!, 0)

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (evt) => {
    setValue(evt.currentTarget.value)
    setResults(parse(evt.currentTarget.value))
  }

  return (
    <div className="absolute top-0 bottom-0 right-0 left-0 p-4 flex flex-col gap-4 md:flex-row">
      <div className="w-full h-full">
        <textarea
          rows={3}
          className="w-full h-full text-foreground bg-foreground/10 bg-opacity-10 p-4 rounded resize-none border border-foreground/20 outline-none"
          onChange={handleChange}
          placeholder={placeholder.trim()}
        />
      </div>

      {results.length > 0 && (
        <div className="w-full h-full">
          <table className="w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold sm:pl-0"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-right text-sm font-semibold text-foreground"
                >
                  💰 | 💸
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map(({ name, total }, index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-foreground sm:pl-0">
                    {name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-foreground text-right opacity-50">
                    {total! > 0 && '+'}
                    {total}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold sm:pl-0"
              >
                Total
                {delta! === 0 && ': okay'}
                {delta! < 0 && ': losers lose less'}
                {delta! > 0 && ': winners win less'}
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-right text-sm font-mono font-semibold text-foreground"
              >
                {delta! > 0 && '+'}
                {delta}
              </th>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

export default Home
