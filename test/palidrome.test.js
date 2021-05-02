const { palindrome } = require('../utils/for_testing')

test('palindrome of alan', () => {
  const result = palindrome('alan')

  expect(result).toBe('nala')
})
