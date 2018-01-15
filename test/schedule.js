const tape = require('tape')
const schedule = require('../schedule')

tape('上班八小時', function (t) {
  let s = schedule([
    ['2018-01-01 00:00:00', '2018-01-01 08:00:00']
  ])

  t.same(s, 'x'.repeat(8 * 60))
  t.end()
})

tape('隱藏工時', function (t) {
  let s = schedule([
    ['2018-01-01 00:00:00', '2018-01-01 08:00:00']
  ], { before: '10 minutes', after: '30 minutes' })

  t.same(s, 'x'.repeat(10) + 'x'.repeat(8 * 60) + 'x'.repeat(30))
  t.end()
})

tape('上班間休息', function (t) {
  let s = schedule([
    ['2018-01-01 00:00:00', '2018-01-01 08:00:00'],
    ['2018-01-02 00:00:00', '2018-01-02 08:00:00']
  ])

  t.same(s, 'x'.repeat(8 * 60) + '.'.repeat(16 * 60) + 'x'.repeat(8 * 60))
  t.end()
})

tape('time format', function (t) {
  let s = schedule([
    ['2018/01/01 00:00:00', '2018/01/01 08:00:00']
  ], { format: 'YYYY/MM/DD HH:mm:ss' })

  t.same(s, 'x'.repeat(8 * 60))
  t.end()
})
