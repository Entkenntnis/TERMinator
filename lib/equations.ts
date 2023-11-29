import { ComputeEngine } from '@cortex-js/compute-engine'
import { Expression } from '../types/mathlive/mathfield-element'

export interface Action {
  type: 'simplify' | 'equiv-append' | 'solution'
  latex: string
}

export function findActions(
  input: Expression,
  variableSymbol: string
): Action[] {
  const ce = new ComputeEngine()
  const output: Action[] = [{ type: 'simplify', latex: '' }]

  // console.log(input)

  function forInput(t: Expression) {
    if (Array.isArray(t)) {
      if (t[0] == 'Add') {
        t.slice(1).forEach((t) => {
          output.push({
            type: 'equiv-append',
            latex: ce.box(['Negate', t]).latex,
          })
        })
      }
      if (t[0] == 'Subtract') {
        output.push({
          type: 'equiv-append',
          latex: ce.box(['Negate', t[1]]).latex,
        })
        output.push({
          type: 'equiv-append',
          latex: ce.box(t[2]).latex,
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
        latex: ce.box(['Negate', t]).latex,
      })
    }
  }

  if (Array.isArray(input)) {
    if (input[0] == 'Equal' && input.length == 3) {
      if (isDone(input)) {
        const value = typeof input[1] == 'number' ? input[1] : input[2]
        output.push({
          type: 'solution',
          latex: `\\mathbb{L} = \\{ ${value} \\}`,
        })
      }
      if (isDoneRational(input)) {
        const value = isRational(input[1]) ? input[1] : input[2]
        output.push({
          type: 'solution',
          latex: `\\mathbb{L} = \\left\\{ ${ce.box(value).latex} \\right\\}`,
        })
      }
      if (typeof input[1] == 'number' && typeof input[2] == 'number') {
        if (input[1] === input[2]) {
          output.push({
            type: 'solution',
            latex: `\\mathbb{L} = \\mathbb{Q}`,
          })
        } else {
          output.push({
            type: 'solution',
            latex: `\\mathbb{L} = \\{ \\}`,
          })
        }
      }
      forInput(input[1])
      forInput(input[2])
      const existingOps = new Set<string>()
      return output
        .map((op) => {
          op.latex = op.latex.replaceAll('.', '{,}')
          const key = op.latex + '²²' + op.type
          if (existingOps.has(key)) return null
          existingOps.add(key)
          return op
        })
        .filter((x) => x !== null) as Action[]
    }
  }
  throw new Error('invalid input')

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

  function isDoneRational(json: Expression) {
    console.log('is done?', json)
    if (
      Array.isArray(json) &&
      json.length == 3 &&
      json[0] == 'Equal' &&
      ((json[1] == variableSymbol && isRational(json[2])) ||
        (json[2] == variableSymbol && isRational(json[1])))
    ) {
      return true
    }
    return false
  }

  function isRational(json: Expression) {
    if (Array.isArray(json)) {
      if (
        json[0] == 'Rational' &&
        typeof json[1] == 'number' &&
        typeof json[2] == 'number'
      ) {
        return true
      }
    }
    return false
  }
}
