'use client'

import { ComputeEngine } from '@cortex-js/compute-engine'
import { MathField } from './MathField'
import { parse } from '../lib/algebra/parseFromJson'
import { useEffect, useRef, useState } from 'react'
import { print } from '../lib/algebra/print'
import { ExplorationMap, explore } from '../lib/algebra/explore'
import { replaceSubtractNegate } from '../lib/algebra/replaceSubtractNegate'
import { FaIcon } from './FaIcon'
import { faCircleCheck, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { evaluate } from '../lib/algebra/eval'

type Result =
  | 'empty'
  | 'error'
  | 'match'
  | 'contain'
  | 'hm'
  | 'finish'
  | 'done'
  | 'loading'
  | 'toofast'

export function App() {
  const ce = new ComputeEngine()

  const [description, setDescription] = useState(
    'Berechne den Term in fortlaufender Rechnung. Achte auf einen nachvollziehbaren Rechenweg.'
  )

  const [edit, setEdit] = useState(false)

  const [list, setList] = useState<string[]>([
    '263 - 123 + 47 + 190 - 57 - 20',
    //'191 - (2 \\cdot (29 + 6)-50)\\cdot 8',
    //'((5 \\cdot 6 + 14) \\div 4 + 289 - (38+29))+52',
  ])

  const [isComplete, setIsComplete] = useState(false)

  const [result, setResult] = useState<Result>('loading')

  const currentValue = useRef('')
  const currentMap = useRef<ExplorationMap>({
    map: {},
    start: { type: 'null', children: [] },
  })
  const currentDistance = useRef(-1)

  useEffect(() => {
    if (result == 'loading') {
      const input = replaceSubtractNegate(
        parse(
          ce.parse(list[list.length - 1], {
            canonical: false,
          }).json
        )
      )
      console.log('input', print(input))
      void (async () => {
        currentMap.current = await explore(input, 9, 10)
        setResult('empty')
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  return (
    <div className="h-full flex flex-col">
      <div className="grow-0 bg-gray-100 flex justify-between items-baseline pb-1">
        <div className="flex items-baseline">
          <h1 className="text-xl text-bold my-2 ml-3">TERMinator</h1>
          <a href="/" className="ml-4 underline ">
            zurück
          </a>
        </div>
        <div className="mr-3">
          {edit ? (
            <button
              className="px-2 py-1 rounded bg-green-200 hover:bg-green-300 disabled:cursor-not-allowed"
              disabled={result !== 'finish'}
              onClick={() => {
                setEdit(false)
                setResult('loading')
              }}
            >
              Änderungen übernehmen
            </button>
          ) : (
            <button
              className="px-2 py-1 rounded bg-pink-300 hover:bg-pink-400"
              onClick={() => {
                setEdit(true)
                setList((list) => [list[0]])
                setResult('finish')
              }}
            >
              Aufgabe überarbeiten
            </button>
          )}
        </div>
      </div>
      <div className="grow shrink overflow-auto">
        <div className="mx-auto max-w-[600px] mt-7 px-4 mb-20">
          {edit ? (
            <>
              <p>
                <textarea
                  className="w-full h-24 border-2"
                  onChange={(e) => {
                    setDescription(e.target.value)
                  }}
                >
                  {description}
                </textarea>
              </p>
              <div className="text-3xl border-2 rounded">
                <MathField
                  value={list[0]}
                  onChange={(latex) => {
                    try {
                      const json = ce.parse(latex, {
                        canonical: false,
                      }).json
                      //console.log(json)
                      const algebraNode = replaceSubtractNegate(parse(json))
                      //console.log(algebraNode)
                      if (algebraNode.type == 'null') {
                        setResult('empty')
                        return
                      }
                      setResult('finish')
                      setList([latex])
                    } catch (e) {
                      setResult('error')
                    }
                  }}
                />
              </div>
              {result == 'empty' && <div>Bitte Term eingeben</div>}
              {result == 'error' && <div>Fehler</div>}
            </>
          ) : (
            <>
              <p className="mb-3 text-xl mt-8">{description}</p>
              {list.map((el, i) => (
                <p className="text-3xl my-6" key={i + list[0]}>
                  <MathField readonly value={`${i > 0 ? '=' : ''} ${el}`} />
                </p>
              ))}
              {result !== 'done' && result !== 'loading' && (
                <div className="mt-4 flex w-full flex-row items-baseline">
                  <div
                    className="text-3xl"
                    style={{ fontFamily: 'KaTeX Main' }}
                  >
                    =
                  </div>
                  <div className="grow ml-3">
                    <div className="border-2 rounded text-3xl">
                      <MathField
                        key={list.length}
                        onChange={(latex) => {
                          try {
                            const json = ce.parse(latex, {
                              canonical: false,
                            }).json
                            //console.log(json)
                            const algebraNode = replaceSubtractNegate(
                              parse(json)
                            )
                            //console.log(algebraNode)
                            if (algebraNode.type == 'null') {
                              setResult('empty')
                              return
                            }
                            const cur = print(algebraNode)
                            console.log(cur)
                            const keys = Object.keys(currentMap.current.map)
                            if (keys.includes(cur)) {
                              currentValue.current = latex
                              currentDistance.current =
                                currentMap.current.map[cur].distance
                              if (algebraNode.type == 'nat') {
                                setResult('finish')
                              } else {
                                setResult('match')
                              }
                            } else if (
                              evaluate(algebraNode) ==
                              evaluate(currentMap.current.start)
                            ) {
                              currentValue.current = latex
                              setResult('toofast')
                              setIsComplete(algebraNode.type == 'nat')
                            } else if (keys.some((key) => key.includes(cur))) {
                              const matches = keys.filter((key) =>
                                key.includes(cur)
                              )
                              console.log(matches)
                              currentDistance.current = Math.min(
                                ...matches.map(
                                  (match) =>
                                    currentMap.current.map[match].distance
                                )
                              )
                              setResult('contain')
                            } else {
                              setResult('hm')
                            }
                          } catch (e) {
                            setResult('error')
                          }
                        }}
                        onEnter={() => {
                          if (result == 'finish') {
                            setList((list) => [...list, currentValue.current])
                            setResult('done')
                            window.mathVirtualKeyboard.hide()
                          }
                          if (result == 'match') {
                            setList((list) => [...list, currentValue.current])
                            setResult('loading')
                          }
                        }}
                      />
                    </div>
                    <div className="mt-2 ml-1.5">
                      {result == 'empty' ? (
                        <span className="italic">Gib deinen Rechenweg ein</span>
                      ) : result == 'error' ? (
                        <span className="text-orange-500">
                          Eingabe unvollständig oder fehlerhaft. Mögliche
                          Gründe: fehlenden Zahlen, unbekannten Zeichen,
                          Klammern nicht vollständig
                        </span>
                      ) : result == 'match' ? (
                        <div className="flex justify-between items-baseline">
                          <span className="text-green-600">
                            {renderFeedback()}
                          </span>
                          <button
                            className="px-2 py-1 rounded bg-green-200 hover:bg-green-300 ml-3 inline-block"
                            onClick={() => {
                              setList((list) => [...list, currentValue.current])
                              setResult('loading')
                            }}
                          >
                            Weiter
                          </button>
                        </div>
                      ) : result == 'finish' ? (
                        <div className="flex justify-between items-baseline">
                          <span className="text-green-600">
                            {renderFeedback()}
                          </span>
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
                      ) : result == 'toofast' ? (
                        <span className="text-blue-500">
                          Der Term ist gleichwertig, allerdings konnte der
                          Rechenweg nicht nachvollzogen werden. Ergänze einen
                          Zwischenschritt oder{' '}
                          <button
                            className="underline text-gray-700 hover:text-black"
                            onClick={() => {
                              setList((list) => [...list, currentValue.current])
                              setResult(isComplete ? 'done' : 'loading')
                            }}
                          >
                            machen trotzdem weiter.
                          </button>
                        </span>
                      ) : result == 'hm' ? (
                        <span className="italic">
                          Hm, das passt noch nicht. Mögliche Gründe:
                          Rechenfehler, Term unvollständig
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
              {result == 'done' && (
                <div className="text-green-500 ml-4 text-xl -mt-3">
                  <FaIcon
                    icon={faCircleCheck}
                    className="mr-3 inline-block -mb-0.5"
                  />{' '}
                  abgeschlossen
                </div>
              )}
              {result == 'loading' && (
                <div className="text-gray-200 ml-4 text-xl -mt-3">
                  <FaIcon icon={faSpinner} className="animate-spin" />
                </div>
              )}
              {['match', 'contain', 'finish'].includes(result) && (
                <div className="mt-16 text-gray-600 absolute top-0 right-3 text-xs">
                  Distanz: {currentDistance.current} / 10
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )

  function renderFeedback() {
    if (currentDistance.current < 3) {
      return 'Stabil!'
    } else if (currentDistance.current > 6) {
      return 'Clever!'
    } else {
      return 'Super!'
    }
  }
}
