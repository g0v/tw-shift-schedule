var moo = require('moo')

module.exports = function (schedule, continueWhenError) {
  var lexer = moo.compile({
    // 一個班（中間可能有休息）
    work: /x.{1,718}x/,
    // 休息（至少 8 小時）
    rest: /\.{480,}/,
    // everything else is invalid
    invalid: moo.error
  })
  var body = schedule.body

  body += '\n'
  // remove comments
  body = body.replace(/#.+\n/, '')

  // ignore all spaces within the body
  body = body.replace(/\s/g, '')

  var tokens = getTokens(lexer.reset(body))

  if (!continueWhenError) {
    return tokens
  }

  while (tokens[tokens.length - 1].type === 'invalid') {
    var segStart = 0
    if (tokens.length > 1) {
      var lastValidToken = tokens[tokens.length - 2]
      segStart = lastValidToken.offset + lastValidToken.value.length + 1
    }
    // skip the first segment of body
    var x = body[segStart]
    var nextSegStart = 0
    for (var i = segStart; i < body.length; i++) {
      if (body[i] !== x) {
        // found the end of segment

        nextSegStart = i
        break
      }
    }
    var skipLength = nextSegStart - segStart + 1

    body = body.slice(nextSegStart, body.length)
    tokens[tokens.length - 1].value = tokens[tokens.length - 1].text = tokens[tokens.length - 1].value.slice(0, skipLength)
    tokens = tokens.concat(getTokens(lexer.reset(body)))
    break
  }

  return tokens
}

function getTokens (tokenizer) {
  var ts = []
  while (true) {
    var token = tokenizer.next()
    if (!token) break

    ts.push(token)
  }
  return ts
}
