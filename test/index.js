const tape = require('tape')
const validate = require('..')

tape('line comment', function (t) {
  let schedule = '# hello'

  let tokens = simplify(getTokens(validate(schedule)))
  console.log(tokens)
  t.end()
})

tape('inline comment', function (t) {
  let schedule = 'xxxxxxxx # hello'

  let tokens = simplify(getTokens(validate(schedule)))
  console.log(tokens)
  t.end()
})

tape('一班八小時', function (t) {
  let schedule = 'x'.repeat(8 * 60)

  let tokens = simplify(getTokens(validate(schedule)))
  console.log(tokens)
  t.end()
})

tape('一班 12 小時', function (t) {
  let schedule = 'x'.repeat(12 * 60)

  let tokens = simplify(getTokens(validate(schedule)))
  console.log(tokens)
  t.end()
})

tape('一班 12 小時又一分鐘', function (t) {
  let schedule = 'x'.repeat(12 * 60) + 'x'

  let tokens = simplify(getTokens(validate(schedule)))
  console.log(tokens)
  t.end()
})

tape('一班 12 小時，中間有休息', function (t) {
  let schedule = 'x'.repeat(5 * 60) + '.'.repeat(2 * 60) + 'x'.repeat(5 * 60)

  let tokens = simplify(getTokens(validate(schedule)))
  console.log(tokens)
  t.end()
})

tape('充足休息', function (t) {
  let schedule = '.'.repeat(8 * 60)

  let tokens = simplify(getTokens(validate(schedule)))
  console.log(tokens)
  t.end()
})

tape('休息不足 8 小時', function (t) {
  let schedule = '.'.repeat(8 * 60 - 1)

  let tokens = simplify(getTokens(validate(schedule)))
  console.log(tokens)
  t.end()
})

function getTokens (tokenizer) {
  let ts = []
  while (true) {
    let token = tokenizer.next()
    if (!token) break

    ts.push(token)
  }
  return ts
}

// 只取出 type 跟時段長度
function simplify (tokens) {
  return tokens.map(t => { return { type: t.type, length: t.value.length } })
}
