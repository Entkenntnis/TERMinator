import { DetailedHTMLProps, HTMLAttributes } from 'react'
import MathfieldElement from './mathfield-element'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': DetailedHTMLProps<
        HTMLAttributes<MathfieldElement>,
        MathfieldElement
      >
    }
  }
}
