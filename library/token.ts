// Copyright (c) 2022 Ivan Teplov

export class Position {
  /**
   * @param filePath - path to a source file
   */
  constructor(
    public line: number,
    public column: number,
    public index: number,
    public filePath?: string
  ) {}

  add(line: number, column: number, index: number) {
    return new Position(
      this.line + line,
      this.column + column,
      this.index + index,
      this.filePath
    )
  }

  clone() {
    return this.add(0, 0, 0)
  }

  /**
   * Converts the position to a string, such as:
   * `line:column (in filePath)`
   */
  toString() {
    let result = `${this.line}:${this.column}`

    if (this.filePath) {
      result += ` (in ${this.filePath})`
    }

    return result
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
