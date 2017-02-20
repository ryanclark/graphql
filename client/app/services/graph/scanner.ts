import { Characters, ErrorCode, Kind } from './types';

function isCharacter(code: number) {
  return (code >= Characters.A && code <= Characters.Z ||
          code >= Characters.a && code <= Characters.z ||
          code === Characters.$ || code === Characters._ );
}

function isNumber(code: number) {
  return code >= Characters.Zero && code <= Characters.Nine;
}

function isAlphaNumeric(code: number) {
  return isCharacter(code) || isNumber(code);
}

function isLineBreak(code: number) {
  return (code === Characters.LineFeed || code === Characters.CarriageReturn ||
          code === Characters.LineSeparator || code === Characters.ParagraphSeparator);
}

function isWhiteSpaceSingleLine(code: number) {
  return (code === Characters.Space ||
          code === Characters.Tab ||
          code === Characters.VerticalTab ||
          code === Characters.FormFeed ||
          code === Characters.NonBreakingSpace ||
          code === Characters.NextLine ||
          code === Characters.Ogham ||
          code >= Characters.EnQuad && code <= Characters.ZeroWidthSpace ||
          code === Characters.NarrowNoBreakSpace ||
          code === Characters.MathematicalSpace ||
          code === Characters.IdeographicSpace ||
          code === Characters.ByteOrderMark);
}


export class Scanner {
  position: number;
  end: number;

  startPosition: number;
  tokenPosition: number;

  token: Kind;
  tokenValue: string;

  precedingBreak: boolean;
  tokenUnterminated: boolean;

  constructor(
    private text: string,
    private errorHandler: (error: ErrorCode, length?: number) => void
  ) {
    this.end = this.text.length;
  }

  setTextPosition(position: number) {
    this.position = position;
    this.startPosition = position;
    this.tokenPosition = position;
    this.token = Kind.Unknown;
    this.precedingBreak = false;

    this.tokenValue = undefined;
    this.tokenUnterminated = false;
  }

  scan() {
    this.startPosition = this.position;
    this.precedingBreak = false;
    this.tokenUnterminated = false;

    while (true) {
      this.tokenPosition = this.position;

      if (this.position >= this.end) {
        this.token = Kind.EOF;

        return this.token;
      }

      let code = this.text.charCodeAt(this.position);

      switch (code) {
        case Characters.LineFeed:
        case Characters.CarriageReturn:
          this.precedingBreak = true;
          this.position++;
          continue;
        case Characters.Tab:
        case Characters.VerticalTab:
        case Characters.FormFeed:
        case Characters.Space:
        case Characters.Comma:
          this.position++;
          continue;
        case Characters.Exclamation:
          this.position++;
          return this.token = Kind.ExclamationToken;
        case Characters.Hash:
          this.tokenValue = this.scanComment();
          return this.token = Kind.Comment;
        case Characters.$:
          this.position++;
          return this.token = Kind.DollarToken;
        case Characters.OpenParenthesis:
          this.position++;
          return this.token = Kind.OpenParenthesisToken;
        case Characters.CloseParenthesis:
          this.position++;
          return this.token = Kind.CloseParenthesisToken;
        case Characters.Dot:
          if (this.text.charCodeAt(this.position + 1) === Characters.Dot) {
            if (this.text.charCodeAt(this.position + 2) === Characters.Dot) {
              this.position += 3;
              return this.token = Kind.SpreadToken;
            }
          }
          break;
        case Characters.Colon:
          this.position++;
          return this.token = Kind.ColonToken;
        case Characters.Equals:
          this.position++;
          return this.token = Kind.EqualsToken;
        case Characters.At:
          this.position++;
          return this.token = Kind.AtToken;
        case Characters.OpenBracket:
          this.position++;
          return this.token = Kind.OpenBracketToken;
        case Characters.CloseBracket:
          this.position++;
          return this.token = Kind.CloseBracketToken;
        case Characters.OpenBrace:
          this.position++;
          return this.token = Kind.OpenBraceToken;
        case Characters.CloseBrace:
          this.position++;
          return this.token = Kind.CloseBraceToken;
        case Characters.Bar:
          this.position++;
          return this.token = Kind.PipeToken;
        case Characters.Plus:
          this.position++;
          return this.token = Kind.PlusToken;
        case Characters.Minus:
          this.position++;
          return this.token = Kind.MinusToken;
        case Characters.DoubleQuote:
          this.tokenValue = this.scanString();
          return this.token = Kind.StringLiteral;
        case Characters.Zero:
        case Characters.One:
        case Characters.Two:
        case Characters.Three:
        case Characters.Four:
        case Characters.Five:
        case Characters.Six:
        case Characters.Seven:
        case Characters.Eight:
        case Characters.Nine:
          this.tokenValue = this.scanNumber();
          return this.token;
        default:
          if (isCharacter(code)) {
            this.tokenValue = this.scanName();
            return this.token = Kind.Name;
          }
          if (isWhiteSpaceSingleLine(code)) {
            this.position++;
            continue;
          }
          else if (isLineBreak(code)) {
            this.precedingBreak = true;
            this.position++;
            continue;
          }
          this.errorHandler(ErrorCode.INVALID_CHARACTER);
          this.position++;
          return this.token = Kind.Unknown;
      }
    }
  }

  scanComment() {
    this.position++;

    let result = '';
    let startPosition = this.position;

    while (true) {
      if (this.position >= this.end) {
        result += this.text.substring(startPosition, this.position);
        this.tokenUnterminated = true;
      }

      const code = this.text.charCodeAt(this.position);
      if (isLineBreak(code)) {
        result += this.text.substring(startPosition, this.position);
        this.position++;
        break;
      }

      this.position++;
    }

    return result;
  }

  scanEscape() {
    this.position++;

    if (this.position >= this.end) {
      this.errorHandler(ErrorCode.UNEXPECTED_END_OF_TEXT);
      return '';
    }

    const code = this.text.charCodeAt(this.position);
    this.position++;

    switch (code) {
      case Characters.Zero:
        return '\0';
      case Characters.b:
        return '\b';
      case Characters.t:
        return '\t';
      case Characters.n:
        return '\n';
      case Characters.f:
        return '\f';
      case Characters.r:
        return '\r';
      case Characters.DoubleQuote:
        return '\"';
      case Characters.Backslash:
        return '\\';
      case Characters.Slash:
        return '/';
      case Characters.u:
        return this.scanHexadecimal(4);
      case Characters.CarriageReturn:
        if (this.position < this.end &&
            this.text.charCodeAt(this.position) === Characters.LineFeed) {
          this.position++;
        }
      case Characters.LineFeed:
      case Characters.LineSeparator:
      case Characters.ParagraphSeparator:
        return '';
      default:
        return String.fromCharCode(code);
    }
  }

  scanHexadecimal(count: number) {
    const escaped = this.scanHexDigits(count, false);

    if (escaped >= 0) {
      return String.fromCharCode(escaped);
    }

    this.errorHandler(ErrorCode.HEXADECIMAL_DIGIT_EXPECTED);
    return '';
  }

  scanHexDigits(count: number, maximum: boolean) {
    let digits = 0;
    let value = 0;
    while (digits < count || maximum) {
      const code = this.text.charCodeAt(this.position);
      if (code >= Characters.Zero && code <= Characters.Nine) {
        value = value * 16 + code - Characters.Zero;
      } else if (code >= Characters.A && code <= Characters.F) {
        value = value * 16 + code - Characters.A + 10;
      } else if (code >= Characters.a && code <= Characters.f) {
        value = value * 16 + code - Characters.a + 10;
      } else {
        break;
      }
      this.position++;
      digits++;
    }
    if (digits < count) {
      value = -1;
    }
    return value;
  }

  scanString() {
    const quoteKind = this.text.charCodeAt(this.position);
    this.position++;

    let result = '';
    let startPosition = this.position;

    while (true) {
      if (this.position >= this.end) {
        result += this.text.substring(startPosition, this.position);
        this.tokenUnterminated = true;
      }

      const code = this.text.charCodeAt(this.position);
      if (code === quoteKind) {
        result += this.text.substring(startPosition, this.position);
        this.position++;
        break;
      }

      if (code === Characters.Backslash) {
        result += this.text.substring(startPosition, this.position) + this.scanEscape();
        startPosition = this.position;
        continue;
      }

      if (isLineBreak(code)) {
        result += this.text.substring(startPosition, this.position);
        this.tokenUnterminated = true;
        this.errorHandler(ErrorCode.UNEXPECTED_STRING_LITERAL);
        break;
      }

      this.position++;
    }

    return result;
  }

  scanName() {
    const startPosition = this.position;

    this.position++;
    while (this.position < this.end &&
            isAlphaNumeric(this.text.charCodeAt(this.position))) {
      this.position++;
    }

    return this.text.substring(startPosition, this.position);
  }

  scanNumber() {
    const startPosition = this.position;
    this.token = Kind.NumberLiteral;

    while (isNumber(this.text.charCodeAt(this.position))) {
      this.position++;
    }

    if (this.text.charCodeAt(this.position) === Characters.Dot) {
      this.token = Kind.FloatLiteral;
      this.position++;
      while (isNumber(this.text.charCodeAt(this.position))) {
        this.position++;
      }
    }
    let endPosition = this.position;
    if (this.text.charCodeAt(this.position) === Characters.E ||
          this.text.charCodeAt(this.position) === Characters.e) {
      this.position++;
      if (this.text.charCodeAt(this.position) === Characters.Plus ||
            this.text.charCodeAt(this.position) === Characters.Minus) {
        this.position++;
      }
      if (isNumber(this.text.charCodeAt(this.position))) {
        this.position++;
        while (isNumber(this.text.charCodeAt(this.position))) {
          this.position++;
        }
        endPosition = this.position;
      } else {
        this.errorHandler(ErrorCode.DIGIT_EXPECTED);
      }
    }
    return '' + +(this.text.substring(startPosition, endPosition));
  }
}
