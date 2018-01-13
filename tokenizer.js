const moo = require('moo')

module.exports = function (schedule, context) {
  let lexer = moo.compile({
    comment: /#.+/,
    // 一個班
    work: /(?:(?:^|\.+)x.{1,718}x)/,
    // 休息（至少 8 小時）
    rest: /\.{480,}/,
    // everything else is invalid
    invalid: moo.error
  })

  // ignore all spaces within the schedule
  return lexer.reset(schedule.replace(/\s/g, ''))
}
