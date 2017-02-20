import { forEachChild, Node, NodeArray } from './node';
import { Document } from './parser';
import { InvalidPosition } from './types';

export class Cursor {
  currentArray = this.query.statements;
  currentIndex = 0;

  current = this.currentArray[this.currentIndex];
  lastPosition = InvalidPosition.Value;

  constructor(private query: Document) {}

  visitNode(node: Node, position: number) {
    if (position >= node.position && position < node.end) {
      forEachChild(
        node,
        (node: Node) => this.visitNode(node, position),
        (nodes: NodeArray<Node>) => this.visitArray(nodes, position)
      );

      return true;
    }

    return false;
  }

  visitArray(nodes: NodeArray<Node>, position: number) {
    if (position > nodes.position && position < nodes.end) {
      for (let i = 0; i < nodes.length; i++) {
        const child = nodes[i];
        if (child) {
          if (child.position === position) {
            this.currentArray = nodes;
            this.currentIndex = i;
            this.current = child;

            return true;
          } else {
            if (nodes.position < position && position < nodes.end) {
              forEachChild(
                child,
                (node: Node) => this.visitNode(node, position),
                (nodes: NodeArray<Node>) => this.visitNode(nodes, position)
              );

              return true;
            }
          }
        }
      }

      return false;
    }
  }

  currentNode(position: number) {
    if (position !== this.lastPosition) {
      if (this.current && this.current.end === position &&
          this.currentIndex < (this.currentArray.length - 1)) {
        this.currentIndex++;
        this.current = this.currentArray[this.currentIndex];
      }

      if (!this.current || this.current.position !== position) {
        this.currentArray = undefined;
        this.currentIndex = InvalidPosition.Value;
        this.current = undefined;

        // Recurse into the source file to find the highest node at this position.
        forEachChild(
          this.query,
          (node: Node) => this.visitNode(node, position),
          (nodes: NodeArray<Node>) => this.visitArray(nodes, position)
        );
      }
    }

    this.lastPosition = position;

    return this.current;
  }
}
