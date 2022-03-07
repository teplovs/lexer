// Copyright (c) 2022 Ivan Teplov

import { Token, Position } from "./token"
import { Rules, ruleMatches } from "./rules"
import { LexerError } from "./exceptions"

export type LexerOptions = {
  // List of token types to skip
  skip?: string[]

  // Type of token that will be returned when reached
  // end of file
  endOfFileTokenType?: string
}

const defaultOptions: LexerOptions = {
  skip: [],
  endOfFileTokenType: "endOfFile"
}

export class Lexer implements Iterable<Token> {
  static rules: Rules = {}

  // Current lexer position
  position = new Position(1, 1, 0)

  constructor(
    public input: string,
    public options: LexerOptions = {}
  ) {
    this.options = {
      ...defaultOptions,
      ...this.options
    }

    this.options.endOfFileTokenType =
      this.options.endOfFileTokenType ||
      defaultOptions.endOfFileTokenType!
  }

  /**
   * Get the next token from the input string
   * @throws {LexerError}
   * @returns a token
   */
  nextToken(): Token {
    // If reached end of file
    if (this.position.index >= this.input.length) {
      return new Token(
        this.options.endOfFileTokenType!,
        "",
        {
          start: this.position.clone(),
          end: this.position.clone()
        }
      )
    }

    const match = this.#findMatch()

    if (!match) {
      const character = JSON.stringify(this.input.charAt(this.position.index))
      throw new LexerError(
        `Unexpected character ${character} at ${this.position}`,
        this.position
      )
    }

    const start = this.position.clone()
    const end = this.#calculateEndPosition(match.value)

    this.position = end.clone()

    const token = new Token(
      match.ruleName,
      match.value,
      { start, end }
    )

    if (
      this.options.skip instanceof Array &&
      this.options.skip.indexOf(token.type) >= 0
    ) {
      return this.nextToken()
    }

    return token
  }

  #findMatch() {
    const input = this.input.substring(this.position.index)
    const rules = (this.constructor as typeof Lexer).rules

    for (const [ruleName, rule] of Object.entries(rules)) {
      const match = ruleMatches(input, rule)

      if (match !== undefined) {
        return {
          ruleName,
          value: match
        }
      }
    }
  }

  #calculateEndPosition(tokenValue: string) {
    const countOfNewlines = tokenValue.match(/\n/g)?.length ?? 0

    if (countOfNewlines === 0)
      // As for columns, we convert string to array, so that emojis are considered
      // as one character
      return this.position.add(0, [...tokenValue].length, tokenValue.length)

    const lastNewlineIndex = tokenValue.lastIndexOf("\n") + 1
    const newColumn = [...tokenValue.substring(lastNewlineIndex)].length + 1

    return new Position(
      this.position.line + countOfNewlines,
      newColumn,
      this.position.index + tokenValue.length
    )
  }

  /**
   * Reset lexer's position
   */
  reset() {
    this.position = new Position(1, 1, 0)
  }

  /**
   * Tokenize the input string and return an array of tokens
   * @param resetPositionBeforeTokenizing - reset lexer's position before tokenizing
   * @param resetPositionAfterTokenizing - reset lexer's position after tokenizing
   * @returns an array of tokens
   */
  tokenize(
    resetPositionBeforeTokenizing = true,
    resetPositionAfterTokenizing = true
  ) {
    if (resetPositionBeforeTokenizing)
      this.reset()

    const result = Array.from(this)

    if (resetPositionAfterTokenizing)
      this.reset()

    return result
  }

  *[Symbol.iterator](): Iterator<Token> {
    let token
    const endOfFile = this.options.endOfFileTokenType

    while ((token = this.nextToken()).type !== endOfFile)
      yield token
  }
}
