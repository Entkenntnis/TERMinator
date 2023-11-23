import { Expression } from '@cortex-js/compute-engine/dist/types/math-json/math-json-format'
import { AlgebraNode } from './types'

export function parse(input: Expression): AlgebraNode {
  if (typeof input == 'number') {
    return { type: 'nat', value: input }
  }
  if (Array.isArray(input)) {
    const op = input[0]
    if (op == 'Add') {
      const rest = input.slice(1)
      if (rest.length < 2) {
        throw 'Too few operations'
      }
      if (rest.length == 2) {
        return { type: 'add', left: parse(rest[0]), right: parse(rest[1]) }
      } else {
        return {
          type: 'add',
          left: parse(rest[0]),
          right: parse(['Add', ...rest.slice(1)]),
        }
      }
    } else {
      throw 'not implemented'
    }
  }
  return { type: 'null' }
}
