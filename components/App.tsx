'use client'

import { useState, useEffect, createRef } from 'react'
import MathfieldElement from '../types/mathlive/mathfield-element'

export function App() {
  const [value, setValue] = useState('\\sqrt{x}')

  // Customize the mathfield when it is mounted
  const mf = createRef<MathfieldElement>()
  useEffect(() => {
    if (mf.current) {
      // Read more about customizing the mathfield: https://cortexjs.io/mathlive/guides/customizing/
      mf.current.smartFence = false
      mf.current.menuItems = []

      // This could be an `onInput` handler, but this is an alternative
      mf.current.addEventListener('input', (evt) => {
        // When the return key is pressed, play a sound
        if ((evt as InputEvent).inputType === 'insertLineBreak') {
          // The mathfield is available as `evt.target`
          // The mathfield can be controlled with `executeCommand`
          // Read more: https://cortexjs.io/mathlive/guides/commands/
          ;(evt.target as MathfieldElement).executeCommand('plonk')
        }
      })
    }
  }, [mf])

  // Update the mathfield when the value changes
  useEffect(() => {
    if (mf.current) {
      mf.current.value = value
    }
  }, [mf, value])

  return (
    <div className="h-full flex flex-col">
      <div className="grow-0 bg-gray-100 flex justify-between items-baseline pb-1">
        <div>
          <h1 className="text-xl text-bold my-2 ml-3">TERMinator</h1>
        </div>
        <div className="mr-3">
          <a href="#" className="text-blue-600 hover:text-blue-700 underline">
            eigene Aufgabe erstellen
          </a>
        </div>
      </div>
      <div className="grow shrink text-center">
        Vereinfache diesen Term, achte auf eine sauere fortlaufende Rechnung
        <div className="mt-4">
          <math-field
            ref={mf}
            onInput={(evt) => setValue((evt.target as MathfieldElement).value)}
          >
            {value}
          </math-field>
        </div>
      </div>
    </div>
  )
}
