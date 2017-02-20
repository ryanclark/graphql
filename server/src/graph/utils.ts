import { FieldNode } from 'graphql';

export function getSelections(node: FieldNode) {
  return node.selectionSet.selections.map((selection) => {
    return (selection as FieldNode).name.value;
  });
}
