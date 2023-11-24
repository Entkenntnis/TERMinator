export interface NatNode {
  type: 'nat'
  value: number
  children: []
}

export interface AddNode {
  type: 'add'
  children: [AlgebraNode, AlgebraNode]
}

export interface SubtractNode {
  type: 'subtract'
  children: [AlgebraNode, AlgebraNode]
}

export interface MultiplyNode {
  type: 'multiply'
  children: [AlgebraNode, AlgebraNode]
}

export interface DivideNode {
  type: 'divide'
  children: [AlgebraNode, AlgebraNode]
}

export interface NegateNode {
  type: 'negate'
  children: [AlgebraNode]
}

export interface NullNode {
  type: 'null'
  children: []
}

export type AlgebraNode =
  | NatNode
  | AddNode
  | SubtractNode
  | MultiplyNode
  | DivideNode
  | NegateNode
  | NullNode
