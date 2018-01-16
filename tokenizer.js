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
  let body = schedule.body

  body += '\n'
  // remove comments
  body = body.replace(/#.+\n/, '')

  // ignore all spaces within the body
  return getTokens(lexer.reset(body.replace(/\s/g, '')))
}

function getTokens (tokenizer) {
  let ts = []
  while (true) {
    let token = tokenizer.next()
    if (!token) break

    ts.push(token)
  }
  return ts
}
