// Copyright (c) 2022 Ivan Teplov

import { Lexer } from "../library/lexer"
import { Rules } from "../library/rules"
import { Token, Position } from "../library/token"

const tokenize = (input: string, rules: Rules) =>
  new Lexer(input, rules).tokenize()

describe("Lexer", () => {
  it("tokenizes correctly", () => {
    expect(
      tokenize("10.5 3", {
        float: /[0-9]+\.[0-9]+/,
        integer: /[0-9]+/,
        space: {
          pattern: "( |\\t)+"
        }
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
  })

  it("calculates token's column and index correctly when input contains emoji or other unicode characters", () => {
    expect(
      tokenize("🎉✨", {
        emoji: {
          pattern: "\\p{S}",
          // match astral code points
          flags: "A"
        }
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
})