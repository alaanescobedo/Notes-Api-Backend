const { palindrome } = require('../utils/for_testing')

test.skip('palindrome of alan', () => {
  const result = palindrome('alan')

  expect(result).toBe('nala')
})

test.skip('palindrome of empty string', () => {
  const result = palindrome('')

  expect(result).toBe('')
})

test.skip('palindrome of udefined', () => {
  const result = palindrome()

  expect(result).toBeUndefined()
})
