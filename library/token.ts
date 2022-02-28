// Copyright (c) 2022 Ivan Teplov

export class Position {
  constructor(
    public line: number,
    public column: number,
    public index: number
  ) {}
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
