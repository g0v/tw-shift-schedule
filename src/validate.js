const lexer = require('./lexer')

const transformed = {
  two_week: 'two_week_transformed',
  four_week: 'four_week_transformed',
  eight_week: 'eight_week_transformed'
}

function validate (schedule, opts) {
  if (!opts || !opts.transformed) {
    return validateNormal(schedule)
  }

  // FIXME: 如果班表的開頭不是變形工時週期的開頭，會無法正確判斷
  switch (opts.transformed) {
    case transformed.two_week:
      return validateTwoWeekTransformed(schedule)
    case transformed.four_week:
      return validateFourWeekTransformed(schedule)
    case transformed.eight_week:
      return validateEightWeekTransformed(schedule)
  }

  throw (new Error('Invalid transform: ', opts.transformed))
}

function validateNormal (schedule) {
  let ret = []
  let tokens = lexer(schedule.body)
  let invalidOffset = findInvalidToken(tokens)
  if (invalidOffset !== -1) {
    ret.push({ type: 'error', msg: '工時違法', offset: invalidOffset })
  }

  // TODO: 一個月加班不可超過 46 小時（勞資會議可提高至 56 小時）
  // 按照每月切開
  let overworkedMinutesPerMonth = splitByMonth(schedule.start, tokens)
    // 將每月按照每週切開
    .map(([monthStartTime, monthlyTokens]) => {
      return splitBy7Day(schedule.start, monthStartTime, monthlyTokens)
    })
    // 每週超過 40 小時的就是加班時間
    .map(tokensPerWeekPerMonth => {
      return tokensPerWeekPerMonth.map(([splitStartTime, tokensPerWeek]) => {
        console.log(splitStartTime)

        let workMinutes = totalWorkMinutes(tokensPerWeek)
        return workMinutes > 40 * 60 ? workMinutes - 40 * 60 : 0
      })
    })
    // 每個月內的加班時間各自加總
    .map(weeklyOverworkedMinutesPerMonth => {
      console.log('weekly', weeklyOverworkedMinutesPerMonth)
      return weeklyOverworkedMinutesPerMonth.reduce((x, y) => x + y, 0)
    })

  let startTimeOfMonth = splitByMonth(schedule.start, tokens)
    .map(([splitStartTime, monthlyTokens]) => {
      return splitStartTime
    })

  for (let i = 0; i < overworkedMinutesPerMonth.length; i++) {
    let m = overworkedMinutesPerMonth[i]
    if (m > 46 * 60) {
      ret.push({ type: 'error', offset: startTimeOfMonth[i].clone().diff(schedule.start, 'minute'), msg: '單月加班時數超過上限' })
      console.log(i, overworkedMinutesPerMonth[i])
    }
  }

  console.log(overworkedMinutesPerMonth)

  // 一週內要有一個例假
  let e = assertMaxWorkDayCountInPeriod(tokens, 7, 6, '每週至少要有一個例假')
  if (e) {
    ret.push(e)
  }

  return ret
}

function validateTwoWeekTransformed (schedule) {
  let ret = []
  let tokens = lexer(schedule.body)
  let invalidOffset = findInvalidToken(tokens)
  if (invalidOffset !== -1) {
    ret.push({ type: 'error', msg: '工時違法', offset: invalidOffset })
  }

  // 如果給的班表長度小於兩週，無法真正判斷是否符合雙週變形工時
  if (totalTokenLength(tokens) < 60 * 24 * 14) {
    ret.push({ type: 'warning', msg: '班表不完整，無法正確檢驗變形工時' })
  }

  // TODO: 如果班表長度小於一個月，且加班時數小於上限，給一個警告提醒，可能會超過上限

  // 不可連續工作超過六日
  let e = assertContinuousWorkDay(tokens, 6, '連續工作超過六日')
  if (e) {
    ret.push(e)
  }

  // 兩週內要有兩個例假
  e = assertMaxWorkDayCountInPeriod(tokens, 14, 12, '兩週內應有兩個例假')
  if (e) {
    ret.push(e)
  }

  return ret
}

function validateFourWeekTransformed (schedule) {
  let ret = []
  let tokens = lexer(schedule.body)
  let invalidOffset = findInvalidToken(tokens)
  if (invalidOffset !== -1) {
    ret.push({ type: 'error', msg: '工時違法', offset: invalidOffset })
  }

  // 如果給的班表長度小於四週，無法真正判斷是否符合雙週變形工時
  if (totalTokenLength(tokens) < 60 * 24 * 4 * 7) {
    ret.push({ type: 'warning', msg: '班表不完整，無法正確檢驗變形工時' })
  }
  // TODO: 如果班表長度小於一個月，且加班時數小於上限，給一個警告提醒，可能會超過上限

  // 四週內要有四個例假
  let e = assertMaxWorkDayCountInPeriod(tokens, 7 * 4, 7 * 4 - 4, '四週內應有四個例假')
  if (e) {
    ret.push(e)
  }

  // 兩週內要有兩個例假
  e = assertMaxWorkDayCountInPeriod(tokens, 7 * 2, 7 * 2 - 2, '每兩週內應有兩個例假')
  if (e) {
    ret.push(e)
  }

  return ret
}

function validateEightWeekTransformed (schedule) {
  let ret = []
  let tokens = lexer(schedule.body)
  let invalidOffset = findInvalidToken(tokens)
  if (invalidOffset !== -1) {
    ret.push({ type: 'error', msg: '工時違法', offset: invalidOffset })
  }

  // 如果給的班表長度小於八週，無法真正判斷是否符合雙週變形工時
  if (totalTokenLength(tokens) < 60 * 24 * 8 * 7) {
    ret.push({ type: 'warning', msg: '班表不完整，無法正確檢驗變形工時' })
  }
  // TODO: 如果班表長度小於一個月，且加班時數小於上限，給一個警告提醒，可能會超過上限

  // 不可連續工作超過六日
  let e = assertContinuousWorkDay(tokens, 6, '連續工作超過六日')
  if (e) {
    ret.push(e)
  }

  // 八週內要有八個例假
  e = assertMaxWorkDayCountInPeriod(tokens, 7 * 8, 7 * 8 - 8, '八週內應有八個例假')
  if (e) {
    ret.push(e)
  }

  return ret
}

function findInvalidToken (tokens) {
  let offset = 0
  for (let t of tokens) {
    if (t.type === 'invalid') {
      return offset
    }

    offset += t.value.length
  }

  return -1
}

function totalTokenLength (tokens) {
  return tokens.map(t => t.value.length).reduce((x, sum) => x + sum, 0)
}

function splitBy (startTime, tokens, splitter) {
  let currentTime = startTime.clone()
  let splitStartTime = startTime.clone()
  let split = []
  let splits = []
  for (let t of tokens) {
    split.push(t)

    currentTime.add(t.value.length, 'minute')

    if (splitter(startTime.clone(), splitStartTime, currentTime)) {
      splits.push([splitStartTime.clone(), split])
      split = []
      splitStartTime = currentTime.clone()
    }
  }

  if (split.length > 0) {
    splits.push([splitStartTime.clone(), split])
  }

  return splits
}

function splitBy7Day (scheduleStartTime, monthStartTime, tokens) {
  let currentTime = monthStartTime.clone()
  let splitStartTime = monthStartTime.clone()
  let split = []
  let splits = []
  for (let t of tokens) {
    split.push(t)

    currentTime.add(t.value.length, 'minute')

    if (currentTime.diff(scheduleStartTime.clone(), 'minutes') % (7 * 24 * 60) === 0) {
      splits.push([splitStartTime.clone(), split])
      split = []
      splitStartTime = currentTime.clone()
    }
  }

  if (split.length > 0) {
    splits.push([splitStartTime.clone(), split])
  }

  return splits
}

function splitByMonth (startTime, tokens) {
  let currentTime = startTime.clone()
  let splitStartTime = startTime.clone()
  let split = []
  let splits = []
  for (let t of tokens) {
    split.push(t)

    currentTime.add(t.value.length, 'minute')

    if (currentTime.month() !== splitStartTime.month()) {
      splits.push([splitStartTime.clone(), split])
      split = []
      splitStartTime = currentTime.clone()
    }
  }

  if (split.length > 0) {
    splits.push([splitStartTime.clone(), split])
  }

  return splits
}

function totalWorkMinutes (tokens) {
  console.log('---')
  console.log(tokens.map(t => { return { type: t.type, value: t.value.length, offset: t.offset } }))
  let workMinutes = 0
  for (let t of tokens) {
    if (t.type === 'work') {
      // 休息時間不計
      workMinutes += t.value.split('').filter(c => c === 'x').length
    }
  }

  console.log('total', workMinutes)
  return workMinutes
}

function findTokenTypeAt (tokens, pos) {
  let offset = 0
  for (let t of tokens) {
    if ((pos - offset) < t.value.length) {
      return t.type
    }

    offset += t.value.length
  }

  return undefined
}

function assertContinuousWorkDay (tokens, max, msg) {
  let continueWorked = 0
  // TODO: 直接把所有 token 出來，看有沒有連續六個 work 都沒有 fullrest 即可
  for (let i = 0; ; i += 24 * 60) {
    let tokenType = findTokenTypeAt(tokens, i)
    if (!tokenType) break

    if (tokenType === 'fullRest') {
      continueWorked = 0
    } else {
      continueWorked += 1
      if (continueWorked > max) {
        return { type: 'error', msg: msg, offset: i }
      }
    }
  }

  return undefined
}

function assertMaxWorkDayCountInPeriod (tokens, period, maxWorkDayCount, msg) {
  let workday = 0
  for (let i = 0; ; i += 24 * 60) {
    let tokenType = findTokenTypeAt(tokens, i)
    if (!tokenType) {
      if (workday > maxWorkDayCount) {
        return { type: 'error', msg: msg, offset: i }
      }
      break
    }

    if (tokenType !== 'fullRest') {
      workday += 1
    }

    if (i !== 0 && (i % (24 * 60 * (period - 1)) === 0)) {
      if (workday > maxWorkDayCount) {
        return { type: 'error', msg: msg, offset: i }
      }
      workday = 0
    }
  }
}

module.exports = validate
module.exports.transformed = transformed
