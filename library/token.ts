// Copyright (c) 2022 Ivan Teplov

export class Position {
  constructor(
    public line: number,
    public column: number,
    public index: number
  ) {}

  add(line: number, column: number, index: number) {
    return new Position(
      this.line + line,
      this.column + column,
      this.index + index
    )
  }

  clone() {
    return this.add(0, 0, 0)
  }

  toString() {
    return `${this.line}:${this.column}`
  }
}

export class Token {
  constructor(
    public type: string,
    public value: string,
    public position: {
      start: Position,
      end: Position
    }
  ) {}
}
