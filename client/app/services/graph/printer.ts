import {
  Argument,
  BooleanValue,
  Directive,
  DirectiveDefinition,
  EnumValue,
  EnumTypeDefinition,
  EnumValueDefinition,
  Field,
  FieldDefinition,
  FloatValue,
  FragmentDefinition,
  FragmentSpread,
  InlineFragment,
  InputObjectTypeDefinition,
  InputValueDefinition,
  InterfaceTypeDefinition,
  IntValue,
  List,
  ListType,
  Name,
  NamedType,
  NonNullType,
  Object,
  ObjectField,
  ObjectTypeDefinition,
  OperationDefinition,
  OperationTypeDefinition,
  ScalarTypeDefinition,
  SchemaDefinition,
  SelectionSet,
  StringValue,
  TypeExtensionDefinition,
  UnionTypeDefinition,
  Variable,
  VariableDefinition
} from './interfaces';
import { Node } from './node';
import { Document } from './parser';
import { Kind } from './types';
import { visit, Visitor } from './visitor';

const indent = (str) => str && str.replace(/\n/g, '\n  ');
const join = (arr: any[], sep: string) => arr ? arr.filter((i) => !!i).join(sep) : '';

const block = (arr: any[]) => arr && arr.length !== 0 ? `${indent(`{\n${join(arr, '\n')}`)}\n}` : '{}';
const wrap = (s: string, m: any, e?: string) => !!m ? `${s}${m}${e}` : '';

const printer: Visitor = {
  [Kind.Name]: (node: Name) => node.value,
  [Kind.Variable]: (node: Variable) => `$${node.name}`,
  [Kind.Document]: (node: Document) => join(node.definitions, '\n\n') + '\n',
  [Kind.OperationDefinition]: (node: OperationDefinition) => {
    const varDefs = wrap('(', join(node.variableDefinitions, ', '), ')');
    if (!node.name && !node.directives && !varDefs && node.operation === 'query') {
      return node.selectionSet;
    }

    return [
      node.operation, node.name, varDefs, node.directives || '', node.selectionSet
    ].join(' ');
  },
  [Kind.VariableDefinition]: (node: VariableDefinition) =>
    `${node.variable}: ${node.type} ${wrap(' = ', node.defaultValue)}`,
  [Kind.SelectionSet]: (node: SelectionSet) => block(node.selections),
  [Kind.Field]: (node: Field) => join(
    [
      `${wrap('', node.alias, ': ')}${node.name}${wrap('(', join(node.arguments, ', '), ')')}`,
      join(node.directives, ' '),
      node.selectionSet
    ],
    ' '
  ),
  [Kind.Argument]: (node: Argument) => `${node.name}: ${node.value}`,
  [Kind.FragmentSpread]: (node: FragmentSpread) =>
    `...${node.name}${wrap(' ', join(node.directives, ' '))}`,
  [Kind.InlineFragment]: (node: InlineFragment) => join(
    [
      '...',
      wrap('on ', node.typeCondition),
      join(node.directives, ' '),
      node.selectionSet
    ],
    ' '
  ),
  [Kind.NumberLiteral]: (node: IntValue) => node.value,
  [Kind.FloatLiteral]: (node: FloatValue) => node.value,
  [Kind.StringLiteral]: (node: StringValue) => JSON.stringify(node.value),
  [Kind.Boolean]: (node: BooleanValue) => JSON.stringify(node.value),
  [Kind.Null]: () => 'null',
  [Kind.Enum]: (node: EnumValue) => node.value,
  [Kind.List]: (node: List) => `[${join(node.values, ', ')}]`,
  [Kind.Object]: (node: Object) => `{${join(node.fields, ', ')}}`,
  [Kind.ObjectField]: (node: ObjectField) => `${node.name}: ${node.value}`,
  [Kind.FragmentDefinition]: (node: FragmentDefinition) =>
  `fragment ${node.name} on ${node.typeCondition}
  ${node.directives ? node.directives.join(' ') : ''}
  ${node.selectionSet}
  `,
  [Kind.Directive]: (node: Directive) => `@${node.name}${wrap('(', join(node.arguments, ', '), ')')}`,
  [Kind.NamedType]: (node: NamedType) => node.name,
  [Kind.ListType]: (node: ListType) => `[${node.type}]`,
  [Kind.NonNullType]: (node: NonNullType) => `${node.type}!`,
  [Kind.SchemaDefinition]: (node: SchemaDefinition) =>
    join(['schema', join(node.directives, ' '), block(node.operationTypes)], ' '),
  [Kind.OperationTypeDefinition]: (node: OperationTypeDefinition) => `${node.operation}: ${node.type}`,
  [Kind.ScalarTypeDefinition]: (node: ScalarTypeDefinition) =>
    join(['scalar', node.name, join(node.directives, ' ')], ' '),
  [Kind.ObjectTypeDefinition]: (node: ObjectTypeDefinition) => join(
    [
      'type',
      node.name,
      wrap('implements ', join(node.interfaces, ', ')),
      join(node.directives, ' '),
      block(node.fields)
    ],
    ' '
  ),
  [Kind.FieldDefinition]: (node: FieldDefinition) =>
    `${node.name}${wrap('(', join(node.arguments, ', '), ')')}: ${node.type}${wrap(' ', join(node.directives, ' '))}`,
  [Kind.InputValueDefinition]: (node: InputValueDefinition) =>
    join([`${node.name}: ${node.type}`, wrap('= ', node.defaultValue), join(node.directives, ' ')], ' '),
  [Kind.InterfaceTypeDefinition]: (node: InterfaceTypeDefinition) =>
    join(['interface', node.name, join(node.directives, ' '), block(node.fields)], ' '),
  [Kind.UnionTypeDefinition]: (node: UnionTypeDefinition) =>
    join(['union', node.name, join(node.directives, ' '), '= ' + join(node.types, ' | ')], ' '),
  [Kind.EnumTypeDefinition]: (node: EnumTypeDefinition) =>
    join(['enum', node.name, join(node.directives, ' '), block(node.values)], ' '),
  [Kind.EnumValueDefinition]: (node: EnumValueDefinition) =>
    join([node.name, join(node.directives, ' ')], ' '),
  [Kind.InputObjectTypeDefinition]: (node: InputObjectTypeDefinition) =>
    join(['input', node.name, join(node.directives, ' '), block(node.fields)], ' '),
  [Kind.TypeExtensionDefinition]: (node: TypeExtensionDefinition) => `extend ${node.definition}`,
  [Kind.DirectiveDefinition]: (node: DirectiveDefinition) =>
    `directive @${node.name}${wrap('(', join(node.arguments, ', '), ')')} on ${join(node.locations, ' | ')}`
};

export const print = (ast: Node) => visit(ast, {leave: printer}).toString();
