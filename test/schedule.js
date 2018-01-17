const tape = require('tape')
const Schedule = require('../schedule')
const moment = require('moment')

tape('from/to string', function (t) {
  let data = `
    foo = 1
    bar = hi
--
    xxxxxxxxxx
  `

  let s = Schedule.fromData(data)
  t.same(s.header, { foo: '1', bar: 'hi' })
  t.same(s.body, 'xxxxxxxxxx')

  let x = s.toString()
  t.same(x, `foo=1\nbar=hi\n--\nxxxxxxxxxx`)
  t.end()
})

tape('headers containing \'--\'', function (t) {
  let data = `
    foo = 1--
    bar = hi
--
    xxxxxxxxxx
  `

  let s = Schedule.fromData(data)
  t.same(s.header, { foo: '1--', bar: 'hi' })
  t.same(s.body, 'xxxxxxxxxx')

  let x = s.toString()
  t.same(x, `foo=1--\nbar=hi\n--\nxxxxxxxxxx`)
  t.end()
})

tape('上班八小時', function (t) {
  let s = Schedule.fromTime([
    ['2018-01-01 00:00:00', '2018-01-01 08:00:00']
  ])

  t.same(s.body, 'x'.repeat(8 * 60))
  t.ok(s.header.start.isSame(moment('2018-01-01 00:00:00')))
  t.end()
})

tape('隱藏工時', function (t) {
  let s = Schedule.fromTime([
    ['2018-01-01 00:00:00', '2018-01-01 08:00:00']
  ], { before: '10 minutes', after: '30 minutes' })

  t.same(s.body, 'x'.repeat(10) + 'x'.repeat(8 * 60) + 'x'.repeat(30))
  t.end()
})

tape('上班間休息', function (t) {
  let s = Schedule.fromTime([
    ['2018-01-01 00:00:00', '2018-01-01 08:00:00'],
    ['2018-01-02 00:00:00', '2018-01-02 08:00:00']
  ])

  t.same(s.body, 'x'.repeat(8 * 60) + '.'.repeat(16 * 60) + 'x'.repeat(8 * 60))
  t.end()
})

tape('time format', function (t) {
  let s = Schedule.fromTime([
    ['2018/01/01 00:00:00', '2018/01/01 08:00:00']
  ], { format: 'YYYY/MM/DD HH:mm:ss' })

  t.same(s.body, 'x'.repeat(8 * 60))
  t.end()
})
