'use client'

import { MathField } from './MathField'
import { ComputeEngine } from '@cortex-js/compute-engine'
import { useEffect, useRef, useState } from 'react'
import { FaIcon } from './FaIcon'
import {
  faCircleCheck,
  faPlay,
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons'
import { faSquare } from '@fortawesome/free-regular-svg-icons'
import { MathField2 } from './MathField2'
import { Expression } from '../types/mathlive/mathfield-element'
import { Action, findActions } from '../lib/equations'
import confetti from 'canvas-confetti' // why is this throwing warnings? sigh ..

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

  const lastScrollPosition = useRef(-1)

  const scrollDiv = useRef<HTMLDivElement>(null)

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
      options = findActions(
        json,
        variableSymbol,
        list[list.length - 1].replaceAll('{,}', '.')
      )
      //console.log(options)
    } catch (e) {
      console.log(e)
    }
  }
  const rejectReason = useRef('')

  const solved = useRef<Set<string>>(new Set())

  const [showOverview, setShowOverview] = useState(true)

  useEffect(() => {
    if (showOverview && lastScrollPosition.current > 0) {
      window.document.documentElement.scrollTop = lastScrollPosition.current
    }
  }, [showOverview])

  useEffect(() => {
    const handlePopstate = () => {
      setShowOverview(true)
    }

    window.addEventListener('popstate', handlePopstate)

    return () => {
      window.removeEventListener('popstate', handlePopstate)
    }
  }, [])

  if (showOverview) {
    return (
      <div className="flex flex-col">
        <div className="grow-0 bg-gray-100 flex justify-between items-baseline pb-1">
          <div className="flex items-baseline">
            <h1 className="text-xl text-bold my-2 ml-3">
              <img
                src="/favicon.ico"
                className="inline-block h-6 mr-3 -mt-1"
                alt=""
              />
              Serlo Gleichungs-App
            </h1>
          </div>
          <div className="mr-3"></div>
        </div>
        <div className="grow shrink overflow-auto" ref={scrollDiv}>
          <div className="mx-auto max-w-[600px] mt-7 px-4 mb-[200px] [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mt-8">
            <h3>Serlo 26258 - Aufgaben zu linearen Gleichungen</h3>
            {renderExample('x+1=4')}
            {renderExample('2x=8')}
            {renderExample('4x=3x+5')}
            {renderExample('0x=7')}
            {renderExample('4x+4=3x+3')}
            {renderExample('5x-2=x+6')}
            {renderExample('3x=x+5')}
            {renderExample('2x=4')}
            {renderExample('7x-9=2x+5')}
            {renderExample('\\frac{1}{12}x - 5 = 3')}
            {renderExample('-8x + 5 = -5')}
            {renderExample('x + 4 = 9x - (5 - x)')}
            {renderExample('\\frac{1}{24} x = 0')}
            {renderExample('3(a-4)=1-\\frac15(2-a)' /*, 'HN Multiplikation?'*/)}
            {renderExample('3(4x-3)=4(3x-4)')}
            {renderExample('3(4x+4)=4(3-4x)')}
            <h3>Studyflix - einfache Gleichungen</h3>
            {renderExample('5=2+3')}
            {renderExample('6=2+3')}
            {renderExample('x+4=6')}
            {renderExample('x-2=8')}
            {renderExample('5y+3=18')}
            {renderExample('4(x+1)+3=7x-5')}
            {renderExample('3x-1=8')}
            {renderExample('2x-1=4x+3')}
            {renderExample('3x+5=14')}
            {renderExample('\\frac{x+5}{8}=2-2x')}
            {renderExample('x+5=8')}
            {renderExample('x-x=0')}
            {renderExample('x=x+1')}
            <h3>Lernkompass - S-Blatt01-lineare-Gleichungen</h3>
            {renderExample('3x=21')}
            {renderExample('-6x=48')}
            {renderExample('12x=-60')}
            {renderExample('7x=63')}
            {renderExample('-8x=-56')}
            {renderExample('10x=36')}
            {renderExample('x+3=-12')}
            {renderExample('x-7=25')}
            {renderExample('x+4=16')}
            {renderExample('5-x=17')}
            {renderExample('13=3+x')}
            {renderExample('12-x=27')}

            {renderExample('21-2x=6x+5')}
            {renderExample('15-5x=2x-20')}
            {renderExample('9x+14=2+5x')}
            {renderExample('3x+7=11+19x')}
            {renderExample('41-3x=9+5x')}
            {renderExample('17x-21=6x+45')}
            {renderExample('x-3=5x-11')}
            {renderExample('-44-12x=-5x+12')}

            {renderExample('\\frac13 x = 9')}
            {renderExample('\\frac25 x = 10')}
            {renderExample('-2x = \\frac27')}
            {renderExample('5x=- \\frac{10}{35}')}
            {renderExample('-2{,}5x + 5{,}75 = 7{,}5x+1{,}75')}
            {renderExample('8{,}3-1{,}2x=4{,}7+1{,}8x')}
            {renderExample('\\frac23 x + \\frac12 = \\frac32 x + \\frac56')}
            {renderExample('\\frac34x-\\frac25 = \\frac13+\\frac45 x')}

            {renderExample('15+11x=2(3+x)')}
            {renderExample('3(x+6)=4(2+x)')}
            {renderExample('5(2-3x)+x=2(-6+4x)')}
            {renderExample('6(4x+8)-12=-3(3-2x)')}
            {renderExample('10-(7x-5)=2-2(x+6)')}
            {renderExample('12-(-3x+6)=18-(9+3x)')}
            {renderExample('2-7(2x+5)-3(2x-4)=19')}

            <div className="text-center">
              {' '}
              <button
                className="mt-12 ml-3 px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                onClick={() => {
                  setShowOverview(false)
                  setEdit(true)
                  setInputState('ok')
                  setMode('done')
                }}
              >
                eigene Aufgabe erstellen
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderExample(latex: string, warning?: string) {
    const isSolved = solved.current.has(latex)
    return (
      <div className="my-4 flex items-baseline justify-between h-14">
        <div className="text-xl flex items-baseline">
          <MathField readonly key={latex} value={latex} lazy />
          {isSolved && (
            <FaIcon
              icon={faCircleCheck}
              className="ml-2 text-green-500 text-base"
            />
          )}
        </div>
        <div>
          <span className="text-sm text-yellow-600 mr-3">{warning}</span>
          {isSolved ? (
            <button
              className="text-gray-700 hover:text-black hover:underline"
              onClick={() => {
                setShowOverview(false)
                setList([latex])
                setMode('choose')
                setInputState('empty')
                setActions([])
                setEdit(false)
                setSolution('')
                lastScrollPosition.current =
                  window.document.scrollingElement?.scrollTop ?? -1

                window.scrollTo(0, 0)
                window.history.pushState(null, '', null)
              }}
            >
              erneut starten
            </button>
          ) : (
            <button
              className="px-2 py-1 bg-green-200 hover:bg-green-300 rounded"
              onClick={() => {
                setShowOverview(false)
                setList([latex])
                setMode('choose')
                setInputState('empty')
                setActions([])
                setEdit(false)
                setSolution('')
                lastScrollPosition.current =
                  window.document.scrollingElement?.scrollTop ?? -1

                window.scrollTo(0, 0)
                window.history.pushState(null, '', null)
              }}
            >
              <FaIcon icon={faPlay} className="text-sm mr-2" />
              Starten
            </button>
          )}
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
            : `&& \\vert ${actions[i].displayLatex}`
          : mode == 'done'
          ? '&& '
          : '&& \\boxed{\\textcolor{orange}{?}}'
      }`
    })
    .join('\\\\\n')}\\end{align}`

  return (
    <div className="flex flex-col">
      <div className="grow-0 bg-gray-100 flex justify-between items-baseline pb-1">
        <div className="flex items-baseline">
          <h1 className="text-xl text-bold my-2 ml-3">
            <img
              src="/favicon.ico"
              className="inline-block h-6 mr-3 -mt-1"
              alt=""
            />
            Serlo Gleichungs-App
          </h1>
        </div>
        <div className="mr-3">
          {edit ? (
            <>
              <button
                className="mr-5 hover:underline"
                onClick={() => {
                  setShowOverview(true)
                }}
              >
                abbrechen
              </button>
              <button
                className="px-2 py-1 rounded bg-green-200 hover:bg-green-300 disabled:cursor-not-allowed"
                disabled={mode !== 'done'}
                onClick={() => {
                  setEdit(false)
                  setMode('choose')
                  setActions([])
                  setList([list[0]])
                }}
              >
                Starten
              </button>
            </>
          ) : (
            mode !== 'done' && (
              <button
                className="px-2 py-1 rounded bg-pink-300 hover:bg-pink-400"
                onClick={() => {
                  setShowOverview(true)
                  window.mathVirtualKeyboard.hide()
                }}
              >
                zurück
              </button>
            )
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
              <div className="text-xl border-2 rounded">
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

              <div className="text-xl">
                <MathField readonly key={output} value={output} />
              </div>
              {mode == 'choose' && (
                <div>
                  <p className="mt-6 text-gray-700 font-bold text-base">
                    Klicke auf eine der Optionen:
                  </p>
                  <div className="mt-4 flex justify-start flex-wrap">
                    {options.map((op, i) => {
                      if (op.type == 'simplify') {
                        return (
                          <button
                            className="mr-6 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded mt-3"
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
                      if (op.type == 'equiv-add' || op.type == 'equiv-raw') {
                        return (
                          <button
                            className="mr-6 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded relative text-xl mt-3"
                            key={i}
                          >
                            <MathField
                              key={op.latex}
                              readonly
                              value={`\\vert ${op.displayLatex ?? op.latex}`}
                            />
                            <span
                              className="absolute inset-0 opacity-0"
                              onClick={() => {
                                setActions((acs) => [...acs, op])
                                setMode('input')
                                setInputState('empty')
                                // console.log('debug', JSON.stringify(list))
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
                            className="mr-6 px-2 py-1 bg-green-200 hover:bg-green-300 rounded relative text-xl mt-3"
                            key={i}
                          >
                            <MathField
                              key={op.displayLatex}
                              readonly
                              value={op.displayLatex}
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
                                confetti.default()
                                setMode('done')
                                setSolution(op.displayLatex!)
                                solved.current.add(list[0])
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
                <div className="text-xl flex items-baseline mt-3">
                  <div className="grow">
                    <div className="flex justify-between items-baseline mb-2">
                      <div className="pt-3 text-gray-700 font-bold text-base ">
                        {actions[actions.length - 1].type == 'simplify'
                          ? 'Terme in Gleichung vereinfachen:'
                          : 'Umformen:'}
                      </div>
                      <button
                        className="text-sm text-gray-600 hover:text-black"
                        onClick={() => {
                          setActions((acc) => acc.slice(0, -1))
                          setMode('choose')
                          if (list.length == actions.length + 1) {
                            setList((l) => l.slice(0, -1))
                          }
                        }}
                      >
                        <FaIcon
                          icon={faRotateLeft}
                          className="text-base sm:text-xs"
                        />
                        <span className="hidden sm:inline">
                          &nbsp;rückgängig
                        </span>
                      </button>
                    </div>
                    <div className="border-2 rounded">
                      <MathField2
                        onChange={(latex) => {
                          setTimeout(() => {
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

                              // console.log(symbols)

                              // console.log(symbols, variableSymbol)
                              if (
                                (!symbols.has(variableSymbol) &&
                                  symbols.size > 0) ||
                                // (variableSymbol && symbols.size == 0) ||
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
                                if (variableSymbol) {
                                  ce.assign(variableSymbol, i)
                                }

                                const termL = `( ${refLeft} ) - ( ${parts[0]} )`
                                const valueL = safeParse(termL).N()
                                  .value as number

                                const termR = `( ${refRight} ) - ( ${parts[1]} )`
                                const valueR = safeParse(termR).N()
                                  .value as number

                                // console.log(termL, valueL, '\n', termR, valueR)

                                if (Math.abs(valueL) > 0.00001) {
                                  setInputState('left-mismatch')
                                  return
                                }
                                if (Math.abs(valueR) > 0.00001) {
                                  setInputState('right-mismatch')
                                  return
                                }
                                //if (symbols.size == 0) break
                              }

                              currentLatex.current = latex
                              setInputState('ok')
                            } catch (e) {
                              console.log(e)
                              setMode('input')
                              setInputState('error')
                            }
                          }, 0)
                        }}
                        onEnter={() => {
                          if (inputState == 'ok') {
                            setList((list) => [...list, currentLatex.current])
                            setMode('choose')
                            window.mathVirtualKeyboard.hide()
                          }
                        }}
                      />
                    </div>
                    <div className="text-base ml-1 mt-2">
                      {inputState == 'empty' && (
                        <span>
                          Erwarte Eingabe der Form{' '}
                          <FaIcon
                            icon={faSquare}
                            className="text-sm text-blue-400"
                          />
                          &nbsp;=&nbsp;
                          <FaIcon
                            icon={faSquare}
                            className="text-sm text-blue-400"
                          />
                        </span>
                      )}
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
                <>
                  <div className="flex justify-start items-baseline mt-2">
                    <div className="text-xl">
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
                  <div className="text-center">
                    <button
                      className="px-5 py-2 rounded bg-blue-200 hover:bg-blue-300 mt-6 mx-auto "
                      onClick={() => {
                        setShowOverview(true)
                        window.mathVirtualKeyboard.hide()
                      }}
                    >
                      weiter
                    </button>
                  </div>
                </>
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
      if (typeof json == 'string' && json != 'Half') {
        output.add(json)
      }
    }

    runInner(json)
    return output
  }

  function combineRef(latex: string, op: Action): string {
    if (op.type == 'equiv-raw') {
      return `( ${latex} ) ${op.latex}`
    }
    if (op.type == 'equiv-add') {
      return `( ${latex} ) + ( ${op.latex} )`
    }
    return latex
  }

  function validateInput(json: Expression): true | string {
    // console.log('MathJSON:', json)
    if (Array.isArray(json) && json.length == 3 && json[0] == 'Equal') {
      const symbols = extractSymbols(json)
      if (symbols.size <= 1) {
        return true
      }
    }
    return 'Eingabe keine Gleichung'
  }
}
