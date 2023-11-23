export interface NatNode {
  type: 'nat'
  value: number
}

export interface AddNode {
  type: 'add'
  left: AlgebraNode
  right: AlgebraNode
}

export interface SubtractNode {
  type: 'subtract'
  left: AlgebraNode
  right: AlgebraNode
}

export interface MultiplyNode {
  type: 'multiply'
  left: AlgebraNode
  right: AlgebraNode
}

export interface DivideNode {
  type: 'divide'
  left: AlgebraNode
  right: AlgebraNode
}

export interface NegateNode {
  type: 'negate'
  child: AlgebraNode
}

export interface NullNode {
  type: 'null'
}

export type AlgebraNode =
  | NatNode
  | AddNode
  | SubtractNode
  | MultiplyNode
  | DivideNode
  | NegateNode
  | NullNode
