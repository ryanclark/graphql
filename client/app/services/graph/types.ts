export enum Characters {
  $ = 0x24,
  _ = 0x5F,

  Zero = 0x30,
  One = 0x31,
  Two = 0x32,
  Three = 0x33,
  Four = 0x34,
  Five = 0x35,
  Six = 0x36,
  Seven = 0x37,
  Eight = 0x38,
  Nine = 0x39,

  a = 0x61,
  b = 0x62,
  e = 0x65,
  f = 0x66,
  n = 0x6E,
  r = 0x72,
  t = 0x74,
  u = 0x75,
  z = 0x7A,

  A = 0x41,
  E = 0x45,
  F = 0x46,
  Z = 0x5a,

  At = 0x40,
  Backslash = 0x5C,
  Bar = 0x7C,
  CloseBrace = 0x7D,
  CloseBracket = 0x5D,
  CloseParenthesis = 0x29,
  Colon = 0x3A,
  Comma = 0x2C,
  Dot = 0x2E,
  DoubleQuote = 0x22,
  Equals = 0x3D,
  Exclamation = 0x21,
  Hash = 0x23,
  Minus = 0x2D,
  OpenBrace = 0x7B,
  OpenBracket = 0x5B,
  OpenParenthesis = 0x28,
  Plus = 0x2B,
  Slash = 0x2F,

  CarriageReturn = 0x0D,
  FormFeed = 0x0C,
  LineFeed = 0x0A,
  LineSeparator = 0x2028,
  ParagraphSeparator = 0x2029,
  Space = 0x0020,
  Tab = 0x09,
  VerticalTab = 0x0B,

  NonBreakingSpace = 0x00A0,
  NextLine = 0x0085,
  Ogham = 0x1680,
  EnQuad = 0x2000,
  ZeroWidthSpace = 0x200B,
  NarrowNoBreakSpace = 0x202F,
  IdeographicSpace = 0x3000,
  MathematicalSpace = 0x205F,
  ByteOrderMark = 0xFEFF
}

export enum Context {
  SourceElements,
  SelectionSet,
  Arguments,
  Directives,
  List,
  Object,
  Variables,
  ImplementsInterfaces,
  Locations,
  EnumType,
  InputValue,
  FieldDefinition,
  OperationTypeDefinition,
  UnionTypeDefinition
}

export enum ErrorCode {
  INVALID_CHARACTER,
  DIGIT_EXPECTED,
  UNEXPECTED_STRING_LITERAL,
  HEXADECIMAL_DIGIT_EXPECTED,
  UNEXPECTED_END_OF_TEXT,
  UNEXPECTED_TOKEN
}

export enum Kind {
  Query,
  Name,
  Unknown,
  EOF,
  Whitespace,
  ExclamationToken,
  Comment,
  DollarToken,
  OpenParenthesisToken,
  CloseParenthesisToken,
  SpreadToken,
  ColonToken,
  EqualsToken,
  AtToken,
  OpenBracketToken,
  CloseBracketToken,
  OpenBraceToken,
  CloseBraceToken,
  PipeToken,
  PlusToken,
  MinusToken,
  NumberLiteral,
  FloatLiteral,
  StringLiteral,
  FirstNode,
  Document,
  OperationDefinition,
  SelectionSet,
  Field,
  Argument,
  Boolean,
  Null,
  Enum,
  Directive,
  Variable,
  List,
  Object,
  ObjectField,
  InlineFragment,
  FragmentSpread,
  FragmentDefinition,
  NamedType,
  VariableDefinition,
  ListType,
  NonNullType,
  FieldDefinition,
  SchemaDefinition,
  ScalarTypeDefinition,
  ObjectTypeDefinition,
  InterfaceTypeDefinition,
  UnionTypeDefinition,
  EnumTypeDefinition,
  EnumValueDefinition,
  InputObjectTypeDefinition,
  InputValueDefinition,
  TypeExtensionDefinition,
  DirectiveDefinition,
  OperationTypeDefinition
}

export const textToKind = {
  '!': Kind.ExclamationToken,
  '$': Kind.DollarToken,
  '(': Kind.OpenParenthesisToken,
  ')': Kind.CloseParenthesisToken,
  '...': Kind.SpreadToken,
  ':': Kind.ColonToken,
  '=': Kind.EqualsToken,
  '@': Kind.AtToken,
  '[': Kind.OpenBracketToken,
  ']': Kind.CloseBracketToken,
  '{': Kind.OpenBraceToken,
  '}': Kind.CloseBraceToken,
  '|': Kind.PipeToken,
  '+': Kind.PlusToken,
  '-': Kind.MinusToken
}

const reverse = (obj) => {
  const o = {};
  for (let i in obj) {
    o[obj[i]] = i;
  }
  return o;
};

export const kindToText = reverse(textToKind);


export enum InvalidPosition {
  Value = -1
}
