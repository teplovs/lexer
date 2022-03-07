// Copyright (c) 2022 Ivan Teplov

export type Rule = RegExp | RegExp[]

export type Rules = {
  [ruleName: string]: Rule
}

export function ruleMatches(input: string, rule: Rule): string | undefined {
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

  // Make the rule match only at the `lastIndex` position
  const updatedRule = new RegExp(
    rule.source,
    rule.flags + (rule.sticky ? "" : "y")
  )

  // Match only at the start of the string
  updatedRule.lastIndex = 0

  // If a regular expression is passed
  // then check for a match
  const match = updatedRule.exec(input)

  // If there is a match, then return it
  if (match)
    return match[0]
}
