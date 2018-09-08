// usage:
// create(3, [
//   { from: '2017-12-01 09:36:00', to: '2017-12-01 19:44:00', required: 2},
//   ...
// ])

const Schedule = require('./schedule')
const validate = require('./validate')

function create (employeeCount, shifts, transformed) {
  let schedules = []
  let employees = []

  for (let i = 0; i < employeeCount; i++) {
    employees.push(i)
    schedules.push([])
  }

  // 前一班已經在工作的人，優先從這些人開始爬，以延續當日工時
  let lastShiftWorkedEmployees = []

  for (let i = 0; i < shifts.length; i++) {
    let required = shifts[i].required
    let assigned = []

    // 員工 id 列表，前一班已經在工作的排在前面
    let candidates = lastShiftWorkedEmployees.concat(employees).filter((v, i, self) => self.indexOf(v) === i)

    let ok = false

    for (let j = 0; j < candidates.length; j++) {
      let employee = candidates[j]
      schedules[employee].push([shifts[i].from, shifts[i].to])

      if (validate(Schedule.fromTime(schedules[employee]), { transformed }).length === 0) {
        // 排班合法，進入下一個
        assigned.push(employee)
      } else {
        // 排班不合法，丟掉這個排班，換試下一個
        schedules[employee].pop()
      }

      if (assigned.length === required) {
        ok = true
        break
      }

      lastShiftWorkedEmployees = assigned
    }

    if (!ok) {
      throw new Error(`Unable to schedule: ${JSON.stringify(shifts[i])}`)
    }
  }
  return schedules
}

module.exports = create
