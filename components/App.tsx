'use client'

import { ComputeEngine } from '@cortex-js/compute-engine'
import { MathField } from './MathField'
import { parse } from '../lib/algebra/parseFromJson'
import { useState } from 'react'

type Result = 'empty' | 'error' | 'ok'
export function App() {
  const ce = new ComputeEngine()

  const [result, setResult] = useState<Result>('empty')

  return (
    <div className="h-full flex flex-col">
      <div className="grow-0 bg-gray-100 flex justify-between items-baseline pb-1">
        <div>
          <h1 className="text-xl text-bold my-2 ml-3">TERMinator</h1>
        </div>
        <div className="mr-3">
          <a
            href="#"
            className="text-gray-700 hover:text-black underline hidden"
          >
            eigene Aufgabe erstellen
          </a>
        </div>
      </div>
      <div className="grow shrink overflow-auto">
        <div className="mx-auto max-w-[600px] mt-7 px-4 mb-20">
          <p className="mb-3 text-xl mt-20">
            Berechne den Term in fortlaufender Rechnung. Beachte die Reihenfolge
            der Rechenoperationen.
          </p>
          <p className="text-3xl my-6">
            <MathField readonly value="34 + 33 \cdot 2 + 345" />
          </p>
          <div className="mt-4 flex w-full flex-row items-baseline">
            <div className="text-3xl">=</div>
            <div className="grow ml-3">
              <div className="border-2 rounded text-3xl">
                <MathField
                  onChange={(latex) => {
                    try {
                      const json = ce.parse(latex, { canonical: false }).json
                      const algebraNode = parse(json)
                      console.log(json, algebraNode)
                      if (algebraNode.type == 'null') {
                        setResult('empty')
                        return
                      }
                      setResult('ok')
                    } catch (e) {
                      setResult('error')
                    }
                  }}
                />
              </div>
              <div className="mt-2 ml-1.5">
                {result == 'empty' ? (
                  <span className="text-blue-500 italic">
                    Warte auf deine Eingabe
                  </span>
                ) : result == 'error' ? (
                  <span className="text-red-500">
                    Bitte Eingabe vervollständigen
                  </span>
                ) : result == 'ok' ? (
                  'OK, TODO'
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-3xl"></div>
      </div>
    </div>
  )
}
