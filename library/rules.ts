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

  // If a regular expression is passed
  // then check for a match
  const match = rule.exec(input)

  // If there is a match and it's at the start of the string,
  // then return it
  if (match?.index === 0) {
    return match[0]
  }
}
