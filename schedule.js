// generate shift schedule from punch time
const moment = require('moment')

function Schedule (header, body) {
  this.header = header
  this.body = body
}

Schedule.fromTime = function (punches, opts) {
  let body = ''
  let header = {}

  if (!opts) opts = {}
  if (!opts.format) opts.format = moment.ISO_8601

  let start = moment(punches[0][0], opts.format)
  header.start = start

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
        body += '.'
      }
    }

    let duration = moment.duration(end.diff(start)).asMinutes()
    for (let j = 0; j < duration; j++) {
      body += 'x'
    }
  })

  return new Schedule(header, body)
}

Schedule.fromData = function (data) {
  if (!data.includes('--\n')) {
    // no header
    return new Schedule({}, data)
  }

  let parts = data.split('--\n').map(p => p.trim())
  let header = parts[0]
  let body = parts[1]
  header = header.split('\n').map(h => h.split('=').map(x => x.trim())).reduce((sum, h) => {
    sum[h[0]] = h[1]
    return sum
  }, {})

  return new Schedule(header, body)
}

Schedule.prototype.toString = function () {
  let data = ''
  for (let k in this.header) {
    data += `${k}=${this.header[k]}\n`
  }
  data += '--\n'
  data += this.body
  return data
}

module.exports = Schedule

function parseTimeOpt (opt) {
  let o = opt.split(' ')
  return moment.duration(+o[0], o[1])
}
