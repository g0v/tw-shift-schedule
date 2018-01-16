const moo = require('moo')

module.exports = function (schedule, continueWhenError) {
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
  body = body.replace(/\s/g, '')

  let tokens = getTokens(lexer.reset(body))

  if (!continueWhenError) {
    return tokens
  }

  while (tokens[tokens.length - 1].type === 'invalid') {
    let segStart = 0
    if (tokens.length > 1) {
      let lastValidToken = tokens[tokens.length - 2]
      segStart = lastValidToken.offset + lastValidToken.value.length + 1
    }
    // skip the first segment of body
    let x = body[segStart]
    let nextSegStart = 0
    for (let i = segStart; i < body.length; i++) {
      if (body[i] !== x) {
        // found the end of segment

        nextSegStart = i
        break
      }
    }
    let skipLength = nextSegStart - segStart + 1

    body = body.slice(nextSegStart, body.length)
    tokens[tokens.length - 1].value = tokens[tokens.length - 1].text = tokens[tokens.length - 1].value.slice(0, skipLength)
    tokens = tokens.concat(getTokens(lexer.reset(body)))
    break
  }

  return tokens
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
