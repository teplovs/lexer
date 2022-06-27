// Copyright (c) 2022 Ivan Teplov

import { Position } from "../library/token"

describe("Token position", () => {
  it("doesn't try to display file path when it's not provided", () => {
    expect(new Position(1, 1, 0).toString()).toEqual("1:1")
  })

  it("doesn't try to display file path when it's an empty string", () => {
    expect(new Position(1, 1, 0, "").toString()).toEqual("1:1")
  })

  it("displays file path when it's provided", () => {
    expect(new Position(1, 1, 0, "input-file").toString()).toEqual("1:1 (in input-file)")
  })
})
