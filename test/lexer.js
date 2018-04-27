const tape = require('tape')
const lexer = require('../lexer')

tape('line comment', function (t) {
  let schedule = '# hello'

  let tokens = simplify(lexer(schedule))
  t.same(tokens, [])
  t.end()
})

tape('multi-line with comment', function (t) {
  let schedule = `
  # hello
  xxxxx xxx
  `

  let tokens = simplify(lexer(schedule))
  t.same(tokens, [
    { type: 'work', length: 8 }
  ])
  t.end()
})

tape('inline comment', function (t) {
  let schedule = 'xxxxxxxx # hello'

  let tokens = simplify(lexer(schedule))
  t.same(tokens, [
    { type: 'work', length: 8 }
  ])
  t.end()
})

tape('一班八小時', function (t) {
  let schedule = 'x'.repeat(8 * 60)

  let tokens = simplify(lexer(schedule))
  t.same(tokens, [
    { type: 'work', length: 480 }
  ])
  t.end()
})

tape('一班 12 小時', function (t) {
  let schedule = 'x'.repeat(12 * 60)

  let tokens = simplify(lexer(schedule))
  t.same(tokens, [
    { type: 'work', length: 720 }
  ])
  t.end()
})

tape('一班 12 小時又 1 分鐘', function (t) {
  let schedule = 'x'.repeat(12 * 60) + 'x'

  let tokens = simplify(lexer(schedule))
  t.same(tokens, [
    { type: 'work', length: 720 },
    { type: 'invalid', length: 1 }
  ])
  t.end()
})

tape('一班 24 小時', function (t) {
  let schedule = 'x'.repeat(24 * 60)

  let tokens = simplify(lexer(schedule))
  t.same(tokens, [
    { type: 'work', length: 720 },
    { type: 'invalid', length: 720 }
  ])
  t.end()
})

tape('一班 12 小時，中間有休息', function (t) {
  let schedule = 'x'.repeat(5 * 60) + '.'.repeat(2 * 60) + 'x'.repeat(5 * 60)

  let tokens = simplify(lexer(schedule))
  t.same(tokens, [
    { type: 'work', length: 720 }
  ])
  t.end()
})

tape('一班 12 小時，前 8 休 2 後 2', function (t) {
  let schedule = 'x'.repeat(8 * 60) + '.'.repeat(2 * 60) + 'x'.repeat(2 * 60)

  let tokens = simplify(lexer(schedule))
  t.same(tokens, [
    { type: 'work', length: 720 }
  ])
  t.end()
})

tape('一班 作 8 休 7 作 8', function (t) {
  let schedule = 'x'.repeat(8 * 60) + '.'.repeat(7 * 60) + 'x'.repeat(8 * 60)

  let tokens = simplify(lexer(schedule))
  t.same(tokens, [
    { type: 'work', length: 480 },
    { type: 'invalid', length: 900 }
  ])
  t.end()
})

tape('兩班 作 8 休 8 作 8', function (t) {
  let schedule = 'x'.repeat(8 * 60) + '.'.repeat(8 * 60) + 'x'.repeat(8 * 60)

  let tokens = simplify(lexer(schedule))
  t.same(tokens, [
    { type: 'work', length: 480 },
    { type: 'rest', length: 480 },
    { type: 'work', length: 480 }
  ])
  t.end()
})

tape('一班中兩次休息', function (t) {
  let schedule = 'x'.repeat(4 * 60) + '.'.repeat(30) + 'x'.repeat(2 * 60) + '.'.repeat(30) + 'x'.repeat(3 * 60)

  let tokens = simplify(lexer(schedule))
  t.same(tokens, [
    { type: 'work', length: 600 }
  ])
  t.end()
})

tape('假日', function (t) {
  let schedule = '.'.repeat(24 * 60)

  let tokens = simplify(lexer(schedule))
  t.same(tokens, [
    { type: 'fullRest', length: 1440 }
  ])
  t.end()
})

tape('不完整假日', function (t) {
  let schedule = '.'.repeat(24 * 60 - 1)

  let tokens = simplify(lexer(schedule))
  t.same(tokens, [
    { type: 'invalid', length: 1439 }
  ])
  t.end()
})

tape('invalid without continueWhenError', function (t) {
  let schedule = 'x'.repeat(8 * 60) + '.'.repeat(8 * 60 - 1) + 'x'.repeat(8 * 60)

  let tokens = simplify(lexer(schedule))
  t.same(tokens, [
    { type: 'work', length: 480 },
    { type: 'invalid', length: 959 }
  ])
  t.end()
})

tape('invalid with continueWhenError', function (t) {
  let schedule = 'x'.repeat(8 * 60) + '.'.repeat(8 * 60 - 1) + 'x'.repeat(8 * 60)

  let tokens = simplify(lexer(schedule, true))
  t.same(tokens, [
    { type: 'work', length: 480 },
    { type: 'invalid', length: 479 },
    { type: 'work', length: 480 }
  ])
  t.end()
})

// 只取出 type 跟時段長度
function simplify (tokens) {
  return tokens.map(t => { return { type: t.type, length: t.value.length } })
}
