import { Node, NodeArray } from './node';
import { Kind } from './types';

export interface Argument extends Node {
  kind: Kind.Argument,
  name: Name,
  value: ValueLiteral
}

export interface Directive extends Value {
  kind: Kind.Directive,
  name: Name,
  arguments?: NodeArray<Argument>
}

export interface FragmentDefinition extends Node {
  kind: Kind.FragmentDefinition,
  directives?: NodeArray<Directive>,
  name: Name,
  selectionSet?: SelectionSet,
  typeCondition: NamedType
}

export interface FragmentSpread extends Node {
  kind: Kind.FragmentSpread,
  directives: NodeArray<Directive>,
  name?: Name
}

export interface List extends Node {
  kind: Kind.List,
  values: NodeArray<Value>
}

export interface Name extends Node {
  kind: Kind.Name,
  value: string
}

export interface Object extends Node {
  kind: Kind.Object,
  fields: NodeArray<ObjectField>
}

export interface ObjectField extends Node {
  kind: Kind.ObjectField,
  name: Name,
  value: ValueLiteral
}

export interface OperationDefinition extends Node {
  kind: Kind.OperationDefinition,
  directives?: NodeArray<Directive>,
  operation: string,
  name: Name,
  selectionSet: SelectionSet,
  variableDefinitions?: NodeArray<VariableDefinition>
}

export interface SelectionSet extends Node {
  kind: Kind.SelectionSet,
  selections: NodeArray<Selection>
}

export interface Variable extends Node {
  kind: Kind.Variable,
  name: Name
}

export interface VariableDefinition extends Node {
  kind: Kind.VariableDefinition,
  defaultValue?: ValueLiteral,
  type: Type,
  variable: Variable
}

/**
 Values
 **/

export interface BooleanValue extends Value {
  kind: Kind.Boolean,
  value: boolean
}

export interface EnumValue extends Value {
  kind: Kind.Enum,
  value: string
}

export interface FloatValue extends Value {
  kind: Kind.FloatLiteral,
  value: number
}

export interface IntValue extends Value {
  kind: Kind.NumberLiteral,
  value: number
}

export interface NullValue extends Value {
  kind: Kind.Null,
  value: null
}

export interface StringValue extends Value {
  kind: Kind.StringLiteral,
  value: string
}

export interface Value extends Node {
  value?: any
}

export type ValueLiteral = Value | List | Object;

/**
 Types
 **/

export interface ListType extends Type {
  kind: Kind.List
}

export interface NamedType extends Type {
  kind: Kind.NamedType,
  name: Name
}

export interface NonNullType extends Type {
  kind: Kind.NonNullType
}

export interface Type extends Node {
  type?: Type
}

/**
 Definitions
 */

export interface DirectiveDefinition extends Definition {
  kind: Kind.DirectiveDefinition,
  arguments?: NodeArray<InputValueDefinition>,
  name: Name,
  locations: NodeArray<Name>
}

export interface EnumTypeDefinition extends Definition {
  kind: Kind.EnumTypeDefinition,
  directives?: NodeArray<Directive>,
  name: Name,
  values: NodeArray<EnumValueDefinition>
}

export interface EnumValueDefinition extends Definition {
  kind: Kind.EnumValueDefinition,
  directives?: NodeArray<Directive>,
  name: Name
}

export interface FieldDefinition extends Definition {
  kind: Kind.FieldDefinition,
  arguments?: NodeArray<InputValueDefinition>,
  directives?: NodeArray<Directive>,
  name: Name,
  type?: Type
}

export interface InputObjectTypeDefinition extends Definition {
  kind: Kind.InputObjectTypeDefinition,
  directives?: NodeArray<Directive>,
  fields: NodeArray<InputValueDefinition>,
  name: Name
}

export interface InputValueDefinition extends Definition {
  kind: Kind.InputValueDefinition,
  defaultValue?: ValueLiteral,
  directives?: NodeArray<Directive>,
  name: Name,
  type?: Type
}

export interface InterfaceTypeDefinition extends Definition {
  kind: Kind.InterfaceTypeDefinition,
  directives?: NodeArray<Directive>,
  fields?: NodeArray<FieldDefinition>,
  interfaces?: NodeArray<NamedType>,
  name: Name
}

export interface ObjectTypeDefinition extends Definition {
  kind: Kind.ObjectTypeDefinition,
  directives?: NodeArray<Directive>,
  fields?: NodeArray<FieldDefinition>,
  interfaces?: NodeArray<NamedType>,
  name: Name
}

export interface OperationTypeDefinition extends Definition {
  kind: Kind.OperationTypeDefinition,
  operation: 'query' | 'mutation' | 'subscription',
  type: NamedType
}

export interface ScalarTypeDefinition extends Definition {
  kind: Kind.ScalarTypeDefinition,
  directives?: NodeArray<Directive>,
  name: Name
}

export interface SchemaDefinition extends Definition {
  kind: Kind.SchemaDefinition,
  directives?: NodeArray<Directive>,
  operationTypes?: NodeArray<OperationTypeDefinition>
}

export interface TypeExtensionDefinition extends Definition {
  kind: Kind.TypeExtensionDefinition,
  definition: ObjectTypeDefinition
}

export interface UnionTypeDefinition extends Definition {
  kind: Kind.UnionTypeDefinition,
  directives?: NodeArray<Directive>,
  name: Name,
  types?: NodeArray<NamedType>
}

export interface Definition extends Node {}

/**
 Selection
 **/
export interface Field extends Selection {
  kind: Kind.Field,
  arguments?: NodeArray<Argument>,
  alias: Name,
  name: Name
}

export interface InlineFragment extends Node {
  kind: Kind.InlineFragment,
  directives?: NodeArray<Directive>,
  selectionSet?: SelectionSet,
  typeCondition?: NamedType
}


export interface Selection extends Node {
  directives?: NodeArray<Directive>,
  selectionSet?: SelectionSet
}
