const tape = require('tape')
const lexer = require('../src/lexer')

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

tape('單週正常工時 - 每週五天 8 小時', function (t) {
  let workday = 'x'.repeat(8 * 60) + '.'.repeat(16 * 60)
  let restDay = '.'.repeat(24 * 60)

  let schedule = workday + workday + workday + workday + workday + restDay + restDay

  let tokens = simplify(lexer(schedule, true))
  t.same(tokens, [
    { type: 'work', length: 480 },
    { type: 'rest', length: 960 },
    { type: 'work', length: 480 },
    { type: 'rest', length: 960 },
    { type: 'work', length: 480 },
    { type: 'rest', length: 960 },
    { type: 'work', length: 480 },
    { type: 'rest', length: 960 },
    { type: 'work', length: 480 },
    { type: 'fullRest', length: (16 + 24 + 24) * 60 }
  ])
  t.end()
})

tape('兩週變形工時 - 每週四天 10 小時', function (t) {
  let workday = 'x'.repeat(10 * 60) + '.'.repeat(14 * 60)
  let restDay = '.'.repeat(24 * 60)

  let schedule = workday + workday + workday + workday + restDay + restDay + restDay

  let tokens = simplify(lexer(schedule, true))
  t.same(tokens, [
    { type: 'work', length: 600 },
    { type: 'rest', length: 840 },
    { type: 'work', length: 600 },
    { type: 'rest', length: 840 },
    { type: 'work', length: 600 },
    { type: 'rest', length: 840 },
    { type: 'work', length: 600 },
    { type: 'fullRest', length: 5160 }
  ])
  t.end()
})

tape('兩週變形工時 - 每週四天 10 小時，中間有休息 2 小時', function (t) {
  let workday = 'x'.repeat(5 * 60) + '.'.repeat(2 * 60) + 'x'.repeat(5 * 60) + '.'.repeat(14 * 60)
  let restDay = '.'.repeat(24 * 60)

  let schedule = workday + workday + workday + workday + restDay + restDay + restDay

  let tokens = simplify(lexer(schedule, true))
  t.same(tokens, [
    { type: 'work', length: 720 },
    { type: 'rest', length: 840 },
    { type: 'work', length: 720 },
    { type: 'rest', length: 840 },
    { type: 'work', length: 720 },
    { type: 'rest', length: 840 },
    { type: 'work', length: 720 },
    { type: 'fullRest', length: 5160 }
  ])
  t.end()
})

tape('四週變形工時 - 做二休二', function (t) {
  let workday = 'x'.repeat(4 * 60) + '.'.repeat(60) + 'x'.repeat(4 * 60) + '.'.repeat(60) + 'x'.repeat(2 * 60) + '.'.repeat(12 * 60)
  let restDay = '.'.repeat(24 * 60)

  let schedule = workday + workday + restDay + restDay + workday + workday + restDay + restDay

  let tokens = simplify(lexer(schedule, true))
  t.same(tokens, [
    { type: 'work', length: 720 },
    { type: 'rest', length: 720 },
    { type: 'work', length: 720 },
    { type: 'fullRest', length: 3600 },
    { type: 'work', length: 720 },
    { type: 'rest', length: 720 },
    { type: 'work', length: 720 },
    { type: 'fullRest', length: 3600 }
  ])
  t.end()
})

tape('八週變形工時 - 休息日集中最後兩週', function (t) {
  let workday = 'x'.repeat(4 * 60) + '.'.repeat(60) + 'x'.repeat(4 * 60) + '.'.repeat(15 * 60)
  let restDay = '.'.repeat(24 * 60)
  let workWeek = workday.repeat(6) + restDay
  let schedule = workWeek.repeat(6) + workday.repeat(4) + restDay.repeat(10)

  let tokens = simplify(lexer(schedule, true))
  t.same(tokens, [
    // 第一週
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'fullRest', length: 2340 },
    // 第二週
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'fullRest', length: 2340 },
    // 第三週
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'fullRest', length: 2340 },
    // 第四週
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'fullRest', length: 2340 },
    // 第五週
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'fullRest', length: 2340 },
    // 第六週
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'fullRest', length: 2340 },
    // 第七週，只工作四天
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    { type: 'rest', length: 900 },
    { type: 'work', length: 540 },
    // 連休 10 天
    { type: 'fullRest', length: 15300 }
  ]
  )
  t.end()
})

// 只取出 type 跟時段長度
function simplify (tokens) {
  return tokens.map(t => { return { type: t.type, length: t.value.length } })
}
