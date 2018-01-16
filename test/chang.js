const tape = require('tape')
const Schedule = require('../schedule')
const tokenizer = require('../tokenizer')
const moment = require('moment')

tape('台鐵班表, 不包含整備時間、隱形工時', function (t) {
  let s = Schedule.fromTime([
    ['2017-12-01 09:36:00', '2017-12-01 19:44:00'],
    ['2017-12-02 05:30:00', '2017-12-02 10:14:00'],
    ['2017-12-04 16:16:00', '2017-12-04 21:04:00'],
    ['2017-12-05 07:36:00', '2017-12-05 13:15:00'],
    ['2017-12-07 10:37:00', '2017-12-07 16:11:00'],
    ['2017-12-08 13:50:00', '2017-12-08 23:58:00'],
    ['2017-12-09 08:18:00', '2017-12-09 09:19:00'],
    ['2017-12-11 10:00:00', '2017-12-11 18:24:00'],
    ['2017-12-12 18:27:00', '2017-12-12 22:16:00'],
    ['2017-12-13 07:02:00', '2017-12-13 11:20:00'],
    ['2017-12-14 12:29:00', '2017-12-14 22:58:00'],
    // invalid rest: not enough time
    ['2017-12-15 05:25:00', '2017-12-15 08:17:00'],
    ['2017-12-17 15:40:00', '2017-12-18 00:26:00'],
    ['2017-12-18 07:35:00', '2017-12-18 10:09:00'],
    ['2017-12-19 16:16:00', '2017-12-19 21:04:00'],
    ['2017-12-20 07:40:00', '2017-12-20 13:15:00'],
    ['2017-12-21 13:10:00', '2017-12-21 23:23:00'],
    ['2017-12-22 09:00:00', '2017-12-22 09:34:00']
  ])

  let tokens = prettify(moment('2017-12-01 09:36:00'), tokenizer(s))
  t.same(tokens.length, 22)
  t.same(tokens[tokens.length - 1].type, 'invalid')
  t.ok(tokens[tokens.length - 1].time.isSame(moment('2017-12-14 22:58:00')))

  t.end()
})

function prettify (startTime, tokens) {
  return tokens.map(t => { return { type: t.type, length: t.value.length, line: t.line, time: offset2time(startTime, t.offset) } })
}

function offset2time (startTime, offset) {
  return startTime.clone().add(offset, 'minutes')
}
