const moo = require('moo')

module.exports = function (schedule, context) {
  let lexer = moo.compile({
    comment: /#.+/,
    work: /(?:(?:(?:^|\.+)x.{1,718}x)|(?:^|\.+)x{1,480})/,
    // 休息（至少 8 小時）
    rest: /\.{480,}/,
    // everything else is invalid
    invalid: moo.error
  })

  // ignore all spaces within the schedule
  return lexer.reset(schedule.replace(/\s/g, ''))
}
