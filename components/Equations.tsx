'use client'

import { MathField } from './MathField'
import { ComputeEngine } from '@cortex-js/compute-engine'
import { parse } from '../lib/algebra/parseFromJson'
import { useEffect, useRef, useState } from 'react'
import { print } from '../lib/algebra/print'
import { ExplorationMap, explore } from '../lib/algebra/explore'
import { replaceSubtractNegate } from '../lib/algebra/replaceSubtractNegate'
import { FaIcon } from './FaIcon'
import {
  faArrowDownLong,
  faCircleCheck,
  faRotateLeft,
  faSpinner,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import { evaluate } from '../lib/algebra/eval'
import { MathField2 } from './MathField2'
import { Action, findActions } from '../lib/algebra/findActions'
import { Expression } from '../types/mathlive/mathfield-element'

type Mode = 'done' | 'input' | 'choose'
type InputState =
  | 'error'
  | 'ok'
  | 'empty'
  | 'var-mismatch'
  | 'left-mismatch'
  | 'right-mismatch'
  | 'last-step'

export function Equations() {
  const ce = new ComputeEngine()

  function safeParse(latex: string) {
    return ce.parse(latex.replaceAll('{,}', '.'))
  }
  window.MathfieldElement.decimalSeparator = ','
  const [description, setDescription] = useState(
    'Löse die Gleichung. Wähle in jedem Schritt eine Umformung.'
  )
  const [edit, setEdit] = useState(false)

  const [mode, setMode] = useState<Mode>('choose')
  const [inputState, setInputState] = useState<InputState>('empty')

  const [list, setList] = useState<string[]>(['4x + 3 = 11'])
  const [actions, setActions] = useState<Action[]>([])

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
      options = findActions(json)
      //console.log(options)
    } catch (e) {
      console.log(e)
    }
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

  const rejectReason = useRef('')

  return (
    <div className="h-full flex flex-col">
      <div className="grow-0 bg-gray-100 flex justify-between items-baseline pb-1">
        <div className="flex items-baseline">
          <h1 className="text-xl text-bold my-2 ml-3">Gleichungslöser</h1>
          <a href="/" className="ml-4 underline ">
            zurück
          </a>
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
              Änderungen übernehmen
            </button>
          ) : (
            <button
              className="px-2 py-1 rounded bg-pink-300 hover:bg-pink-400"
              onClick={() => {
                setEdit(true)
                setList((list) => [list[0]])
                setActions([])
                setMode('done')
              }}
            >
              Aufgabe überarbeiten
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

                            // TODO!! check if results are fine
                            for (let i = -10; i <= 10; i++) {
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
                            if (isDone(parsed.json)) {
                              setInputState('last-step')
                            } else {
                              setInputState('ok')
                            }
                          } catch (e) {
                            setMode('input')
                            setInputState('error')
                          }
                        }}
                        onEnter={() => {
                          if (inputState == 'last-step') {
                            setList((list) => [...list, currentLatex.current])
                            setMode('done')
                            window.mathVirtualKeyboard.hide()
                          }
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
                            }}
                          >
                            Weiter
                          </button>
                        </div>
                      )}
                      {inputState == 'last-step' && (
                        <div className="flex justify-between items-baseline">
                          <span className="text-green-600">Super!</span>
                          <button
                            className="px-2 py-1 rounded bg-green-200 hover:bg-green-300 ml-3 inline-block"
                            onClick={() => {
                              setList((list) => [...list, currentLatex.current])
                              setMode('done')
                            }}
                          >
                            Aufgabe abschließen
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {mode == 'done' && (
                <div className="text-green-500 ml-4 text-xl mt-6">
                  <FaIcon
                    icon={faCircleCheck}
                    className="mr-3 inline-block -mb-0.5"
                  />{' '}
                  abgeschlossen
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

  function isDone(json: Expression) {
    console.log('is done?', json)
    if (
      Array.isArray(json) &&
      json.length == 3 &&
      json[0] == 'Equal' &&
      ((json[1] == variableSymbol && typeof json[2] == 'number') ||
        (json[2] == variableSymbol && typeof json[1] == 'number'))
    ) {
      return true
    }
    return false
  }

  function validateInput(json: Expression): true | string {
    console.log('MathJSON:', json)
    if (Array.isArray(json) && json.length == 3 && json[0] == 'Equal') {
      const symbols = extractSymbols(json)
      if (symbols.size <= 1) {
        return true
      }
    }
    return 'test'
  }
}
