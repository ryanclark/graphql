import { Kind } from './types';

export interface TextRange {
  position?: number;
  end?: number;
}

export interface Node extends TextRange {
  kind: Kind;
  id: number;
  parent: Node;
  original: Node;
  startsOnNewLine?: boolean;
  nextContainer?: Node;
}

export interface NodeArray<T extends Node> extends Array<T>, TextRange {}

export class Node {
  id = 0;
  parent: Node;
  original: Node;

  constructor(
    public kind: Kind,
    public position?: number,
    public end?: number
  ) {}
}

export function createNode(kind: Kind, position?: number, end?: number) {
  const NodeConstructor = Node;
  const NameConstructor = Node;
  const TokenConstructor = Node;
  const QueryConstructor = Node;
  if (kind === Kind.Query) {
    console.log(QueryConstructor);
    return new QueryConstructor(kind, position, end);
  }
  if (kind === Kind.Name) {
    return new NameConstructor(kind, position, end);
  }
  if (kind < Kind.FirstNode) {
    return new TokenConstructor(kind, position, end);
  }
  return new NodeConstructor(kind, position, end);
}

export function visitEachNode() {

}

export function visitNodeArray() {

}

export function forEachChild<T>(
  node: Node,
  nodeCallback: (node: Node) => T,
  arrayCallback?: (nodes: Node[]) => T) {
  const visitNodes = arrayCallback ? visitNodeArray : visitEachNode;
  const nodesCallback = arrayCallback || nodeCallback;
}
