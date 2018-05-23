
function same (t, schedule1, schedule2) {
  t.same(schedule1.length, schedule2.length)
  for (let i = 0; i < schedule1.length; i++) {
    let x = schedule1[i]
    let y = schedule2[i]
    t.same(x.type, y.type)
    t.same(x.msg, y.msg)
    t.same(x.offset, y.offset)
    t.same(x.value, y.value)
    if (x.time) {
      t.ok(x.time.isSame(y.time), `${x.time} !== ${y.time}`)
    }
  }
}

module.exports = { same }
