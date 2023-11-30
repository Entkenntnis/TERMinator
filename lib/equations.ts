import { ComputeEngine } from '@cortex-js/compute-engine'
import { Expression } from '../types/mathlive/mathfield-element'

export interface Action {
  type: 'simplify' | 'equiv-add' | 'solution' | 'equiv-raw'
  displayLatex?: string
  latex: string
}

export function findActions(
  input: Expression,
  variableSymbol: string
): Action[] {
  const ce = new ComputeEngine()
  const output: Action[] = [{ type: 'simplify', latex: '' }]

  console.log('actions', input)

  function negateAndShowOp(t: any) {
    const rawLatex = ce
      .box(['Negate', t])
      .latex.replaceAll('\\frac{-', '-\\frac{')
    output.push({
      type: 'equiv-add',
      displayLatex: rawLatex.startsWith('-') ? rawLatex : `+ ${rawLatex}`,
      latex: rawLatex,
    })
  }

  function forInput(t: Expression) {
    if (Array.isArray(t)) {
      if (t[0] == 'Add') {
        t.slice(1).forEach(negateAndShowOp)
      }
      if (t[0] == 'Subtract') {
        negateAndShowOp(t[1])
        negateAndShowOp(['Negate', t[2]])
      }
      if (t[0] == 'Multiply') {
        t.slice(1).forEach((t) => {
          if (typeof t == 'number' && t != 0) {
            output.push({
              type: 'equiv-raw',
              displayLatex: `: ${t}`,
              latex: `\\div ${t}`,
            })
          }
          if (isRational(t)) {
            output.push({
              type: 'equiv-raw',
              displayLatex: `: ${ce.box(t).latex}`,
              latex: `\\div ${ce.box(t).latex}`,
            })
          }
        })
      }
      if (t[0] == 'Negate' && t.length == 2 && t[1] == variableSymbol) {
        output.push({
          type: 'equiv-raw',
          displayLatex: `\\cdot (-1)`,
          latex: `\\cdot (-1)`,
        })
      }
    }
    if (typeof t == 'number') {
      negateAndShowOp(t)
    }
    if (t == variableSymbol) {
      negateAndShowOp(t)
    }
  }

  if (Array.isArray(input)) {
    if (input[0] == 'Equal' && input.length == 3) {
      if (isDone(input)) {
        const value = typeof input[1] == 'number' ? input[1] : input[2]
        output.push({
          type: 'solution',
          displayLatex: `\\mathbb{L} = \\{ ${value} \\}`,
          latex: '',
        })
      }
      if (isDoneRational(input)) {
        const value = isRational(input[1]) ? input[1] : input[2]
        output.push({
          type: 'solution',
          displayLatex: `\\mathbb{L} = \\left\\{ ${
            ce.box(value).latex
          } \\right\\}`,
          latex: '',
        })
      }
      if (typeof input[1] == 'number' && typeof input[2] == 'number') {
        if (input[1] === input[2]) {
          output.push({
            type: 'solution',
            displayLatex: `\\mathbb{L} = \\mathbb{Q}`,
            latex: '',
          })
        } else {
          output.push({
            type: 'solution',
            displayLatex: `\\mathbb{L} = \\{ \\}`,
            latex: '',
          })
        }
      }
      forInput(input[1])
      forInput(input[2])
      const existingOps = new Set<string>()
      return output
        .map((op) => {
          if (op.displayLatex) {
            op.displayLatex = op.displayLatex.replaceAll('.', '{,}')
            const key = op.displayLatex + '²²' + op.type
            if (existingOps.has(key)) return null
            existingOps.add(key)
          }
          return op
        })
        .filter((x) => x !== null) as Action[]
    }
  }
  throw new Error('invalid input')

  function isDone(json: Expression) {
    // console.log('is done?', json)
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
    // console.log('is done?', json)
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
