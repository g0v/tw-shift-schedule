var moo = require('moo')

// Tokenizer: 利用 moo.lexer 對工作記錄進行切段，可以做出以下判斷：
// * 上班時間是否超過 12 小時？
// * 兩個上班時段間的休息時間，應該是休息時間，還是下班時間？
// * 上班後是否有至少 8 小時的休息？
module.exports = function (scheduleData, continueWhenInvalid) {
  var lexer = moo.states({
    // 一個工作日可能是：
    // 1. 一個假日
    // 2. 一個上班日，上班日中的工作不能超過 12 小時
    workingDay: {
      // 一個班（中間可能有休息），一旦工作，就必須要有對應的休息，跳進 resting state 檢查是否有休息
      work: { match: /x(?:.{1,718}x)?/, next: 'resting' },
      // 完整假日(24hr)
      fullRest: /\.{1440,}/,
      // everything else is invalid
      invalid: moo.error
    },
    resting: {
      // 休息（至少 8 小時）
      rest: { match: /\.{480,}/, next: 'workingDay' },
      // everything else is invalid
      invalid: moo.error
    }
  })

  scheduleData += '\n'
  // remove comments
  scheduleData = scheduleData.replace(/#.+\n/, '')

  // ignore all spaces within the scheduleData
  scheduleData = scheduleData.replace(/\s/g, '')

  var tokens = Array.from(lexer.reset(scheduleData))

  if (!continueWhenInvalid) {
    return tokens
  }

  // continue parsing from the starting point of invalid token
  while (tokens[tokens.length - 1].type === 'invalid') {
    var segStart = 0
    if (tokens.length > 1) {
      var lastValidToken = tokens[tokens.length - 2]
      segStart = lastValidToken.offset + lastValidToken.value.length + 1
    }
    // skip the first segment of scheduleData (the invalid segment)
    var v = scheduleData[segStart]
    var nextSegStart = 0
    for (var i = segStart; i < scheduleData.length; i++) {
      if (scheduleData[i] !== v) {
        // found the end of segment

        nextSegStart = i
        break
      }
    }
    var skipLength = nextSegStart - segStart + 1

    scheduleData = scheduleData.slice(nextSegStart, scheduleData.length)
    tokens[tokens.length - 1].value = tokens[tokens.length - 1].text = tokens[tokens.length - 1].value.slice(0, skipLength)
    tokens = tokens.concat(Array.from(lexer.reset(scheduleData)))
    break
  }

  return tokens
}
