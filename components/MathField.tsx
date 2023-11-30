import { useState, useEffect, createRef } from 'react'
import MathfieldElement from '../types/mathlive/mathfield-element'
import { FaIcon } from './FaIcon'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

interface MathFieldProps {
  value?: string
  readonly?: boolean
  onChange?: (latex: string) => void
  onEnter?: () => void
  lazy?: boolean
}

export function MathField(props: MathFieldProps) {
  const [value, setValue] = useState(props.value ?? '')

  const [wait, setWait] = useState(!!props.lazy)

  // Customize the mathfield when it is mounted
  const mf = createRef<MathfieldElement>()

  useEffect(() => {
    if (wait) {
      setTimeout(() => {
        setWait(false)
      }, 100)
      return
    }
    if (mf.current) {
      mf.current.menuItems = []
      if (props.readonly) {
        mf.current.readOnly = true
        mf.current.registers.arraystretch = 1.5
      } else {
        // only run on mount
        // Read more about customizing the mathfield: https://cortexjs.io/mathlive/guides/customizing/
        mf.current.smartFence = false
        mf.current.inlineShortcuts = { '*': '\\cdot' }
        mf.current.macros = {}
        mf.current.scriptDepth = 0
        mf.current.mathVirtualKeyboardPolicy = 'manual'
        mf.current.addEventListener('focusin', () => {
          window.mathVirtualKeyboard.show()
        })
        mf.current.addEventListener('focusout', () => {
          window.mathVirtualKeyboard.hide()
        })
        mf.current.keybindings = [
          ...mf.current.keybindings,
          { key: ':', command: ['insert', '\\div'] },
          { key: '[NumpadDivide]', command: ['insert', '\\div'] },
          { key: '/', command: ['insert', '\\div'] },
        ]
        //window.MathfieldElement.decimalSeparator = ','
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
              {
                label: '[backspace]',
                width: 1.5,
              },
            ],
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
            [],
          ],
        }
      }
    }
  }, [mf.current, wait])

  if (wait) {
    return (
      <div>
        <FaIcon icon={faSpinner} className="animate-spin" />
      </div>
    )
  }

  return (
    <math-field
      style={{ display: 'block', backgroundColor: 'rgba(255,255,255,0)' }}
      ref={mf}
      onKeyDownCapture={(ev) => {
        if (ev.key == 'Enter' && props.onEnter) {
          props.onEnter()
        }
      }}
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
