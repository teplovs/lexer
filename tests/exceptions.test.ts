// Copyright (c) 2022 Ivan Teplov

import { LexerError } from "../library/exceptions"
import { Position } from "../library/token"
import tokenize from "./helpers/tokenize"

const functionThatThrows = () => tokenize(
  "onlyNumbersAreExpected",
  { number: /[0-9]+/ }
)

describe("LexerError", () => {
  it("is thrown when an unexpected character is in the input", () => {
    expect(functionThatThrows).toThrow(LexerError)
  })

  it("has position set when it's thrown by a lexer", () => {
    try {
      functionThatThrows()
      expect(false).toEqual(true)
    } catch (error) {
      if (error instanceof LexerError) {
        expect(error.position).toBeInstanceOf(Position)
      }
    }
  })
})
