const moo = require('moo')

module.exports = function (schedule, context) {
  let lexer = moo.compile({
    // 一個班（中間可能有休息）
    work: /x.{1,718}x/,
    // 休息（至少 8 小時）
    rest: /\.{480,}/,
    // everything else is invalid
    invalid: moo.error
  })

  schedule += '\n'
  // remove comments
  schedule = schedule.replace(/#.+\n/, '')

  // ignore all spaces within the schedule
  return lexer.reset(schedule.replace(/\s/g, ''))
}
