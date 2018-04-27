var moo = require('moo')

module.exports = function (schedule, continueWhenInvalid) {
  var lexer = moo.states({
    workingDay: {
      // 一個班（中間可能有休息）
      work: { match: /x(?:.{1,718}x)?/, next: 'resting' },
      // 休息（至少 8 小時）
      rest: /\.{480,}/,
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
  var body = schedule.body

  body += '\n'
  // remove comments
  body = body.replace(/#.+\n/, '')

  // ignore all spaces within the body
  body = body.replace(/\s/g, '')

  var tokens = Array.from(lexer.reset(body))

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
    tokens = tokens.concat(Array.from(lexer.reset(body)))
    break
  }

  return tokens
}
