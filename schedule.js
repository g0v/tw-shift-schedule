// generate shift schedule from punch time
const moment = require('moment')

module.exports = function (punches, format) {
  if (!format) format = moment.ISO_8601

  let schedule = ''
  punches.forEach((p, i) => {
    let start = moment(p[0], format)
    let end = moment(p[1], format)

    if (i > 0) {
      let restDuration = moment.duration(
        start.diff(moment(punches[i - 1][1], format))
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
