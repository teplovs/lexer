# Lexer

JavaScript library for tokenizing strings with regular expressions

## Installation

```bash
npm install @teplovs/lexer
# or, if you prefer yarn:
yarn add @teplovs/lexer
```

## Usage

### Example

```javascript
import { Lexer } from "@teplovs/lexer"

// Lexer input
const code = "print '👋'"

// Lexer rules
const rules = {
  print: /\b(print)\b/,
  string: /'([^'\\]|\\.)*'/,
  space: /( |\t)+/
}

// Initialize a lexer
const lexer = new Lexer(code, rules)

// Run the lexer and save tokens as an array
const tokens = lexer.tokenize()
```

### Defining rules

To tell the lexer how to tokenize a string, we need to define rules. To do that, we use an object, where each key corresponds to a token type, and each value corresponds to a regular expression for parsing a token value.

For example, our input string is a space-separated list of integers.
Then one of possible ways to define rules is this:

```javascript
const rules = {
  integer: /[0-9]+/,
  space: /( )+/
}
```

Let's go a bit deeper and add support for hexadecimal integers. We have a few ways to do that. Let's start with the easiest one: add another token type.

```javascript
const rules = {
  decimal: /[0-9]+/,
  hexadecimal: /0x[0-9a-fA-F]+/,
  space: /( )+/
}
```

But in this rules definition there is a problem: **order of rules**. Lexer goes in the order we specify the rules in the object. So when trying to tokenize a string `0x9`, we'll get a `LexerError`. The reason is that the lexer 'ate' the `0` character, because it matches the `decimal` rule, and then it saw the `x` character that didn't match any rule.

So, the way to fix is to reorder these rules:

```javascript
const rules = {
  hexadecimal: /0x[0-9a-fA-F]+/,
  decimal: /[0-9]+/,
  space: /( )+/
}
```

But what if we want both hexadecimal and decimal be tokenized as an `integer`?
We can combine these rules:

```javascript
const rules = {
  integer: /0x[0-9a-fA-F]+|[0-9]+/,
  space: /( )+/
}
```

It works, but looks a bit harder to understand. What if we want to make a more difficult rule?
For example, a string:

```javascript
const rules = {
  string: /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/
}
```

It looks even more difficult to understand. So that's the point where we can use arrays:

```javascript
const rules = {
  string: [
    /"([^"\\]|\\.)*"/,
    /'([^'\\]|\\.)*'/
  ]
}
```

And for our example with integers:

```javascript
const rules = {
  integer: [
    /0x[0-9a-fA-F]+/,
    /[0-9]+/
  ],
  space: /( )+/
}
```

Here, the **order of regular expressions matters** too!

### Working with tokens

There are three ways to work with tokens:
1. Call `Lexer#tokenize()` and get an array of tokens
2. Call `Lexer#nextToken()` to get the next token (returns `undefined` if reached the end of input)
3. Use for-of loop and iterate over tokens: `for (const token of lexer)`

#### Important note for `Lexer#tokenize()`

By default, `Lexer#tokenize()` resets the lexer's position, tokenizes an input string from start, and then resets the lexer's position again. That's made in order for this to work:

```javascript
// ...

for (const token of lexer) {
  // ...
}

// ...
lexer.tokenize() // this won't return an empty array
```

## API

### `Lexer`

#### `constructor(input: string, rules: Rules)`

```javascript
new Lexer(inputString, rules)
```

**Arguments**:
- `inputString` - a string to tokenize
- `rules` - an object with lexer rules

#### `reset()`

```javascript
lexer.reset()
```

You can use this method to reset current lexer's position

#### `nextToken(): Token | undefined`

```javascript
lexer.nextToken()
```

Returns `undefined` when reached **end of input**

#### `tokenize(resetPositionBeforeTokenizing: boolean = true, resetPositionAfterTokenizing: boolean = true): Token[]`

```javascript
lexer.tokenize()
```

Returns an array of tokens.

**Arguments**:
- `resetPositionBeforeTokenizing` - if `true`, then the lexer will reset position before tokenizing, so that it tokenizes from the start of the input string.
- `resetPositionAfterTokenizing` - if `true`, then the lexer will reset position after tokenizing.

### `Token`

```typescript
class Token {
  type: string
  value: string
  position: {
    start: Position,
    end: Position
  }
}
```

### `Position`

```typescript
class Position {
  line: number
  column: number
  index: number
}
```

### `LexerError`

Exception thrown by the lexer when the input doesn't match any rule.

```typescript
class LexerError extends Error {
  position: Position
}
```

#### `position: Position`

Position in the input where the error occurred.

### `ruleMatches(input: string, rule: Rule): string | undefined`

Function used by the lexer for checking if there is a match in the input string to a rule.

Example:

```javascript
ruleMatches("10 11", /[0-9]+/) // returns "10"

ruleMatches("0xF 0b101", [
  /0b[0-1]+/,
  /0x[0-9a-fA-F]+/
]) // returns "0xF"
```

## Development

### Requirements

- Node.js and npm

### Setup

1. Clone the repository

```bash
git clone https://github.com/teplovs/lexer
```

2. Navigate to the project folder

```bash
cd lexer
```

3. Install dependencies

```bash
npm install
# or, if you prefer yarn:
yarn install
```

4. To run tests:

```bash
npm test
# or:
yarn test
```

5. To build the library:

```bash
npm run build
# or:
yarn build
```

6. Happy hacking! 🎉
