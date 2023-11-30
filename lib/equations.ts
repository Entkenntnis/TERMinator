import { ComputeEngine } from '@cortex-js/compute-engine'
import { Expression } from '../types/mathlive/mathfield-element'

export interface Action {
  type: 'simplify' | 'equiv-add' | 'solution' | 'equiv-raw'
  displayLatex?: string
  latex: string
}

export function findActions(
  input: Expression,
  variableSymbol: string,
  sourceLatex: string
): Action[] {
  const ce = new ComputeEngine()
  const output: Action[] = []

  console.log('actions', input)

  function negateAndShowOp(t: any) {
    if (typeof t == 'number' && t == 0) return
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
            if (t > 0) {
              output.push({
                type: 'equiv-raw',
                displayLatex: `: ${t}`,
                latex: `\\div ${t}`,
              })
            } else {
              output.push({
                type: 'equiv-raw',
                displayLatex: `: ( ${t} )`,
                latex: `\\div ${t}`,
              })
            }
          }
          if (isRational(t)) {
            if (t[1] > 0) {
              output.push({
                type: 'equiv-raw',
                displayLatex: `: ${ce.box(t).latex}`,
                latex: `\\div ${ce.box(t).latex}`,
              })
            } else {
              output.push({
                type: 'equiv-raw',
                displayLatex: `: (${ce
                  .box(t)
                  .latex.replaceAll('\\frac{-', '-\\frac{')})`,
                latex: `\\div ${ce.box(t).latex}`,
              })
            }
          }
        })
        if (typeof t[1] == 'number' || isRational(t[1])) {
          if (t[2] == variableSymbol && t[1] !== 0) {
            negateAndShowOp(t)
          }
        }
      }
      if (t[0] == 'Divide') {
        if (typeof t[2] == 'number') {
          const latex = `\\cdot ${t[2] > 0 ? t[2] : `(${t[2]})`}`
          output.push({
            type: 'equiv-raw',
            displayLatex: latex,
            latex,
          })
        }
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
      if (isDone(input) || isDoneRational(input)) {
        const parts = sourceLatex.trim().split('=')
        const result = parts[0] == variableSymbol ? parts[1] : parts[0]
        let resultJSON = ce.parse(result, { canonical: false }).json
        let outputValue = ''
        if (typeof resultJSON == 'number') {
          outputValue = result
        }
        if (Array.isArray(resultJSON) && isDivide(resultJSON)) {
          const z = resultJSON[1] as number
          const n = resultJSON[2] as number
          if (Math.abs(gcd(z, n)) === 1) {
            outputValue = result
          }
        }
        if (
          Array.isArray(resultJSON) &&
          resultJSON.length == 2 &&
          resultJSON[0] == 'Negate' &&
          isDivide(resultJSON[1])
        ) {
          const z = (resultJSON as any)[1][1] as number
          const n = (resultJSON as any)[1][2] as number
          if (Math.abs(gcd(z, n)) === 1) {
            outputValue = result
          }
        }
        if (outputValue) {
          output.push({
            type: 'solution',
            displayLatex: `\\mathbb{L} = \\left\\{ ${outputValue} \\right\\}`,
            latex: '',
          })
        }
      }
      /*if (isDoneRational(input)) {
        console.log('source', sourceLatex)
        const value = isRational(input[1]) ? input[1] : input[2]
        output.push({
          type: 'solution',
          displayLatex: `\\mathbb{L} = \\left\\{ ${
            ce.box(value).latex
          } \\right\\}`,
          latex: '',
        })
      }*/
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
      if (output.length == 0) {
        output.push({ type: 'simplify', latex: '' })
        forInput(input[1])
        forInput(input[2])
      }
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
        json.length == 3 &&
        typeof json[1] == 'number' &&
        typeof json[2] == 'number'
      ) {
        return true
      }
    }
    return false
  }
  function isDivide(json: Expression) {
    if (Array.isArray(json)) {
      if (
        json[0] == 'Divide' &&
        json.length == 3 &&
        typeof json[1] == 'number' &&
        typeof json[2] == 'number'
      ) {
        return true
      }
    }
    return false
  }
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}
