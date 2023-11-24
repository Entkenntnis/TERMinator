import { AlgebraNode } from './types'

export function print(node: AlgebraNode): string {
  switch (node.type) {
    case 'null':
      return '?'
    case 'add':
      return `(${print(node.children[0])}+${print(node.children[1])})`
    case 'subtract':
      return `(${print(node.children[0])}-${print(node.children[1])})`
    case 'multiply':
      return `(${print(node.children[0])}*${print(node.children[1])})`
    case 'divide':
      return `(${print(node.children[0])}/${print(node.children[1])})`
    case 'nat':
      return `[${node.value.toString()}]`
    case 'negate':
      return `(-${print(node.children[0])})`
  }
}
