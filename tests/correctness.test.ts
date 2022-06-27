// Copyright (c) 2022 Ivan Teplov

import { Token, Position } from "../library/token"
import { Lexer } from "../library/lexer"
import tokenize from "./helpers/tokenize"

describe("Lexer", () => {
  it("tokenizes correctly", () => {
    expect(
      tokenize("10.5 3", {
        float: /[0-9]+\.[0-9]+/,
        integer: /[0-9]+/,
        space: /( |\t)+/
      })
    ).toEqual([
      new Token("float", "10.5", {
        start: new Position(1, 1, 0),
        end: new Position(1, 5, 4)
      }),
      new Token("space", " ", {
        start: new Position(1, 5, 4),
        end: new Position(1, 6, 5)
      }),
      new Token("integer", "3", {
        start: new Position(1, 6, 5),
        end: new Position(1, 7, 6)
      })
    ])
  })

  it("updates position properly", () => {
    expect(
      tokenize("'\nmultiline string\n'", {
        string: /'([^']|\\.)*'/
      })
    ).toEqual([
      new Token("string", "'\nmultiline string\n'", {
        start: new Position(1, 1, 0),
        end: new Position(3, 2, 20)
      })
    ])
  })

  it("supports multiple variants of a rule", () => {
    expect(
      tokenize("0xFF 0o71 010 0b101", {
        integer: [
          /0x[0-9a-fA-F]+/,
          /0o[0-7]+/,
          /0b[0-1]+/,
          /[0-9]+/
        ],
        space: / /
      })
    ).toEqual([
      new Token("integer", "0xFF", {
        start: new Position(1, 1, 0),
        end: new Position(1, 5, 4)
      }),
      new Token("space", " ", {
        start: new Position(1, 5, 4),
        end: new Position(1, 6, 5)
      }),
      new Token("integer", "0o71", {
        start: new Position(1, 6, 5),
        end: new Position(1, 10, 9)
      }),
      new Token("space", " ", {
        start: new Position(1, 10, 9),
        end: new Position(1, 11, 10)
      }),
      new Token("integer", "010", {
        start: new Position(1, 11, 10),
        end: new Position(1, 14, 13)
      }),
      new Token("space", " ", {
        start: new Position(1, 14, 13),
        end: new Position(1, 15, 14)
      }),
      new Token("integer", "0b101", {
        start: new Position(1, 15, 14),
        end: new Position(1, 20, 19)
      })
    ])

    expect(
      tokenize("0xFF 0o71 010 0b101", {
        integer: /0x[0-9a-fA-F]+|0o[0-7]+|0b[0-1]+|[0-9]+/,
        space: / /
      })
    ).toEqual([
      new Token("integer", "0xFF", {
        start: new Position(1, 1, 0),
        end: new Position(1, 5, 4)
      }),
      new Token("space", " ", {
        start: new Position(1, 5, 4),
        end: new Position(1, 6, 5)
      }),
      new Token("integer", "0o71", {
        start: new Position(1, 6, 5),
        end: new Position(1, 10, 9)
      }),
      new Token("space", " ", {
        start: new Position(1, 10, 9),
        end: new Position(1, 11, 10)
      }),
      new Token("integer", "010", {
        start: new Position(1, 11, 10),
        end: new Position(1, 14, 13)
      }),
      new Token("space", " ", {
        start: new Position(1, 14, 13),
        end: new Position(1, 15, 14)
      }),
      new Token("integer", "0b101", {
        start: new Position(1, 15, 14),
        end: new Position(1, 20, 19)
      })
    ])
  })

  it("calculates token's column and index correctly when input contains emoji or other unicode characters", () => {
    expect(
      tokenize("🎉✨", {
        emoji: /\p{S}/u
      })
    ).toEqual([
      new Token("emoji", "🎉", {
        start: new Position(1, 1, 0),
        end: new Position(1, 2, 2)
      }),
      new Token("emoji", "✨", {
        start: new Position(1, 2, 2),
        end: new Position(1, 3, 3)
      })
    ])
  })

  it("will match even if the regular expression already has 'y' flag and has 'lastIndex' set", () => {
    expect(
      tokenize("helloWorld", {
        word: (() => {
          const regularExpression = /[a-zA-Z]+/y
          regularExpression.lastIndex = 10
          return regularExpression
        })()
      })
    ).toEqual([
      new Token("word", "helloWorld", {
        start: new Position(1, 1, 0),
        end: new Position(1, 11, 10)
      })
    ])
  })

  it("passes filePath to the Position as an argument", () => {
    expect(
      tokenize(
        "0",
        { number: /[0-9]+/ },
        { filePath: "unknown" }
      )[0]!.position.start
    ).toHaveProperty("filePath", "unknown")
  })

  it("will start over if a user calls 'lexer#reset()'", () => {
    class CustomLexer extends Lexer {
      static rules = {
        digit: /[0-9]/
      }
    }

    const lexer = new CustomLexer("123456789")
    expect(lexer.tokenize()).not.toEqual([])
    expect(lexer.tokenize()).toEqual([])

    lexer.reset()
    expect(lexer.tokenize()).not.toEqual([])
  })
})

