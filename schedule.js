// generate shift schedule from punch time
const moment = require('moment')

module.exports = function (punches, opts) {
  if (!opts) opts = {}
  if (!opts.format) opts.format = moment.ISO_8601

  let schedule = ''
  punches.forEach((p, i) => {
    let start = moment(p[0], opts.format)
    if (opts.before) {
      start.subtract(parseTimeOpt(opts.before))
    }
    let end = moment(p[1], opts.format)
    if (opts.after) {
      end.add(parseTimeOpt(opts.after))
    }

    if (i > 0) {
      let restDuration = moment.duration(
        start.diff(moment(punches[i - 1][1], opts.format))
      ).asMinutes()

      for (let j = 0; j < restDuration; j++) {
        schedule += '.'
      }
    }

    let duration = moment.duration(end.diff(start)).asMinutes()
    for (let j = 0; j < duration; j++) {
      schedule += 'x'
    }
  })

  return schedule
}

function parseTimeOpt (opt) {
  let o = opt.split(' ')
  return moment.duration(+o[0], o[1])
}
