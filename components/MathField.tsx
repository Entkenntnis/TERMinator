import { useState, useEffect, createRef } from 'react'
import MathfieldElement from '../types/mathlive/mathfield-element'

interface MathFieldProps {
  value?: string
  readonly?: boolean
  onChange?: (latex: string) => void
}

export function MathField(props: MathFieldProps) {
  const [value, setValue] = useState(props.value ?? '')

  // Customize the mathfield when it is mounted
  const mf = createRef<MathfieldElement>()
  useEffect(() => {
    if (mf.current) {
      // Read more about customizing the mathfield: https://cortexjs.io/mathlive/guides/customizing/
      mf.current.smartFence = false
      mf.current.menuItems = []
      mf.current.inlineShortcuts = { '*': '\\cdot' }
      mf.current.macros = {}
      mf.current.scriptDepth = 0
      console.log(mf.current.keybindings)
      mf.current.keybindings = [
        ...mf.current.keybindings,
        { key: ':', command: ['insert', '\\div'] },
        { key: '[NumpadDivide]', command: ['insert', '\\div'] },
        { key: '/', command: ['insert', '\\div'] },
      ]
      window.MathfieldElement.decimalSeparator = ','
      if (props.readonly) {
        mf.current.readOnly = true
      } else {
        // only run on mount
        mf.current.focus()
        window.mathVirtualKeyboard.layouts = {
          displayEditToolbar: false,
          rows: [
            [],
            [
              '+',
              '-',
              '\\cdot',
              '\\div',
              '(',
              ')',
              '[left]',
              '[right]',
              { label: '[backspace]', width: 1.5 },
            ],
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
            [],
          ],
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update the mathfield when the value changes
  useEffect(() => {
    if (mf.current) {
      mf.current.value = value
    }
  }, [value, mf])

  return (
    <math-field
      style={{ display: 'block' }}
      ref={mf}
      onInput={(evt) => {
        const v = (evt.target as MathfieldElement).value
        setValue(v)
        if (props.onChange) {
          props.onChange(v)
        }
      }}
    >
      {value}
    </math-field>
  )
}
