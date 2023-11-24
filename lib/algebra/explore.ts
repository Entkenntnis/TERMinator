import { print } from './print'
import { AlgebraNode } from './types'

export interface ExplorationMap {
  map: { [key: string]: ExplorationResult }
}

interface ExplorationResult {
  node: AlgebraNode
  distance: number
}

export async function explore(
  start: AlgebraNode,
  iterations: number,
  cutoff: number
) {
  const output: ExplorationMap = { map: {} }
  output.map[print(start)] = { node: start, distance: 0 }

  let previousMin = -1

  for (let i = 0; i < iterations; i++) {
    const values = Object.values(output.map)
    const min = Math.min(
      ...values.map((val) => val.distance).filter((x) => x > previousMin)
    )
    previousMin = min

    const todoList = values.filter((item) => item.distance == min)

    console.log('start of iteration', i)
    console.log('min distance', min, 'with', todoList.length, 'todo')

    const addNode = (additionalDistance: number, node: AlgebraNode) => {
      const newDistance = min + additionalDistance
      if (newDistance > cutoff) {
        // console.log('cutoff', newDistance)
        return
      }
      const newResult: ExplorationResult = {
        node,
        distance: newDistance,
      }
      const key = print(node)
      if (output.map[key]) {
        if (output.map[key].distance > newResult.distance) {
          output.map[key] = newResult
        }
      } else {
        output.map[key] = newResult
      }
    }

    for (const item of todoList) {
      visitTree(item.node, (n) => {
        // evaluate +-*
        if (
          (n.type == 'add' || n.type == 'subtract' || n.type == 'multiply') &&
          n.children[0].type == 'nat' &&
          n.children[1].type == 'nat'
        ) {
          const level =
            Math.max(n.children[0].level ?? 0, n.children[1].level ?? 0) + 1
          //console.log(level, print(item.node))
          addNode(
            level * 2,
            replaceInTree(item.node, n, {
              type: 'nat',
              value:
                n.type == 'add'
                  ? n.children[0].value + n.children[1].value
                  : n.type == 'subtract'
                  ? n.children[0].value - n.children[1].value
                  : n.children[0].value * n.children[1].value,
              children: [],
              level,
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
          const level =
            Math.max(n.children[0].level ?? 0, n.children[1].level ?? 0) + 1
          addNode(
            level * 2,
            replaceInTree(item.node, n, {
              type: 'nat',
              value: n.children[0].value / n.children[1].value,
              children: [],
            })
          )
        }
        // commutative
        if (n.type == 'add' || n.type == 'multiply') {
          addNode(
            1,
            replaceInTree(item.node, n, {
              type: n.type,
              children: [n.children[1], n.children[0]],
            })
          )
        }
        // associative
        if (n.type == 'add' || n.type == 'multiply') {
          if (n.children[0].type == n.type) {
            addNode(
              1,
              replaceInTree(item.node, n, {
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
            addNode(
              1,
              replaceInTree(item.node, n, {
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
        /*if (n.type == 'add') {
              if (n.children[1].type == 'negate') {
                newTodoList.push(
                  replaceInTree(item.node, n, {
                    type: 'subtract',
                    children: [n.children[0], n.children[1].children[0]],
                  })
                )
              }
            }*/
        /*if (n.type == 'subtract') {
              if (n.children[1].type == 'negate') {
                newTodoList.push(
                  replaceInTree(item.node, n, {
                    type: 'add',
                    children: [n.children[0], n.children[1].children[0]],
                  })
                )
              } else {
                newTodoList.push(
                  replaceInTree(item.node, n, {
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
            }*/
        /*if (n.type == 'add') {
              newTodoList.push(
                replaceInTree(item.node, n, {
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
            }*/
        /*if (n.type == 'subtract') {
              
            }*/
        // neg <-> mult interop
        /*if (n.type == 'negate') {
              newTodoList.push(
                replaceInTree(item.node, n, {
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
              newTodoList.push(
                replaceInTree(item.node, n, {
                  type: 'negate',
                  children: [n.children[1]],
                })
              )
            }*/
        // introduce neg
        /*if (n.type == 'nat') {
              newTodoList.push(
                replaceInTree(item.node, n, {
                  type: 'negate',
                  children: [{ type: 'nat', value: -n.value, children: [] }],
                })
              )
            }*/
        // distribute
        /*if (n.type == 'add') {
              if (
                n.children[0].type == 'multiply' &&
                n.children[1].type == 'multiply'
              ) {
                if (
                  print(n.children[0].children[0]) ==
                  print(n.children[1].children[0])
                ) {
                  newTodoList.push(
                    replaceInTree(item.node, n, {
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
                newTodoList.push(
                  replaceInTree(item.node, n, {
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
            }*/
      })
    }
    console.log('finished with', Object.keys(output.map).length)
    await new Promise((res) => setTimeout(res, 20))
  }

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
