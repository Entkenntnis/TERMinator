import { useState, useEffect, createRef } from 'react'
import MathfieldElement from '../types/mathlive/mathfield-element'

interface MathFieldProps {
  value?: string
  readonly?: boolean
  onChange?: (latex: string) => void
  onEnter?: () => void
}

export function MathField2(props: MathFieldProps) {
  const [value, setValue] = useState(props.value ?? '')

  // Customize the mathfield when it is mounted
  const mf = createRef<MathfieldElement>()
  useEffect(() => {
    if (mf.current) {
      mf.current.menuItems = []
      if (props.readonly) {
        mf.current.readOnly = true
      } else {
        // only run on mount
        // Read more about customizing the mathfield: https://cortexjs.io/mathlive/guides/customizing/
        // mf.current.smartFence = false
        mf.current.inlineShortcuts = {
          ...mf.current.inlineShortcuts,
          '*': '\\cdot',
        }
        mf.current.scriptDepth = 1
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
        ]
        mf.current.focus()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <math-field
      style={{ display: 'block' }}
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
