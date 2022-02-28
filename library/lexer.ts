// Copyright (c) 2022 Ivan Teplov

import { Token, Position } from "./token"
import { Rules, ruleMatches } from "./rules"
import { LexerError } from "./exceptions"

export class Lexer implements Iterable<Token> {
  // Current lexer position
  position = new Position(1, 1, 0)

  constructor(public input: string, public rules: Rules) {}

  /**
   * Get the next token from the input string
   * @throws {LexerError}
   * @returns undefined if reached end of input, else the next token
   */
  nextToken(): Token | undefined {
    // If reached end of file
    if (this.position.index >= this.input.length)
      return

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

    return new Token(
      match.ruleName,
      match.value,
      { start, end }
    )
  }

  #findMatch() {
    const input = this.input.substring(this.position.index)

    for (const [ruleName, rule] of Object.entries(this.rules)) {
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

    while (token = this.nextToken()) {
      yield token
    }
  }
}
