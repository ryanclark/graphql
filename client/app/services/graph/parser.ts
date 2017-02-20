import { Scanner } from './scanner';
import { Context, ErrorCode, Kind, kindToText } from './types';
import { createNode, Node, NodeArray } from './node';
import { Cursor } from './cursor';

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
  NullValue,
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

export class Document extends Node {
  definitions: NodeArray<Node>;
  statements: Node[] = [];
}

export class Parser {
  context = Context.SourceElements;
  currentToken: Kind;
  cursor: Cursor;
  scanner = new Scanner(this.text, (error) => this.handleError(error));

  constructor(private text: string) {
    this.scanner.setTextPosition(0);
  }

  consumeNode(node: Node) {
    this.scanner.setTextPosition(node.end);
    this.next();
    return node;
  }

  createNodeArray<T extends Node>(elements?: T[], pos?: number): NodeArray<T> {
    const array = <NodeArray<T>>(elements || []);
    if (!(pos >= 0)) {
      pos = this.scanner.startPosition;
    }
    array.position = pos;
    array.end = pos;
    return array;
  }

  currentNode() {
    return this.cursor.currentNode(this.scanner.startPosition);
  }

  finishNode<T extends Node>(node: T, end?: number): T {
    node.end = end === undefined ? this.scanner.startPosition : end;

    return node;
  }


  handleError(error: ErrorCode) {
  }

  isListElement(context: Context) {
    const node = this.currentNode();

    if (node) {
      return true;
    }

    switch (context) {
      case Context.Arguments:
        return this.currentToken !== Kind.CloseParenthesisToken;
      case Context.Variables:
        return this.currentToken === Kind.DollarToken || this.currentToken === Kind.Name;
      case Context.SourceElements:
        return this.currentToken === Kind.OpenBraceToken || this.currentToken === Kind.Name;
      case Context.EnumType:
      case Context.FieldDefinition:
      case Context.InputValue:
      case Context.Object:
      case Context.OperationTypeDefinition:
      case Context.SelectionSet:
        return this.currentToken !== Kind.CloseBraceToken;
      case Context.Directives:
        return this.currentToken !== Kind.OpenParenthesisToken;
      case Context.UnionTypeDefinition:
        return this.currentToken === Kind.Name;
      case Context.Locations:
      case Context.ImplementsInterfaces:
        return this.currentToken === Kind.Name || this.currentToken === Kind.PipeToken;
    }
  }

  isListTerminator(context: Context) {
    if (this.currentToken === Kind.EOF) {
      return true;
    }
    switch (context) {
      case Context.Arguments:
      case Context.Variables:
        return this.currentToken === Kind.CloseParenthesisToken;
      case Context.EnumType:
      case Context.FieldDefinition:
      case Context.InputValue:
      case Context.Object:
      case Context.OperationTypeDefinition:
      case Context.SelectionSet:
        return this.currentToken === Kind.CloseBraceToken;
      case Context.Directives:
        return this.currentToken === Kind.OpenParenthesisToken;
      case Context.UnionTypeDefinition:
        return this.currentToken !== Kind.Name;
      case Context.Locations:
      case Context.ImplementsInterfaces:
        return this.currentToken === Kind.Name || this.currentToken === Kind.PipeToken;
    }
    return false;
  }

  next() {
    this.currentToken = this.scanner.scan();
    return this.currentToken;
  }

  parse() {
    const document = new Document(Kind.Document);

    this.next();
    this.cursor = new Cursor(document);

    document.definitions = this.parseList(Context.SourceElements, () => this.parseDefinition());

    return document;
  }

  parseArgument() {
    const node = createNode(Kind.Argument, this.scanner.startPosition) as Argument;
    node.name = this.parseName();
    this.parseExpected(Kind.ColonToken);
    node.value = this.parseValue(false);
    return this.finishNode(node);
  }

  parseArgumentDefinitions() {
    if (this.currentToken === Kind.OpenParenthesisToken) {
      this.parseExpected(Kind.OpenParenthesisToken);

      const args = this.parseList<InputValueDefinition>(Context.Arguments, () => this.parseInputValueDefinition());

      this.parseExpected(Kind.CloseParenthesisToken);

      return args;
    }
  }

  parseArguments() {
    if (this.currentToken === Kind.OpenParenthesisToken) {
      this.parseExpected(Kind.OpenParenthesisToken);

      const args = this.parseList<Argument>(Context.Arguments, () => this.parseArgument());
      this.parseExpected(Kind.CloseParenthesisToken);

      return args;
    }
  }

  parseConstValue() {
    return this.parseValue(true);
  }

  parseDefinition() {
    switch (this.currentToken) {
      case Kind.OpenBraceToken:
        return this.parseOperationDefinition();
      case Kind.Name:
        return this.parseNameDefinition();
    }

    throw new Error('Unexpected');
  }

  parseDirective() {
    const node = createNode(Kind.Directive, this.scanner.startPosition) as Directive;

    this.parseExpected(Kind.AtToken);

    node.name = this.parseName();
    node.arguments = this.parseArguments();

    return this.finishNode(node);
  }

  parseDirectiveDefinition() {
    const node = createNode(Kind.DirectiveDefinition, this.scanner.startPosition) as DirectiveDefinition;

    this.parseExpectedKeyword('directive');
    this.parseExpected(Kind.AtToken);

    node.name = this.parseName();
    node.arguments = this.parseArgumentDefinitions();

    this.parseExpectedKeyword('on');

    node.locations = this.parseList<Name>(Context.Locations, () => this.parseName());

    return this.finishNode(node);
  }

  parseDirectives() {
    const result = this.createNodeArray<Directive>();
    while (this.currentToken === Kind.AtToken) {
      result.push(this.parseDirective());
    }
    result.end = this.scanner.startPosition;
    return result;
  }

  parseEnumTypeDefinition() {
    const node = createNode(Kind.EnumTypeDefinition, this.scanner.startPosition) as EnumTypeDefinition;

    this.parseExpectedKeyword('enum');

    node.name = this.parseName();
    node.directives = this.parseDirectives();
    this.parseExpected(Kind.OpenBraceToken);
    node.values = this.parseList<EnumValueDefinition>(Context.EnumType, () => this.parseEnumValueDefinition());
    this.parseExpected(Kind.CloseBraceToken);

    return this.finishNode(node);
  }

  parseEnumValueDefinition() {
    const node = createNode(Kind.EnumValueDefinition, this.scanner.startPosition) as EnumValueDefinition;

    node.name = this.parseName();
    node.directives = this.parseDirectives();

    return this.finishNode(node);
  }

  parseError(error: ErrorCode, value?: any) {
    switch (error) {
      case ErrorCode.UNEXPECTED_TOKEN:
        throw new Error(`Unexpected token ${value} at ${this.scanner.startPosition}.
        `);
    }
  }

  parseExpected(kind: Kind) {
    if (this.currentToken === kind) {
      this.next();
      return true;
    }
    this.parseError(ErrorCode.UNEXPECTED_TOKEN, kindToText[kind]);
    return false;
  }

  parseExpectedKeyword(keyword: string) {
    if (this.currentToken === Kind.Name && this.scanner.tokenValue === keyword) {
      this.next();
      return true;
    }
    return false;
  }

  parseField() {
    const node = createNode(Kind.Field, this.scanner.startPosition) as Field;
    const nameOrAlias = this.parseName();

    let alias;
    let name = nameOrAlias;

    if (this.currentToken === Kind.ColonToken) {
      this.parseExpected(Kind.ColonToken);
      alias = nameOrAlias;
      name = this.parseName();
    }

    node.alias = alias;
    node.name = name;
    node.arguments = this.parseArguments();
    node.directives = this.parseDirectives();

    if (this.currentToken === Kind.OpenBraceToken) {
      node.selectionSet = this.parseSelectionSet();
    }

    return this.finishNode(node);
  }

  parseFieldDefinition() {
    const node = createNode(Kind.FieldDefinition, this.scanner.startPosition) as FieldDefinition;

    node.name = this.parseName();
    node.arguments = this.parseArgumentDefinitions();
    this.parseExpected(Kind.ColonToken);
    node.type = this.parseTypeReference();
    node.directives = this.parseDirectives();

    return this.finishNode(node);
  }

  parseFragment() {
    const start = this.scanner.startPosition;
    this.parseExpected(Kind.SpreadToken);

    if (this.currentToken === Kind.Name && this.scanner.tokenValue !== 'on') {
      const node = createNode(Kind.FragmentSpread, start) as FragmentSpread;
      node.name = this.parseFragmentName();
      node.directives = this.parseDirectives();

      return this.finishNode(node);
    }

    let typeCondition;
    if (this.scanner.tokenValue === 'on') {
      this.next();
      typeCondition = this.parseNamedType();
    }

    const node = createNode(Kind.InlineFragment, start) as InlineFragment;

    node.typeCondition = typeCondition;
    node.directives = this.parseDirectives();
    node.selectionSet = this.parseSelectionSet();

    return this.finishNode(node);
  }

  parseFragmentDefinition() {
    const node = createNode(Kind.FragmentDefinition) as FragmentDefinition;
    this.parseExpectedKeyword('fragment');
    node.name = this.parseFragmentName();

    this.parseExpectedKeyword('on');
    node.typeCondition = this.parseNamedType();
    node.directives = this.parseDirectives();
    node.selectionSet = this.parseSelectionSet();

    return this.finishNode(node);
  }

  parseFragmentName() {
    if (this.scanner.tokenValue === 'on') {
      throw new Error('Unexpected name');
    }
    return this.parseName();
  }

  parseImplementsInterfaces() {
    if (this.scanner.tokenValue === 'implements') {
      this.next();
      return this.parsePipedList<NamedType>(Context.ImplementsInterfaces, () => this.parseNamedType());
    }
  }

  parseInputObjectTypeDefinition() {
    const node = createNode(Kind.InputObjectTypeDefinition) as InputObjectTypeDefinition;

    node.name = this.parseName();
    node.directives = this.parseDirectives();

    this.parseExpected(Kind.OpenBraceToken);
    node.fields = this.parseList<InputValueDefinition>(Context.InputValue, () => this.parseInputValueDefinition());
    this.parseExpected(Kind.CloseBraceToken);

    return this.finishNode(node);
  }

  parseInputValueDefinition() {
    const node = createNode(Kind.InputValueDefinition) as InputValueDefinition;

    node.name = this.parseName();
    this.parseExpected(Kind.ColonToken);
    node.type = this.parseTypeReference();
    if (this.currentToken === Kind.EqualsToken) {
      this.next();
      node.defaultValue = this.parseConstValue();
    }
    node.directives = this.parseDirectives();

    return this.finishNode(node);
  }

  parseInterfaceTypeDefinition() {
    const node = createNode(Kind.InterfaceTypeDefinition) as InterfaceTypeDefinition;

    this.parseExpectedKeyword('interface');

    node.name = this.parseName();
    node.directives = this.parseDirectives();

    if (this.currentToken === Kind.OpenBraceToken) {
      this.parseExpected(Kind.OpenBraceToken);
      node.fields = this.parseList<FieldDefinition>(Context.FieldDefinition, () => this.parseFieldDefinition());
      this.parseExpected(Kind.CloseBraceToken)
    }

    return this.finishNode(node);
  }

  parseList<T extends Node>(context: Context, parse: () => T) {
    const saveContext = this.context;
    this.context |= 1 << context;

    const result = this.createNodeArray<T>();
    while (!this.isListTerminator(context)) {
      if (this.isListElement(context)) {
        const element = this.parseListElement<T>(parse);
        result.push(element);

        continue;
      }

      this.next();
    }

    result.end = this.scanner.startPosition;
    this.context = saveContext;
    return result;
  }

  parseListElement<T extends Node>(parse: () => T) {
    const node = this.currentNode();
    if (node) {
      return this.consumeNode(node) as T;
    }
    return parse();
  }

  parseListItems(isConst: boolean) {
    const node = createNode(Kind.List, this.scanner.startPosition) as List;

    this.parseExpected(Kind.OpenBracketToken);

    const method = isConst ? this.parseConstValue : this.parseValueValue;
    node.values = this.parseList(Context.List, () => method());

    this.parseExpected(Kind.CloseBracketToken);

    return this.finishNode(node);
  }

  parseName() {
    const node = createNode(Kind.Name, this.scanner.startPosition) as Name;
    node.value = this.scanner.tokenValue;
    this.next();
    return this.finishNode(node);
  }

  parseNameDefinition() {
    switch (this.scanner.tokenValue) {
      case 'query':
      case 'mutation':
      case 'subscription':
        return this.parseOperationDefinition();
      case 'fragment':
        return this.parseFragmentDefinition();
      case 'schema':
      case 'scalar':
      case 'type':
      case 'interface':
      case 'union':
      case 'enum':
      case 'input':
      case 'extend':
      case 'directive':
        return this.parseTypeSystemDefinition();
    }

    throw new Error('Unexpected');
  }

  parseNamedType() {
    const node = createNode(Kind.NamedType, this.scanner.startPosition) as NamedType;
    node.name = this.parseName();
    return this.finishNode(node);
  }

  parseObject(isConst: boolean) {
    const node = createNode(Kind.Object, this.scanner.startPosition) as Object;

    this.parseExpected(Kind.OpenBraceToken);
    node.fields = this.parseList<ObjectField>(Context.Object, () => this.parseObjectField(isConst));
    this.parseExpected(Kind.CloseBraceToken);

    return this.finishNode(node);
  }

  parseObjectField(isConst: boolean) {
    const node = createNode(Kind.ObjectField, this.scanner.startPosition) as ObjectField;

    node.name = this.parseName();
    this.parseExpected(Kind.ColonToken);
    node.value = this.parseValue(isConst);

    return this.finishNode(node);
  }

  parseObjectTypeDefinition() {
    const node = createNode(Kind.ObjectTypeDefinition, this.scanner.startPosition) as ObjectTypeDefinition;

    this.parseExpectedKeyword('type');

    node.name = this.parseName();
    node.interfaces = this.parseImplementsInterfaces();
    node.directives = this.parseDirectives();

    if (this.currentToken === Kind.OpenBraceToken) {
      this.parseExpected(Kind.OpenBraceToken);
      node.fields = this.parseList<FieldDefinition>(Context.FieldDefinition, () => this.parseFieldDefinition());
      this.parseExpected(Kind.CloseBraceToken)
    }

    return this.finishNode(node);
  }

  parseOperationDefinition() {
    const start = this.scanner.startPosition;

    if (this.currentToken === Kind.OpenBraceToken) {
      const node = createNode(Kind.OperationDefinition, start) as OperationDefinition;

      node.directives = this.parseDirectives();
      node.selectionSet = this.parseSelectionSet();

      return this.finishNode(node);
    }

    const node = createNode(Kind.OperationDefinition, start) as OperationDefinition;
    node.operation = this.parseOperationType();
    if (this.currentToken === Kind.Name) {
      node.name = this.parseName();
    }
    node.variableDefinitions = this.parseVariableDefinitions();
    node.directives = this.parseDirectives();
    node.selectionSet = this.parseSelectionSet();

    return this.finishNode(node);
  }

  parseOperationType() {
    const value = this.scanner.tokenValue;

    this.parseExpected(Kind.Name);

    switch (value) {
      case 'query':
      case 'mutation':
      case 'subscription':
        return value;
    }
  }

  parseOperationTypeDefinition() {
    const node = createNode(Kind.OperationTypeDefinition, this.scanner.startPosition) as OperationTypeDefinition;

    node.operation = this.parseOperationType();

    this.parseExpected(Kind.ColonToken);

    node.type = this.parseNamedType();

    return this.finishNode(node);
  }

  parsePipedList<T extends Node>(context: Context, parse: () => T) {
    const saveContext = this.context;
    this.context |= 1 << context;

    const result = this.createNodeArray<T>();
    while (true) {
      if (this.isListElement(this.context)) {
        const element = this.parseListElement<T>(parse);
        result.push(element);

        if (this.isListTerminator(this.context)) {
          break;
        }

        this.parseExpected(Kind.PipeToken);
      }
    }

    result.end = this.scanner.startPosition;
    this.context = saveContext;
    return result;
  }

  parseScalarTypeDefinition() {
    const node = createNode(Kind.ScalarTypeDefinition, this.scanner.startPosition) as ScalarTypeDefinition;

    this.parseExpectedKeyword('scalar');

    node.name = this.parseName();
    node.directives = this.parseDirectives();

    return this.finishNode(node);
  }

  parseSchemaDefinition() {
    const node = createNode(Kind.SchemaDefinition, this.scanner.startPosition) as SchemaDefinition;

    this.parseExpectedKeyword('schema');

    node.directives = this.parseDirectives();

    if (this.currentToken === Kind.OpenBraceToken) {
      this.parseExpected(Kind.OpenBraceToken);
      node.operationTypes = this.parseList<OperationTypeDefinition>(Context.OperationTypeDefinition, () => this.parseOperationTypeDefinition());
      this.parseExpected(Kind.CloseBraceToken)
    }

    return this.finishNode(node);
  }

  parseSelection() {
    if (this.currentToken === Kind.SpreadToken) {
      return this.parseFragment();
    }
    return this.parseField();
  }

  parseSelectionSet() {
    const node = createNode(Kind.SelectionSet, this.scanner.startPosition) as SelectionSet;
    this.parseExpected(Kind.OpenBraceToken);
    node.selections = this.parseList(Context.SelectionSet, () => this.parseSelection());
    this.parseExpected(Kind.CloseBraceToken);
    return this.finishNode(node);
  }

  parseTypeExtensionDefinition() {
    const node = createNode(Kind.TypeExtensionDefinition, this.scanner.startPosition) as TypeExtensionDefinition;

    this.parseExpectedKeyword('extend');

    node.definition = this.parseObjectTypeDefinition();

    return this.finishNode(node);
  }

  parseTypeReference() {
    const start = this.scanner.startPosition;

    let type: Node;
    if (this.currentToken === Kind.OpenBracketToken) {
      const node = createNode(Kind.ListType, start) as ListType;

      this.parseExpected(Kind.OpenBracketToken);

      const reference = this.parseTypeReference();
      this.parseExpected(Kind.CloseBracketToken);

      node.type = reference;

      type = this.finishNode(node);
    } else {
      type = this.parseNamedType();
    }

    if (this.currentToken === Kind.ExclamationToken) {
      this.parseExpected(Kind.ExclamationToken);

      const node = createNode(Kind.NonNullType, start) as NonNullType;
      node.type = type;

      return this.finishNode(node);
    }

    return type;
  }

  parseTypeSystemDefinition() {
    if (this.currentToken === Kind.Name) {
      switch (this.scanner.tokenValue) {
        case 'schema':
          return this.parseSchemaDefinition();
        case 'scalar':
          return this.parseScalarTypeDefinition();
        case 'type':
          return this.parseObjectTypeDefinition();
        case 'interface':
          return this.parseInterfaceTypeDefinition();
        case 'union':
          return this.parseUnionTypeDefinition();
        case 'enum':
          return this.parseEnumTypeDefinition();
        case 'input':
          return this.parseInputObjectTypeDefinition();
        case 'extend':
          return this.parseTypeExtensionDefinition();
        case 'directive':
          return this.parseDirectiveDefinition();
      }
    }

    throw new Error('Unexpected');
  }

  parseUnionTypeDefinition() {
    const node = createNode(Kind.UnionTypeDefinition, this.scanner.startPosition) as UnionTypeDefinition;

    this.parseExpectedKeyword('union');

    node.name = this.parseName();
    node.directives = this.parseDirectives();

    this.parseExpected(Kind.EqualsToken);

    node.types = this.parseList<NamedType>(Context.ImplementsInterfaces, () => this.parseNamedType());

    return this.finishNode(node);
  }

  parseValue(isConst: boolean): Node {
    const start = this.scanner.startPosition;


    switch (this.currentToken) {
      case Kind.OpenBracketToken:
        return this.parseListItems(isConst);
      case Kind.OpenBraceToken:
        return this.parseObject(isConst);
      case Kind.NumberLiteral: {
        this.next();
        const node = createNode(Kind.NumberLiteral, start) as IntValue;
        node.value = parseInt(this.scanner.tokenValue, 10);
        return this.finishNode(node);
      }
      case Kind.FloatLiteral: {
        this.next();
        const node = createNode(Kind.FloatLiteral, start) as FloatValue;
        node.value = parseFloat(this.scanner.tokenValue);
        return this.finishNode(node);
      }
      case Kind.StringLiteral: {
        this.next();
        const node = createNode(Kind.StringLiteral, start) as StringValue;
        node.value = this.scanner.tokenValue;
        return this.finishNode(node);
      }
      case Kind.Name: {
        this.next();
        if (this.scanner.tokenValue === 'true' || this.scanner.tokenValue === 'false') {
          const node = createNode(Kind.Boolean, start) as BooleanValue;
          node.value = this.scanner.tokenValue === 'true';
          return this.finishNode(node);
        }
        if (this.scanner.tokenValue === 'null') {
          const node = createNode(Kind.Null, start) as NullValue;
          return this.finishNode(node);
        }
        const node = createNode(Kind.Enum, start) as EnumValue;
        node.value = this.scanner.tokenValue;
        return this.finishNode(node);
      }
      case Kind.DollarToken:
        if (!isConst) {
          return this.parseVariable();
        }
    }

    throw new Error('Unexpected value');
  }

  parseValueValue() {
    return this.parseValue(false);
  }

  parseVariable() {
    const node = createNode(Kind.Variable, this.scanner.startPosition) as Variable;

    this.parseExpected(Kind.DollarToken);

    node.name = this.parseName();

    return this.finishNode(node);
  }

  parseVariableDefinition() {
    const node = createNode(Kind.VariableDefinition, this.scanner.startPosition) as VariableDefinition;
    node.variable = this.parseVariable();
    this.parseExpected(Kind.ColonToken);
    node.type = this.parseTypeReference();
    if (this.currentToken === Kind.EqualsToken) {
      this.next();
      node.defaultValue = this.parseValue(true);
    }
    return this.finishNode(node);
  }

  parseVariableDefinitions() {
    if (this.currentToken === Kind.OpenParenthesisToken) {
      this.parseExpected(Kind.OpenParenthesisToken);
      const items = this.parseList<VariableDefinition>(Context.Variables, () => this.parseVariableDefinition());
      this.parseExpected(Kind.CloseParenthesisToken);
      return items;
    }
  }
}
