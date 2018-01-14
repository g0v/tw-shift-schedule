const tape = require('tape')
const validate = require('../tokenizer')

tape('line comment', function (t) {
  let schedule = '# hello'

  let tokens = simplify(getTokens(validate(schedule)))
  t.same(tokens, [
    { type: 'comment', length: 6 }
  ])
  t.end()
})

tape('inline comment', function (t) {
  let schedule = 'xxxxxxxx # hello'

  let tokens = simplify(getTokens(validate(schedule)))
  t.same(tokens, [
    { type: 'work', length: 8 },
    { type: 'comment', length: 6 }
  ])
  t.end()
})

tape('一班八小時', function (t) {
  let schedule = 'x'.repeat(8 * 60)

  let tokens = simplify(getTokens(validate(schedule)))
  t.same(tokens, [
    { type: 'work', length: 480 }
  ])
  t.end()
})

tape('一班 12 小時', function (t) {
  let schedule = 'x'.repeat(12 * 60)

  let tokens = simplify(getTokens(validate(schedule)))
  t.same(tokens, [
    { type: 'work', length: 720 }
  ])
  t.end()
})

tape('一班 12 小時又一分鐘', function (t) {
  let schedule = 'x'.repeat(12 * 60) + 'x'

  let tokens = simplify(getTokens(validate(schedule)))
  t.same(tokens, [
    { type: 'work', length: 720 },
    { type: 'invalid', length: 1 }
  ])
  t.end()
})

tape('一班 12 小時，中間有休息', function (t) {
  let schedule = 'x'.repeat(5 * 60) + '.'.repeat(2 * 60) + 'x'.repeat(5 * 60)

  let tokens = simplify(getTokens(validate(schedule)))
  t.same(tokens, [
    { type: 'work', length: 720 }
  ])
  t.end()
})

tape('一班 12 小時，前 8 休 2 後 2', function (t) {
  let schedule = 'x'.repeat(8 * 60) + '.'.repeat(2 * 60) + 'x'.repeat(2 * 60)

  let tokens = simplify(getTokens(validate(schedule)))
  t.same(tokens, [
    { type: 'work', length: 720 }
  ])
  t.end()
})

tape('一班 作 8 休 7 作 8', function (t) {
  let schedule = 'x'.repeat(8 * 60) + '.'.repeat(7 * 60) + 'x'.repeat(8 * 60)

  let tokens = simplify(getTokens(validate(schedule)))
  t.same(tokens, [
    { type: 'work', length: 480 },
    { type: 'invalid', length: 900 }
  ])
  t.end()
})

tape('兩班 作 8 休 8 作 8', function (t) {
  let schedule = 'x'.repeat(8 * 60) + '.'.repeat(8 * 60) + 'x'.repeat(8 * 60)

  let tokens = simplify(getTokens(validate(schedule)))
  t.same(tokens, [
    { type: 'work', length: 480 },
    { type: 'rest', length: 480 },
    { type: 'work', length: 480 }
  ])
  t.end()
})

tape('充足休息', function (t) {
  let schedule = '.'.repeat(8 * 60)

  let tokens = simplify(getTokens(validate(schedule)))
  t.same(tokens, [
    { type: 'rest', length: 480 }
  ])
  t.end()
})

tape('休息不足 8 小時', function (t) {
  let schedule = '.'.repeat(8 * 60 - 1)

  let tokens = simplify(getTokens(validate(schedule)))
  t.same(tokens, [
    { type: 'invalid', length: 479 }
  ])
  t.end()
})

function getTokens(tokenizer) {
  let ts = []
  while (true) {
    let token = tokenizer.next()
    if (!token) break

    ts.push(token)
  }
  return ts
}

// 只取出 type 跟時段長度
function simplify(tokens) {
  return tokens.map(t => { return { type: t.type, length: t.value.length } })
}
