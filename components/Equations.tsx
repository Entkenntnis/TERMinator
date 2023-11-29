'use client'

import { MathField } from './MathField'
import { ComputeEngine } from '@cortex-js/compute-engine'
import { useRef, useState } from 'react'
import { FaIcon } from './FaIcon'
import {
  faCircleCheck,
  faPlay,
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons'
import { MathField2 } from './MathField2'
import { Expression } from '../types/mathlive/mathfield-element'
import { Action, findActions } from '../lib/equations'

type Mode = 'done' | 'input' | 'choose'
type InputState =
  | 'error'
  | 'ok'
  | 'empty'
  | 'var-mismatch'
  | 'left-mismatch'
  | 'right-mismatch'

export function Equations() {
  const ce = new ComputeEngine()

  function safeParse(latex: string) {
    return ce.parse(latex.replaceAll('{,}', '.'))
  }
  window.MathfieldElement.decimalSeparator = ','
  const [description, setDescription] = useState(
    'Löse die Gleichung und bestimme die Lösungsmenge.'
  )
  const [edit, setEdit] = useState(false)

  const [mode, setMode] = useState<Mode>('choose')
  const [inputState, setInputState] = useState<InputState>('empty')

  const [list, setList] = useState<string[]>(['4x + 3 = 11'])
  const [actions, setActions] = useState<Action[]>([])

  const [solution, setSolution] = useState('')

  const variableSymbol = Array.from(
    extractSymbols(safeParse(list[list.length - 1]).json).values()
  )[0]

  const [refLeft, setRefLeft] = useState('')
  const [refRight, setRefRight] = useState('')

  const currentLatex = useRef('')

  let options: Action[] = []

  if (mode == 'choose') {
    //console.log('regen choices', JSON.stringify(list))
    const json = safeParse(list[list.length - 1]).json
    try {
      options = findActions(json, variableSymbol)
      //console.log(options)
    } catch (e) {
      console.log(e)
    }
  }
  const rejectReason = useRef('')

  const [showOverview, setShowOverview] = useState(true)

  if (showOverview) {
    return (
      <div className="flex flex-col">
        <div className="grow-0 bg-gray-100 flex justify-between items-baseline pb-1">
          <div className="flex items-baseline">
            <h1 className="text-xl text-bold my-2 ml-3">Gleichungslöser</h1>
          </div>
          <div className="mr-3">
            <a href="/" className="hover:underline">
              zurück zu Algebra-Prototypen
            </a>
            <button
              className="ml-8 hover:underline"
              onClick={() => {
                setShowOverview(false)
                setEdit(true)
              }}
            >
              eigene Aufgabe erstellen
            </button>
          </div>
        </div>
        <div className="grow shrink overflow-auto">
          <div className="mx-auto max-w-[600px] mt-7 px-4 mb-[500px] [&>h3]:text-lg [&>h3]:font-bold">
            <h3>Serlo 26258: Aufgaben zu linearen Gleichungen</h3>
            {renderExample('x+1=4')}
            {renderExample('2x=8')}
            {renderExample('4x=3x+5')}
            {renderExample('0x=7', 'Problem mit leerer Lösungsmenge')}
            {renderExample('4x+4=3x+3')}
            {renderExample('4x=3x+5')}
            {renderExample('5x-2=x+6')}
            {renderExample('3x=x+5', 'Bruch als Lösung nicht erkannt')}
            {renderExample('2x=4')}
            {renderExample('7x-9=2x+5', 'Bruch als Lösung nicht erkannt')}
            {renderExample(
              '\\frac{1}{12}x - 5 = 3',
              'Umformung mit Bruch nicht möglich'
            )}
            {renderExample('-8x + 5 = -5', 'Bruch als Lösung nicht erkannt')}
            {renderExample('x + 4 = 9x - (5 - x)')}
            {renderExample(
              '\\frac{1}{24} x = 0',
              'Umformung mit Bruch nicht möglich'
            )}
            {renderExample(
              '3(a-4)=1-\\frac15(2-a)',
              'Vereinfachung wird nicht erkannt'
            )}
            {renderExample('3(4x-3)=4(3x-4)', 'Leere Lösungsmenge')}
            {renderExample(
              '3(4x+4)=4(3-4x)',
              'Umformung bei x=0 nicht erkannt'
            )}
          </div>
        </div>
      </div>
    )
  }

  function renderExample(latex: string, warning?: string) {
    return (
      <div className="my-4 flex items-baseline justify-between">
        <div className="text-2xl">
          <MathField readonly key={latex} value={latex} />
        </div>
        <div>
          <span className="text-sm text-yellow-600 mr-3">{warning}</span>
          <button
            className="px-2 py-1 bg-green-200 hover:bg-green-300 rounded"
            onClick={() => {
              setShowOverview(false)
              setList([latex])
              setMode('choose')
              setInputState('empty')
              setActions([])
              setSolution('')
            }}
          >
            <FaIcon icon={faPlay} className="text-sm mr-2" />
            Starten
          </button>
        </div>
      </div>
    )
  }

  const output = `\\begin{align}${list
    .map((line, i) => {
      const parts = line.split('=')
      return `${parts[0]} &= ${parts[1]} && ${
        actions.length > i
          ? actions[i].type == 'simplify'
            ? '&& \\Leftrightarrow'
            : actions[i].latex.startsWith(':')
            ? `&& \\vert ${actions[i].latex}`
            : !actions[i].latex.startsWith('-')
            ? `&& \\vert + ${actions[i].latex}`
            : `&& \\vert ${actions[i].latex}`
          : mode == 'done'
          ? '&& '
          : '&& \\vert \\hspace{0.2cm} \\boxed{\\textcolor{orange}{?}}'
      }`
    })
    .join('\\\\\n')}\\end{align}`

  return (
    <div className="flex flex-col">
      <div className="grow-0 bg-gray-100 flex justify-between items-baseline pb-1">
        <div className="flex items-baseline">
          <h1 className="text-xl text-bold my-2 ml-3">Gleichungslöser</h1>
        </div>
        <div className="mr-3">
          {edit ? (
            <button
              className="px-2 py-1 rounded bg-green-200 hover:bg-green-300 disabled:cursor-not-allowed"
              disabled={mode !== 'done'}
              onClick={() => {
                setEdit(false)
                setMode('choose')
              }}
            >
              Aufgabe testen
            </button>
          ) : (
            <button
              className="px-2 py-1 rounded bg-pink-300 hover:bg-pink-400"
              onClick={() => {
                setShowOverview(true)
                window.mathVirtualKeyboard.hide()
              }}
            >
              Aufgabe schließen
            </button>
          )}
        </div>
      </div>
      <div className="grow shrink overflow-auto">
        <div className="mx-auto max-w-[600px] mt-7 px-4 mb-[500px]">
          {edit ? (
            <>
              <p>
                <textarea
                  className="w-full h-24 border-2"
                  onChange={(e) => {
                    setDescription(e.target.value)
                  }}
                  defaultValue={description}
                ></textarea>
              </p>
              <div className="text-2xl border-2 rounded">
                <MathField2
                  value={list[0]}
                  onChange={(latex) => {
                    try {
                      const input = safeParse(latex)

                      if (!input.isValid) {
                        setInputState('error')
                        setMode('input')
                      } else {
                        const { json } = input
                        const result = validateInput(json)
                        if (result === true) {
                          setInputState('ok')
                          setMode('done')
                          setList([latex])
                          return
                        }
                        rejectReason.current = result
                      }
                      setMode('input')
                      setInputState('error')
                    } catch (e) {
                      setMode('input')
                      setInputState('error')
                    }
                  }}
                />
              </div>
              {inputState == 'error' && <div>{rejectReason.current}</div>}
            </>
          ) : (
            <>
              <p className="mb-3 mt-8 mb-7">{description}</p>

              <div className="text-2xl">
                <MathField readonly key={output} value={output} />
              </div>
              {mode == 'choose' && (
                <div>
                  <p className="border-t-2 pt-4 mt-6"></p>
                  <div className="mt-4 flex justify-around">
                    {options.map((op, i) => {
                      if (op.type == 'simplify') {
                        return (
                          <button
                            className="ml-4 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                            key={i}
                            onClick={() => {
                              setActions((acs) => [...acs, op])
                              setMode('input')
                              setInputState('empty')
                              const parts = list[list.length - 1].split('=')
                              setRefLeft(parts[0])
                              setRefRight(parts[1])
                            }}
                          >
                            Vereinfachen
                          </button>
                        )
                      }
                      if (op.type == 'equiv-append') {
                        return (
                          <button
                            className="ml-4 px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded relative text-2xl"
                            key={i}
                          >
                            <MathField
                              key={op.latex}
                              readonly
                              value={
                                op.latex.startsWith('-') ||
                                op.latex.startsWith(':')
                                  ? op.latex
                                  : `+ ${op.latex}`
                              }
                            />
                            <span
                              className="absolute inset-0 opacity-0"
                              onClick={() => {
                                setActions((acs) => [...acs, op])
                                setMode('input')
                                setInputState('empty')
                                const parts = list[list.length - 1].split('=')
                                setRefLeft(combineRef(parts[0], op))
                                setRefRight(combineRef(parts[1], op))
                              }}
                            ></span>
                          </button>
                        )
                      }
                      if (op.type == 'solution') {
                        return (
                          <button
                            className="ml-4 px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded relative text-2xl"
                            key={i}
                          >
                            <MathField
                              key={op.latex}
                              readonly
                              value={op.latex}
                            />
                            <span
                              className="absolute inset-0 opacity-0"
                              onClick={() => {
                                /*setActions((acs) => [...acs, op])
                                setMode('input')
                                setInputState('empty')
                                const parts = list[list.length - 1].split('=')
                                setRefLeft(combineRef(parts[0], op))
                                setRefRight(combineRef(parts[1], op))*/
                                setMode('done')
                                setSolution(op.latex)
                              }}
                            ></span>
                          </button>
                        )
                      }
                    })}
                  </div>
                </div>
              )}

              {mode == 'input' && (
                <div className="text-2xl flex items-baseline mt-3">
                  <div className="grow">
                    <div className="text-right">
                      <button
                        className="text-sm text-gray-600 hover:text-black mb-2"
                        onClick={() => {
                          setActions((acc) => acc.slice(0, -1))
                          setMode('choose')
                          if (list.length == actions.length + 1) {
                            setList((l) => l.slice(0, -1))
                          }
                        }}
                      >
                        <FaIcon icon={faRotateLeft} /> letzte Auswahl rückgängig
                        machen
                      </button>
                    </div>
                    <div className="border-2 rounded ml-2">
                      <MathField2
                        onChange={(latex) => {
                          try {
                            if (!latex) {
                              setInputState('empty')
                              return
                            }
                            const parsed = safeParse(latex)

                            if (!parsed.isValid) {
                              setInputState('error')
                              return
                            }

                            const symbols = extractSymbols(parsed.json)

                            // console.log(symbols, variableSymbol)
                            if (
                              (!symbols.has(variableSymbol) &&
                                symbols.size > 0) ||
                              symbols.size > 1
                            ) {
                              setInputState('var-mismatch')
                              return
                            }

                            const parts = latex.split('=')

                            if (parts.length < 2) {
                              setInputState('error')
                              return
                            }

                            // TODO!! check if results are fine
                            for (let i = -4; i <= 4; i++) {
                              ce.forget(variableSymbol)
                              ce.assign(variableSymbol, i)

                              if (
                                safeParse(
                                  `( ${refLeft} ) - ( ${parts[0]} )`
                                ).N().isNotZero
                              ) {
                                setInputState('left-mismatch')
                                return
                              }
                              if (
                                safeParse(
                                  `( ${refRight} ) - ( ${parts[1]} )`
                                ).N().isNotZero
                              ) {
                                setInputState('right-mismatch')
                                return
                              }
                            }

                            currentLatex.current = latex
                            setInputState('ok')
                          } catch (e) {
                            setMode('input')
                            setInputState('error')
                          }
                        }}
                        onEnter={() => {
                          if (inputState == 'ok') {
                            setList((list) => [...list, currentLatex.current])
                            setMode('choose')
                          }
                        }}
                      />
                    </div>
                    <div className="text-base ml-3 mt-2">
                      {inputState == 'empty' && <span>Warte auf Eingabe</span>}
                      {inputState == 'error' && (
                        <span>Fehler bei der Eingabe</span>
                      )}
                      {inputState == 'var-mismatch' && (
                        <span>Variablen passen nicht</span>
                      )}
                      {inputState == 'left-mismatch' && (
                        <span>
                          Term auf der linken Seite der Gleichung ist nicht
                          passend
                        </span>
                      )}
                      {inputState == 'right-mismatch' && (
                        <span>
                          Term auf der rechten Seite der Gleichung ist nicht
                          passend
                        </span>
                      )}
                      {inputState == 'ok' && (
                        <div className="flex justify-between items-baseline">
                          <span className="text-green-600">Super!</span>
                          <button
                            className="px-2 py-1 rounded bg-green-200 hover:bg-green-300 ml-3 inline-block"
                            onClick={() => {
                              setList((list) => [...list, currentLatex.current])
                              setMode('choose')
                              window.mathVirtualKeyboard.hide()
                            }}
                          >
                            Weiter
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {mode == 'done' && (
                <div className="flex justify-start items-baseline">
                  <div className="text-2xl mt-6">
                    <MathField readonly key={solution} value={solution} />
                  </div>
                  <div className="text-green-500 ml-8">
                    <FaIcon
                      icon={faCircleCheck}
                      className="mr-1 inline-block -mb-0.5"
                    />{' '}
                    Stark!
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )

  function extractSymbols(json: Expression): Set<string> {
    const output = new Set<string>()

    function runInner(json: Expression) {
      if (Array.isArray(json)) {
        json.slice(1).map(runInner)
      }
      if (typeof json == 'string') {
        output.add(json)
      }
    }

    runInner(json)
    return output
  }

  function combineRef(latex: string, op: Action): string {
    if (op.latex.startsWith(':')) {
      return `( ${latex} ) \\div ( ${op.latex.replace(':', '')} )`
    }
    return `( ${latex} ) + ( ${op.latex} )`
  }

  function validateInput(json: Expression): true | string {
    console.log('MathJSON:', json)
    if (Array.isArray(json) && json.length == 3 && json[0] == 'Equal') {
      const symbols = extractSymbols(json)
      if (symbols.size <= 1) {
        return true
      }
    }
    return 'Eingabe keine Gleichung'
  }
}
