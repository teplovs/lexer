// Copyright (c) 2022 Ivan Teplov

import { Token, Position } from "./token"
import { Rules, ruleMatches } from "./rules"
import { LexerError } from "./exceptions"

export type LexerOptions = {
  /**
   * List of token types to skip
   */
  skip?: string[]

  /**
   * Type of token that will be returned when reached
   * end of file
   */
  endOfFileTokenType?: string

  /**
   * Path to the input file
   */
  filePath?: string
}

/**
 * Lexer is a tool to split an input string or a file into tokens.
 * In a spoken language, each noun, pronoun, verb, etc. and even spaces
 * and punctuation can be considered as tokens.
 */
export class Lexer implements Iterable<Token> {
  /**
   * Default lexer rules
   */
  static rules: Rules = {}

  /**
   * In order to make a lexer extensible, we need to make it possible
   * to change rules only of a certain lexer instance, instead of
   * overriding the rules for all the instances.
   *
   * That's why we'll create a private variable and define getters and
   * setters for rules of a separate instance.
   */
  #rules: Rules = (this.constructor as typeof Lexer).rules

  get rules(): Rules {
    return this.#rules
  }

  set rules(newRules: Rules) {
    this.#rules = newRules
  }

  /**
   * Current lexer position
   */
  position: Position

  /**
   * Default options, used when instantiating a lexer
   */
  static get defaultOptions(): LexerOptions {
    return {
      skip: [],
      endOfFileTokenType: "endOfFile"
    }
  }

  /**
   * @param input - input string to tokenize
   * @param options - lexer options
   * @param options.skip - list of token types to skip (optional)
   * @param options.endOfFileTokenType - when the lexer reaches an end of input and a user continues to use `Lexer#nextToken()`, a token of this type will be returned (by default it's "endOfFile")
   * @param options.filePath - path to a source file (optional)
   */
  constructor(
    public input: string,
    public options: LexerOptions = {}
  ) {
    const defaultOptions = (this.constructor as typeof Lexer).defaultOptions

    // Merge default options and options
    this.options = {
      ...defaultOptions,
      ...this.options
    }

    this.options.endOfFileTokenType =
      this.options.endOfFileTokenType ||
      defaultOptions.endOfFileTokenType!

    this.position = new Position(1, 1, 0, this.options?.filePath)
  }

  /**
   * Get the next token from the input string
   * @throws {LexerError}
   * @returns a token
   */
  nextToken(): Token {
    // If reached end of file
    if (this.position.index >= this.input.length) {
      // Return the token with type 'end of file'
      return new Token(
        this.options.endOfFileTokenType!,
        "",
        {
          start: this.position.clone(),
          end: this.position.clone()
        }
      )
    }

    // Check if there the input matches any rule
    const ruleMatch = this.#findMatch()

    // If there are no matches
    if (!ruleMatch) {
      // The unexpected character, wrapped in double quotes.
      const character = JSON.stringify(this.input.charAt(this.position.index))

      // Throw the error
      throw new LexerError(
        `Unexpected character ${character} at ${this.position}`,
        this.position
      )
    }

    // Get the full matching string
    const fullMatch = ruleMatch.matchArray[0]

    const start = this.position.clone()
    const end = this.#calculateEndPosition(fullMatch)

    // Move lexer's position
    this.position = end.clone()

    // Create a token
    const token = new Token(
      ruleMatch.ruleName,
      ruleMatch.value,
      { start, end }
    )

    // Check whether the token of this type should be skipped or not
    if (
      Array.isArray(this.options.skip) &&
      this.options.skip.indexOf(token.type) >= 0
    ) {
      return this.nextToken()
    }

    return token
  }

  /**
   * Check if there is a rule that matches
   */
  #findMatch() {
    const rules = this.rules

    // Iterate over lexer's rules
    for (const ruleName in rules) {
      const rule = rules[ruleName]
      const ruleMatch = ruleMatches(this.input, rule, this.position.index)

      if (ruleMatch !== undefined) {
        return {
          ruleName,
          matchArray: ruleMatch[0],
          value: ruleMatch[1]
        }
      }
    }
  }

  /**
   * Function to update next lexer's position after tokenizing a part of an input string
   * @param tokenValue - value of the last created token
   * @returns the new position
   */
  #calculateEndPosition(tokenValue: string): Position {
    const countOfNewlines = tokenValue.match(/\n/g)?.length ?? 0

    if (countOfNewlines === 0) {
      /*
       * For columns, we convert the value of a token (which is string) to an array,
       * so that emojis are considered as one character
       */
      const deltaColumns = [...tokenValue].length
      return this.position.add(0, deltaColumns, tokenValue.length)
    }

    const lastNewlineIndex = tokenValue.lastIndexOf("\n") + 1

    /*
     * For columns, we convert the value of a token (which is string) to an array,
     * so that emojis are considered as one character.
     *
     * And we add 1, because columns are starting with 1 and not 0.
     */
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
   * @returns an array of tokens
   */
  tokenize() {
    return Array.from(this)
  }

  /**
   * This adds support for `for (const token of lexer)` syntax
   */
  *[Symbol.iterator](): Iterator<Token> {
    const endOfFile = this.options.endOfFileTokenType
    let token

    // While we haven't reached the end of file
    while ((token = this.nextToken()).type !== endOfFile) {
      yield token
    }
  }
}
