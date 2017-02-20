import { Node } from './node';
import { Kind } from './types';

export interface Visitor {
  [kind: number]: (node: Node) => any
}

export const BREAK = {};

export const QueryDocumentKeys = {
  [Kind.Name]: [],
  [Kind.Document]: ['definitions'],
  [Kind.OperationDefinition]: ['name', 'variableDefinitions', 'directives', 'selectionSet'],
  [Kind.VariableDefinition]: ['variable', 'type', 'defaultValue'],
  [Kind.Variable]: ['name'],
  [Kind.SelectionSet]: ['selections'],
  [Kind.Field]: ['alias', 'name', 'arguments', 'directives', 'selectionSet'],
  [Kind.Argument]: ['name', 'value'],
  [Kind.FragmentSpread]: ['name', 'directives'],
  [Kind.InlineFragment]: ['typeCondition', 'directives', 'selectionSet'],
  [Kind.FragmentDefinition]: ['name', 'typeCondition', 'directives', 'selectionSet'],
  [Kind.NumberLiteral]: [],
  [Kind.FloatLiteral]: [],
  [Kind.StringLiteral]: [],
  [Kind.Boolean]: [],
  [Kind.Null]: [],
  [Kind.Enum]: [],
  [Kind.List]: ['values'],
  [Kind.Object]: ['fields'],
  [Kind.ObjectField]: ['name', 'value'],
  [Kind.Directive]: ['name', 'arguments'],
  [Kind.NamedType]: ['name'],
  [Kind.ListType]: ['type'],
  [Kind.NonNullType]: ['type'],
  [Kind.SchemaDefinition]: ['directives', 'operationTypes'],
  [Kind.OperationTypeDefinition]: ['type'],
  [Kind.ScalarTypeDefinition]: ['name', 'directives'],
  [Kind.ObjectTypeDefinition]: ['name', 'interfaces', 'directives', 'fields'],
  [Kind.FieldDefinition]: ['name', 'arguments', 'type', 'directives'],
  [Kind.InputValueDefinition]: ['name', 'type', 'defaultValue', 'directives'],
  [Kind.InterfaceTypeDefinition]: ['name', 'directives', 'fields'],
  [Kind.UnionTypeDefinition]: ['name', 'directives', 'types'],
  [Kind.EnumTypeDefinition]: ['name', 'directives', 'values'],
  [Kind.EnumValueDefinition]: ['name', 'directives'],
  [Kind.InputObjectTypeDefinition]: ['name', 'directives', 'fields'],
  [Kind.TypeExtensionDefinition]: ['definition'],
  [Kind.DirectiveDefinition]: ['name', 'arguments', 'locations'],
};

export function visit(ast: Node, visitor: {enter?: Visitor, leave?: Visitor}) {
  const visitorKeys = QueryDocumentKeys;

  let stack;
  let inArray = Array.isArray(ast);
  let keys = [ast];
  let index = -1;
  let edits = [];
  let parent;
  const path = [];
  const ancestors = [];
  let newRoot = ast;

  do {
    index++;
    const isLeaving = index === keys.length;
    let key;
    let node;
    const isEdited = isLeaving && edits.length !== 0;
    if (isLeaving) {
      key = ancestors.length === 0 ? undefined : path.pop();
      node = parent;
      parent = ancestors.pop();
      if (isEdited) {
        if (inArray) {
          node = node.slice();
        } else {
          const clone = {};
          for (const k in node) {
            if (node.hasOwnProperty(k)) {
              clone[k] = node[k];
            }
          }
          node = clone;
        }
        let editOffset = 0;
        for (let ii = 0; ii < edits.length; ii++) {
          let editKey = edits[ii][0];
          const editValue = edits[ii][1];
          if (inArray) {
            editKey -= editOffset;
          }
          if (inArray && editValue === null) {
            node.splice(editKey, 1);
            editOffset++;
          } else {
            node[editKey] = editValue;
          }
        }
      }
      index = stack.index;
      keys = stack.keys;
      edits = stack.edits;
      inArray = stack.inArray;
      stack = stack.prev;
    } else {
      key = parent ? inArray ? index : keys[index] : undefined;
      node = parent ? parent[key] : newRoot;
      if (node === null || node === undefined) {
        continue;
      }
      if (parent) {
        path.push(key);
      }
    }

    let result;
    if (!Array.isArray(node)) {
      if (!isNode(node)) {
        throw new Error('Invalid AST Node: ' + JSON.stringify(node));
      }
      const visitFn = getVisitFn(visitor, node.kind, isLeaving);
      if (visitFn) {
        result = visitFn.call(visitor, node, key, parent, path, ancestors);

        if (result === BREAK) {
          break;
        }

        if (result === false) {
          if (!isLeaving) {
            path.pop();
            continue;
          }
        } else if (result !== undefined) {
          edits.push([key, result]);
          if (!isLeaving) {
            if (isNode(result)) {
              node = result;
            } else {
              path.pop();
              continue;
            }
          }
        }
      }
    }

    if (result === undefined && isEdited) {
      edits.push([key, node]);
    }

    if (!isLeaving) {
      stack = {inArray, index, keys, edits, prev: stack};
      inArray = Array.isArray(node);
      keys = inArray ? node : visitorKeys[node.kind] || [];
      index = -1;
      edits = [];
      if (parent) {
        ancestors.push(parent);
      }
      parent = node;
    }
  } while (stack !== undefined);

  if (edits.length !== 0) {
    newRoot = edits[edits.length - 1][1];
  }

  return newRoot;
}

function isNode(node: Node) {
  return node && typeof node.kind === 'number';
}

function getVisitFn(visitor: {enter?: Visitor, leave?: Visitor}, kind: Kind, isLeaving: boolean) {
  const kindVisitor = visitor[kind];
  if (kindVisitor) {
    if (!isLeaving && typeof kindVisitor === 'function') {
      return kindVisitor;
    }
    const kindSpecificVisitor =
      isLeaving ? kindVisitor.leave : kindVisitor.enter;
    if (typeof kindSpecificVisitor === 'function') {
      return kindSpecificVisitor;
    }
  } else {
    const specificVisitor = isLeaving ? visitor.leave : visitor.enter;
    if (specificVisitor) {
      if (typeof specificVisitor === 'function') {
        return specificVisitor;
      }
      const specificKindVisitor = specificVisitor[kind];
      if (typeof specificKindVisitor === 'function') {
        return specificKindVisitor;
      }
    }
  }
}
