// Copyright (c) 2022 Ivan Teplov

import { Lexer, LexerOptions } from "../../library/lexer"
import { Rules } from "../../library/rules"

export const tokenize = (
  input: string,
  rules: Rules,
  options?: LexerOptions
) => {
  class TestLexer extends Lexer {
    static rules = rules
  }

  const lexer = new TestLexer(input, options)
  return lexer.tokenize()
}

export default tokenize

