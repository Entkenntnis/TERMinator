'use client'

import { ComputeEngine } from '@cortex-js/compute-engine'
import { MathField } from './MathField'
import { parse } from '../lib/algebra/parseFromJson'
import { useRef, useState } from 'react'
import { print } from '../lib/algebra/print'
import { explore } from '../lib/algebra/explore'

type Result = 'empty' | 'error' | 'match' | 'contain' | 'hm' | 'finish' | 'done'
export function App() {
  const ce = new ComputeEngine()

  const [list, setList] = useState<string[]>(['34 + 33 \\cdot 2 + 345'])

  const [result, setResult] = useState<Result>('empty')

  const currentValue = useRef('')

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
          <p className="mb-3 text-xl mt-8">
            Berechne den Term in fortlaufender Rechnung. Achte auf einen
            nachvollziehbaren Rechenweg.
          </p>
          {list.map((el, i) => (
            <p className="text-3xl my-6" key={i}>
              <MathField readonly value={`${i > 0 ? '=' : ''} ${el}`} />
            </p>
          ))}
          {result !== 'done' && (
            <div className="mt-4 flex w-full flex-row items-baseline">
              <div className="text-3xl" style={{ fontFamily: 'KaTeX Main' }}>
                =
              </div>
              <div className="grow ml-3">
                <div className="border-2 rounded text-3xl">
                  <MathField
                    key={list.length}
                    onChange={(latex) => {
                      try {
                        const json = ce.parse(latex, { canonical: false }).json
                        console.log(json)
                        const algebraNode = parse(json)
                        console.log(algebraNode)
                        if (algebraNode.type == 'null') {
                          setResult('empty')
                          return
                        }
                        const cur = print(algebraNode)
                        const keys = Object.keys(
                          explore(
                            parse(
                              ce.parse(list[list.length - 1], {
                                canonical: false,
                              }).json
                            ),
                            4
                          ).map
                        )
                        console.log(keys)
                        console.log(cur, keys[0])
                        if (keys.includes(cur)) {
                          currentValue.current = latex
                          if (algebraNode.type == 'nat') {
                            setResult('finish')
                          } else {
                            setResult('match')
                          }
                        } else if (keys.some((key) => key.includes(cur))) {
                          setResult('contain')
                        } else {
                          setResult('hm')
                        }
                      } catch (e) {
                        setResult('error')
                      }
                    }}
                  />
                </div>
                <div className="mt-2 ml-1.5">
                  {result == 'empty' ? (
                    <span className="italic">Gib deinen Rechenweg ein</span>
                  ) : result == 'error' ? (
                    <span className="text-orange-500">
                      Eingabe unvollständig oder fehlerhaft
                    </span>
                  ) : result == 'match' ? (
                    <div className="flex justify-between items-baseline">
                      <span className="text-green-600">Super!</span>
                      <button
                        className="px-2 py-1 rounded bg-green-200 hover:bg-green-300 ml-3 inline-block"
                        onClick={() => {
                          setList((list) => [...list, currentValue.current])
                        }}
                      >
                        Zum nächsten Zwischenschritt
                      </button>
                    </div>
                  ) : result == 'finish' ? (
                    <div className="flex justify-between items-baseline">
                      <span className="text-green-600">Super!</span>
                      <button
                        className="px-2 py-1 rounded bg-green-200 hover:bg-green-300 ml-3 inline-block"
                        onClick={() => {
                          setList((list) => [...list, currentValue.current])
                          setResult('done')
                        }}
                      >
                        Aufgabe abschließen
                      </button>
                    </div>
                  ) : result == 'contain' ? (
                    <span className="text-green-600">
                      Sieht gut aus, weiter so!
                    </span>
                  ) : result == 'hm' ? (
                    <span className="italic">Hm, das passt noch nicht</span>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-3xl"></div>
      </div>
    </div>
  )
}
