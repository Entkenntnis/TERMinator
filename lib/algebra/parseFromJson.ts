import { Expression } from '@cortex-js/compute-engine/dist/types/math-json/math-json-format'
import { AlgebraNode } from './types'

export function parse(input: Expression): AlgebraNode {
  if (typeof input == 'number') {
    if (!Number.isInteger(input)) throw 'not a number'
    if (input < 0) {
      return { type: 'negate', child: { type: 'nat', value: -input } }
    } else {
      return { type: 'nat', value: input }
    }
  }
  if (Array.isArray(input)) {
    const op = input[0]
    if (op == 'Add' || op == 'Multiply' || op == 'Divide' || op == 'Subtract') {
      const rest = input.slice(1)
      if (rest.length < 2) {
        if (op == 'Subtract' && rest.length == 1) {
          return { type: 'negate', child: parse(rest[0]) }
        } else {
          throw 'Too few operations'
        }
      }
      if (rest.length == 2) {
        return {
          type: (op.charAt(0).toLowerCase() + op.slice(1)) as any,
          left: parse(rest[0]),
          right: parse(rest[1]),
        }
      } else {
        return {
          type: (op.charAt(0).toLowerCase() + op.slice(1)) as any,
          left: parse(rest[0]),
          right: parse([op, ...rest.slice(1)]),
        }
      }
    }
    if (op == 'Sequence') {
      if (input.length == 1) {
        return { type: 'null' }
      }
      if (input.length == 2) {
        return parse(input[1])
      }
    }
    if (op == 'Delimiter' && input.length == 2) {
      return parse(input[1])
    }
  }
  throw 'not implemented'
}
