import { ComputeEngine } from '@cortex-js/compute-engine'
import { Expression } from '../../types/mathlive/mathfield-element'

export interface Action {
  type: 'simplify' | 'equiv-append'
  latex: string
}

export function findActions(input: Expression) {
  const ce = new ComputeEngine()
  const output: Action[] = [{ type: 'simplify', latex: '' }]

  // console.log(input)

  function forInput(t: Expression) {
    if (Array.isArray(t)) {
      if (t[0] == 'Add') {
        t.slice(1).forEach((t) => {
          output.push({
            type: 'equiv-append',
            latex: ce.box(['Negate', t]).latex.replace('.', '{,}'),
          })
        })
      }
      if (t[0] == 'Subtract') {
        output.push({
          type: 'equiv-append',
          latex: ce.box(['Negate', t[1]]).latex.replace('.', '{,}'),
        })
        output.push({
          type: 'equiv-append',
          latex: ce.box(t[2]).latex.replace('.', '{,}'),
        })
      }
      if (t[0] == 'Multiply') {
        t.slice(1).forEach((t) => {
          if (typeof t == 'number')
            output.push({
              type: 'equiv-append',
              latex: `: ${t}`,
            })
        })
      }
    }
    if (typeof t == 'number') {
      output.push({
        type: 'equiv-append',
        latex: ce.box(['Negate', t]).latex.replace('.', '{,}'),
      })
    }
  }

  if (Array.isArray(input)) {
    if (input[0] == 'Equal' && input.length == 3) {
      forInput(input[1])
      forInput(input[2])
      return output
    }
  }
  throw new Error('invalid input')
}
