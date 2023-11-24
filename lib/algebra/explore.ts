import { print } from './print'
import { AlgebraNode } from './types'

interface ExplorationMap {
  map: { [key: string]: ExplorationResult }
}

interface ExplorationResult {
  node: AlgebraNode
  pending: boolean
}

export function explore(start: AlgebraNode, depth: number) {
  const output: ExplorationMap = { map: {} }
  output.map[print(start)] = { node: start, pending: true }

  console.time('explore')

  for (let i = 0; i < depth; i++) {
    console.log('explore', i, Object.keys(output.map).length)
    Object.values(output.map)
      .filter((res) => res.pending)
      .forEach((input) => {
        const orig = print(input.node)
        output.map[orig].pending = false

        const results: AlgebraNode[] = []
        visitTree(input.node, (n) => {
          // evaluate +-*
          if (
            (n.type == 'add' || n.type == 'subtract' || n.type == 'multiply') &&
            n.children[0].type == 'nat' &&
            n.children[1].type == 'nat'
          ) {
            results.push(
              replaceInTree(input.node, n, {
                type: 'nat',
                value:
                  n.type == 'add'
                    ? n.children[0].value + n.children[1].value
                    : n.type == 'subtract'
                    ? n.children[0].value - n.children[1].value
                    : n.children[0].value * n.children[1].value,
                children: [],
              })
            )
          }
          // evaluate /
          if (
            n.type == 'divide' &&
            n.children[0].type == 'nat' &&
            n.children[1].type == 'nat' &&
            n.children[1].value != 0 &&
            n.children[0].value % n.children[1].value == 0
          ) {
            results.push(
              replaceInTree(input.node, n, {
                type: 'nat',
                value: n.children[0].value / n.children[1].value,
                children: [],
              })
            )
          }
          // commutative
          if (n.type == 'add' || n.type == 'multiply') {
            results.push(
              replaceInTree(input.node, n, {
                type: n.type,
                children: [n.children[1], n.children[0]],
              })
            )
          }
          // associative
          if (n.type == 'add' || n.type == 'multiply') {
            if (n.children[0].type == n.type) {
              results.push(
                replaceInTree(input.node, n, {
                  type: n.type,
                  children: [
                    n.children[0].children[0],
                    {
                      type: n.type,
                      children: [n.children[0].children[1], n.children[1]],
                    },
                  ],
                })
              )
            }
            if (n.children[1].type == n.type) {
              results.push(
                replaceInTree(input.node, n, {
                  type: n.type,
                  children: [
                    {
                      type: n.type,
                      children: [n.children[0], n.children[1].children[0]],
                    },
                    n.children[1].children[1],
                  ],
                })
              )
            }
          }
          // +- neg
          if (n.type == 'add') {
            if (n.children[1].type == 'negate') {
              results.push(
                replaceInTree(input.node, n, {
                  type: 'subtract',
                  children: [n.children[0], n.children[1].children[0]],
                })
              )
            }
          }
          if (n.type == 'subtract') {
            if (n.children[1].type == 'negate') {
              results.push(
                replaceInTree(input.node, n, {
                  type: 'add',
                  children: [n.children[0], n.children[1].children[0]],
                })
              )
            }
          }
          if (n.type == 'add') {
            results.push(
              replaceInTree(input.node, n, {
                type: 'subtract',
                children: [
                  n.children[0],
                  {
                    type: 'negate',
                    children: [n.children[1]],
                  },
                ],
              })
            )
          }
          if (n.type == 'subtract') {
            results.push(
              replaceInTree(input.node, n, {
                type: 'add',
                children: [
                  n.children[0],
                  {
                    type: 'negate',
                    children: [n.children[1]],
                  },
                ],
              })
            )
          }
          // neg <-> mult interop
          if (n.type == 'negate') {
            results.push(
              replaceInTree(input.node, n, {
                type: 'multiply',
                children: [
                  { type: 'nat', value: -1, children: [] },
                  n.children[0],
                ],
              })
            )
          }
          if (
            n.type == 'multiply' &&
            n.children[0].type == 'nat' &&
            n.children[0].value == -1
          ) {
            results.push(
              replaceInTree(input.node, n, {
                type: 'negate',
                children: [n.children[1]],
              })
            )
          }
          // introduce neg
          /*if (n.type == 'nat') {
            results.push(
              replaceInTree(input.node, n, {
                type: 'negate',
                children: [{ type: 'nat', value: -n.value, children: [] }],
              })
            )
          }*/
          // distribute
          if (n.type == 'add') {
            if (
              n.children[0].type == 'multiply' &&
              n.children[1].type == 'multiply'
            ) {
              if (
                print(n.children[0].children[0]) ==
                print(n.children[1].children[0])
              ) {
                results.push(
                  replaceInTree(input.node, n, {
                    type: 'multiply',
                    children: [
                      n.children[0].children[0],
                      {
                        type: 'add',
                        children: [
                          n.children[0].children[1],
                          n.children[1].children[1],
                        ],
                      },
                    ],
                  })
                )
              }
            }
          }
          if (n.type == 'multiply') {
            if (n.children[1].type == 'add') {
              results.push(
                replaceInTree(input.node, n, {
                  type: 'add',
                  children: [
                    {
                      type: 'multiply',
                      children: [n.children[0], n.children[1].children[0]],
                    },
                    {
                      type: 'multiply',
                      children: [n.children[0], n.children[1].children[1]],
                    },
                  ],
                })
              )
            }
          }
        })
        for (const result of results) {
          const key = print(result)
          if (!output.map[key]) {
            output.map[key] = { node: result, pending: true }
          }
        }
      })
  }
  console.timeEnd('explore')

  return output
}

function replaceInTree(
  current: AlgebraNode,
  target: AlgebraNode,
  replacement: AlgebraNode
): AlgebraNode {
  if (current == target) {
    return replacement
  } else {
    return {
      ...current,
      children: current.children.map((child) =>
        replaceInTree(child, target, replacement)
      ) as any,
    }
  }
}

function visitTree(node: AlgebraNode, cb: (node: AlgebraNode) => void) {
  cb(node)
  node.children.forEach((child) => visitTree(child, cb))
}
