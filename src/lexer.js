var moo = require('moo')

// Lexer: 利用 moo.lexer 對工作記錄進行切段，可以做出以下判斷：
// * 上班時間是否超過 12 小時？
// * 兩個上班時段間的休息時間，應該是休息時間，還是下班時間？
// * 上班後是否有至少 8 小時的休息？
//
// lexer 只負責檢查「單一工作時段是否合法」
// 多個工作時段之間的關係，例如：每週含加班工時上限 72 小時、變形工時的休假日數等，不在此檢查
// **note: 因為變形工時不會增加工作時數，單日工時上限也相同，因此 lexer 一定要通過才有可能是合法的變形工時
module.exports = function (scheduleData) {
  let lexer = moo.compile({
    fullRest: /\.{1440,}/,
    work: /x+/,
    rest: /\.+/,
    invalid: moo.error
  })

  // 補上最後的 newline 方便 lexer 處理
  if (!scheduleData.endsWith('\n')) {
    scheduleData += '\n'
  }

  // remove comments
  scheduleData = scheduleData.replace(/#.+\n/, '')

  // ignore all spaces within the scheduleData
  scheduleData = scheduleData.replace(/\s/g, '')

  lexer.reset(scheduleData)

  let tokens = []
  var token
  let minuteWorked = 0
  let workTokens = []
  while (token = lexer.next()) {
    if (token.type === 'fullRest') {
      minuteWorked = 0

      pushWorkTokensIfNotEmpty()
      tokens.push(token)
    }
    if (token.type === 'rest') {
      if (token.value.length >= 8 * 60) {
        minuteWorked = 0

        pushWorkTokensIfNotEmpty()
        tokens.push(token)
      } else {
        workTokens.push(token)
      }
    }

    if (token.type === 'work') {
      minuteWorked += token.value.length

      if (minuteWorked > 12 * 60) {
        pushWorkTokensIfNotEmpty()
        tokens.push({ type: 'invalid', value: token.value, offset: token.offset })
        break
      }
      workTokens.push(token)
    }
  }

  pushWorkTokensIfNotEmpty()

  return tokens

  function pushWorkTokensIfNotEmpty () {
    if (workTokens.length > 0) {
      let combinedWorkToken = { type: 'work', value: '', offset: workTokens[0].offset }

      for (let t of workTokens) {
        combinedWorkToken.value += t.value
      }

      tokens.push(combinedWorkToken)
      workTokens = []
    }
  }
}
