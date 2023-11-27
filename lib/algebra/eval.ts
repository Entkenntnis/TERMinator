import { AlgebraNode } from './types'

export function evaluate(node: AlgebraNode): number {
  switch (node.type) {
    case 'null':
      return NaN
    case 'add':
      return evaluate(node.children[0]) + evaluate(node.children[1])
    case 'subtract':
      return evaluate(node.children[0]) - evaluate(node.children[1])
    case 'multiply':
      return evaluate(node.children[0]) * evaluate(node.children[1])
    case 'divide':
      return evaluate(node.children[0]) / evaluate(node.children[1])
    case 'nat':
      return node.value
    case 'negate':
      return -node.children[0]
  }
}
