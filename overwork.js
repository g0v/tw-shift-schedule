var tokenizer = require('./tokenizer')

var Causes = {
  irregular: '不規律的工作',
  longHours: '長時間工作',
  nightShift: '夜班',
  previousDayOverwork: '前一天長時間工作',
  previousWeekOverwork: '前一週長時間工作',
  previousMonthOvertime: '前一個月加班時數 > 100',
  previousSixMonthsOvertime: '前六個月加班時數平均 > 45'
}

module.exports = { Causes, check }

// 過勞定義 http://www.mqjh.tp.edu.tw/mediafile/1901/news/19/2016-1/22016-1-24-21-27-24-nf1.pdf
function check (schedule) {
  var causes = []
  // 只取出工作時段
  var tokens = prettify(schedule.header.start, tokenizer(schedule)).filter(t => t.type === 'work')
  // 是否不規律

  // 假設：如果每班的開始時間跟結束時間都不在同個小時內就當作不規律
  var shiftStart
  var shiftEnd
  for (var t of tokens) {
    if (!shiftStart) {
      shiftStart = t.time
      shiftEnd = shiftStart.clone().add(t.length, 'minutes')
      continue
    }

    if (shiftStart.hour() !== t.time.hour() && shiftEnd.hour() !== t.time.hour()) {
      causes.push(Causes.irregular)
      break
    }
  }

  // 長時間
  // 假設平均工時大於 8 小時就是長時間
  var avgLength = (tokens.map(t => t.length).reduce((sum, x) => sum + x, 0) / 60) / tokens.length
  if (avgLength > 8) {
    causes.push(Causes.longHours)
  }

  // 夜班
  // 下午 10 點 ~ 早上 6 點 = 夜班
  for (var t of tokens) {
    var startHour = t.time.hour()
    var endHour = t.time.clone().add(t.length, 'minutes').hour()
    if ((startHour >= 22 || startHour <= 6) || (endHour >= 22 || endHour <= 6)) {
      causes.push(Causes.nightShift)
      break
    }
  }

  // 短期工作過重
  // 前一日
  // 前一日是否比平均工時還長？
  if ((tokens[tokens.length - 1].length / 60) > avgLength) {
    causes.push(Causes.previousDayOverwork)
  }
  // 前一週
  // 前一週是否比平均工時還長？
  if (tokens.length >= 7 && lastAvgLenthInHour(tokens, 7) > avgLength) {
    causes.push(Causes.previousWeekOverwork)
  }

  // 長期工作過重
  // 加班時數
  // 加班時數定義：每週 40 小時之外的工時
  // 前一個月加班超過 100 小時
  if (tokens.length >= 30 && (sumLastLengthInHour(tokens, 30) - 40 * 4) > 100) causes.push(Causes.previousMonthOvertime)

  // 前一至六個月平均加班超過 45 小時
  if (tokens.length >= 180 && ((sumLastLengthInHour(tokens, 180) / 6) - 40 * 4) > 45) causes.push(Causes.previousSixMonthsOvertime)

  return causes
}

function lastAvgLenthInHour (tokens, length) {
  return sumLastLengthInHour(tokens, length) / length
}

function sumLastLengthInHour (tokens, length) {
  var l = 0
  for (var i = tokens.length - 1; i > tokens.length - 1 - length; i--) {
    l += tokens[i].length
  }
  return l / 60
}

function prettify (startTime, tokens) {
  return tokens.map(t => { return { type: t.type, length: t.value.length, line: t.line, time: offset2time(startTime, t.offset) } })
}

function offset2time (startTime, offset) {
  return startTime.clone().add(offset, 'minutes')
}
