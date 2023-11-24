import { AlgebraNode } from './types'

export function replaceSubtractNegate(node: AlgebraNode): AlgebraNode {
  switch (node.type) {
    case 'add':
    case 'multiply':
    case 'divide':
      return {
        type: node.type,
        children: node.children.map(replaceSubtractNegate) as any,
      }
    case 'nat':
    case 'null':
      return node
    case 'negate': {
      if (node.children[0].type == 'negate') {
        return replaceSubtractNegate(node.children[0].children[0])
      } else if (node.children[0].type == 'nat') {
        return { type: 'nat', children: [], value: -node.children[0].value }
      } else {
        return {
          type: 'multiply',
          children: [
            { type: 'nat', value: -1, children: [] },
            replaceSubtractNegate(node.children[0]),
          ],
        }
      }
    }
    case 'subtract': {
      return {
        type: 'add',
        children: [
          replaceSubtractNegate(node.children[0]),
          replaceSubtractNegate({
            type: 'negate',
            children: [node.children[1]],
          }),
        ],
      }
    }
  }
}
