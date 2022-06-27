// Copyright (c) 2022 Ivan Teplov

import { Lexer } from "../library/lexer"
import { Token, Position } from "../library/token"
import tokenize from "./helpers/tokenize"

describe("Lexer", () => {
  it("fallbacks to a default end of file token type if an empty string is provided", () => {
    class CustomLexer extends Lexer {}

    const lexer = new CustomLexer("", {
      endOfFileTokenType: ""
    })

    expect(lexer.options.endOfFileTokenType).toEqual("endOfFile")
  })

  it("allows skipping certain types of tokens", () => {
    expect(
      tokenize(" 3.1415 ", {
        whitespace: /\s+/,
        number: /[0-9]+(\.[0-9]+)?/
      }, {
        skip: ["whitespace"]
      })
    ).toEqual([
      new Token("number", "3.1415", {
        start: new Position(1, 2, 1),
        end: new Position(1, 8, 7)
      })
    ])
  })

  it("lets the user control what value the token will have", () => {
    expect(
      tokenize("'Hello, World!'", {
        string: {
          pattern: /'(([^'\\]|\\.)*)'/,
          tokenValue: (match) => match[1]
        }
      })
    ).toEqual([
      new Token("string", "Hello, World!", {
        start: new Position(1, 1, 0),
        end: new Position(1, 16, 15)
      })
    ])

    expect(
      tokenize("'Hello, World!'", {
        string: {
          pattern: /'(([^'\\]|\\.)*)'/,
          tokenValue: (match) => match[1]
        }
      })
    ).toEqual([
      new Token("string", "Hello, World!", {
        start: new Position(1, 1, 0),
        end: new Position(1, 16, 15)
      })
    ])
  })

  it("has support for changing rules of a specific instance of a lexer", () => {
    class CustomLexer extends Lexer {
      static rules = {
        numbers: /[0-9]+/
      }
    }

    const lexer = new CustomLexer("0xFF")
    lexer.rules = {
      numbers: /0x[0-9a-fA-F]+|[0-9]+/
    }

    expect(() => lexer.nextToken).not.toThrow()
    expect(lexer.rules).not.toEqual(CustomLexer.rules)
  })
})
