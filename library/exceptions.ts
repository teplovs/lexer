// Copyright (c) 2022 Ivan Teplov

import { Position } from "./token"

export class LexerError extends Error {
  name = "LexerError"

  constructor(message: string, public position: Position) {
    super(message)
  }
}
