// Copyright (c) 2022 Ivan Teplov

import XRegExp from "xregexp"

export type Rule =
  { pattern: string, flags?: string }
  | RegExp

export type RulesEntry = Rule | Rule[]

export type Rules = {
  [ruleName: string]: RulesEntry
}

export function ruleMatches(input: string, rule: RulesEntry): string | undefined {
  // If an array of rules is passed
  if (rule instanceof Array) {
    // Iterate over variants of the rule
    for (const child of rule) {
      // Check for a match
      const match = ruleMatches(input, child)

      // If there is a match, then return it
      if (match !== undefined)
        return match
    }

    return
  }

  const regularExpression = !(rule instanceof RegExp)
    ? XRegExp(rule.pattern, rule.flags ?? "")
    : rule

  // If a regular expression is passed
  // then check for a match
  const match = XRegExp.exec(input, regularExpression)

  // If there is a match and it's at the start of the string,
  // then return it
  if (match?.index === 0) {
    return match[0]
  }
}
