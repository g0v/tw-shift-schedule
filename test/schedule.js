const tape = require('tape')
const gen = require('../schedule')
const moment = require('moment')

tape('上班八小時', function (t) {
  let schedule = gen([
    ['2018-01-01 00:00:00', '2018-01-01 08:00:00']
  ], moment.ISO_8601)

  t.same(schedule, 'x'.repeat(8 * 60))
  t.end()
})

tape('上班間休息', function (t) {
  let schedule = gen([
    ['2018-01-01 00:00:00', '2018-01-01 08:00:00'],
    ['2018-01-02 00:00:00', '2018-01-02 08:00:00']
  ], moment.ISO_8601)

  t.same(schedule, 'x'.repeat(8 * 60) + '.'.repeat(16 * 60) + 'x'.repeat(8 * 60))
  t.end()
})
