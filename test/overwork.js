const tape = require('tape')
const Schedule = require('../schedule')
const overwork = require('../overwork')
const moment = require('moment')

tape('只有一天的班表，沒有過勞', function (t) {
  let s = Schedule.fromTime([
    ['2018-01-01 08:00:00', '2018-01-01 16:00:00']
  ])

  t.same(overwork.check(s), [])
  t.end()
})

tape('兩天的班表，沒有過勞', function (t) {
  let s = Schedule.fromTime([
    ['2018-01-01 08:00:00', '2018-01-01 16:00:00'],
    ['2018-01-02 08:00:00', '2018-01-02 16:00:00']
  ])

  t.same(overwork.check(s), [])
  t.end()
})

tape('不規律的班表', function (t) {
  let s = Schedule.fromTime([
    ['2018-01-01 08:00:00', '2018-01-01 16:00:00'],
    ['2018-01-02 10:00:00', '2018-01-02 18:00:00'],
    ['2018-01-03 08:00:00', '2018-01-03 16:00:00']
  ])

  t.same(overwork.check(s), ['不規律的工作'])
  t.end()
})

tape('夜班', function (t) {
  let s = Schedule.fromTime([
    ['2018-01-01 22:00:00', '2018-01-02 06:00:00']
  ])

  t.same(overwork.check(s), ['夜班'])
  t.end()
})

tape('短期工作過重 - 前一日', function (t) {
  let s = Schedule.fromTime([
    ['2018-01-01 22:00:00', '2018-01-02 06:00:00'],
    ['2018-01-02 20:00:00', '2018-01-03 08:00:00']
  ])

  t.same(overwork.check(s), ['不規律的工作', '長時間工作', '夜班', '前一天長時間工作'])
  t.end()
})

tape('短期工作過重 - 前一週', function (t) {
  let s = Schedule.fromTime([
    ['2018-01-01 22:00:00', '2018-01-02 06:00:00'],
    ['2018-01-02 20:00:00', '2018-01-03 08:00:00'],
    ['2018-01-03 20:00:00', '2018-01-04 08:00:00'],
    ['2018-01-04 20:00:00', '2018-01-05 08:00:00'],
    ['2018-01-05 20:00:00', '2018-01-06 08:00:00'],
    ['2018-01-06 20:00:00', '2018-01-07 08:00:00'],
    ['2018-01-07 20:00:00', '2018-01-08 08:00:00'],
    ['2018-01-08 20:00:00', '2018-01-09 08:00:00']
  ])

  t.same(overwork.check(s), ['不規律的工作', '長時間工作', '夜班', '前一天長時間工作', '前一週長時間工作'])
  t.end()
})

tape('長期工作過重 - 前一個月加班超過 100 小時', function (t) {
  let s = Schedule.fromTime(generateSchedule(12, 30))

  t.same(overwork.check(s), ['長時間工作', '前一個月加班時數 > 100'])
  t.end()
})

tape('長期工作過重 - 前六個月平均加班超過 45 小時', function (t) {
  let s = Schedule.fromTime(generateSchedule(12, 30 * 6))

  t.same(overwork.check(s), ['長時間工作', '前一個月加班時數 > 100', '前六個月加班時數平均 > 45'])
  t.end()
})

function generateSchedule (hourPerDay, day) {
  let schedule = []
  let format = 'YYYY-MM-DD HH:mm:ss'
  let start = moment('2018-06-01 07:00:00')
  for (let i = 0; i < day; i++) {
    let x = start.clone()
    schedule.push([x.format(format), x.clone().add(hourPerDay, 'hours')])
  }

  return schedule
}
