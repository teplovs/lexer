// Copyright (c) 2022 Ivan Teplov

type TokenValueGetter = (match: RegExpExecArray) => string

const defaultTokenValue: TokenValueGetter =
  (match: RegExpExecArray) => match[0]

export type Rule = {
  pattern: RegExp,
  tokenValue?: TokenValueGetter
} | RegExp

export type Rules = {
  [ruleName: string]: Rule | Rule[]
}

/**
 * Check if the input matches a certain rule or a list of rules
 * @param input - an input string
 * @param rule - a rule or a list of rules
 * @param position - position at which to match the rule or rules
 * @returns an array with a regular expression match array and a token value or undefined
 */
export function ruleMatches(
  input: string,
  rule: Rule | Rule[],
  position: number = 0
): [match: RegExpMatchArray, tokenValue: string] | undefined {
  // If an array of rules is passed
  if (Array.isArray(rule)) {
    // Iterate over variants of the rule
    for (const child of rule) {
      // Check for a match
      const match = ruleMatches(input, child, position)

      // If there is a match, then return it
      if (match !== undefined) return match
    }

    return
  }

  let pattern

  // Function to convert match array to token value
  let getTokenValue = defaultTokenValue

  if (rule instanceof RegExp) {
    pattern = rule
  } else {
    pattern = rule.pattern

    if (rule.tokenValue instanceof Function) {
      getTokenValue = (...args) => rule.tokenValue!(...args)
    }
  }

  // Make the rule match only at the `lastIndex` position
  const regularExpression = new RegExp(
    pattern.source,
    pattern.flags + (pattern.sticky ? "" : "y")
  )

  // Match only at the start of the string
  regularExpression.lastIndex = position

  // If a regular expression is passed then check for a match
  const match = regularExpression.exec(input)

  // If there is a match, then return it and the converted value
  if (match) {
    return [match, getTokenValue(match)]
  }
}
