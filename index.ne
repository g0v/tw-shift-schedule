@{%
const moo = require('moo')

const lexer = moo.compile({
  // maximum 12 hours of work
  work: /(?:^|\.+)x{1,12}/,
  // rest need at least 8 hours
  rest: /\.{8,}/,
  // everything else is invalid
  'invalid schedule': moo.error
})
%}

@lexer lexer

session ->
  %work:? %rest