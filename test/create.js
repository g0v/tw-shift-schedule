const tape = require('tape')
const create = require('../src/create')

tape('1', function (t) {
  let schedules = create(1, [
    { from: '2018-09-08 09:00:00', to: '2018-09-08 15:00:00', required: 1 }
  ])

  t.same(schedules, [[['2018-09-08 09:00:00', '2018-09-08 15:00:00']]])
  t.end()
})

tape('1 < 2', function (t) {
  t.throws(() => {
    create(1, [
      { from: '2018-09-08 09:00:00', to: '2018-09-08 15:00:00', required: 2 }
    ])
  })

  t.end()
})

tape('2', function (t) {
  let schedules = create(2, [
    { from: '2018-09-08 09:00:00', to: '2018-09-08 15:00:00', required: 2 }
  ])

  t.same(schedules,
    [
      [['2018-09-08 09:00:00', '2018-09-08 15:00:00']],
      [['2018-09-08 09:00:00', '2018-09-08 15:00:00']]
    ]
  )
  t.end()
})

tape('last shift worked first', function (t) {
  let schedules = create(2, [
    { from: '2018-09-08 09:00:00', to: '2018-09-08 12:00:00', required: 2 },
    { from: '2018-09-08 13:00:00', to: '2018-09-08 15:00:00', required: 1 }
  ])

  t.same(schedules,
    [
      [['2018-09-08 09:00:00', '2018-09-08 12:00:00'], ['2018-09-08 13:00:00', '2018-09-08 15:00:00']],
      [['2018-09-08 09:00:00', '2018-09-08 12:00:00']]
    ]
  )
  t.end()
})
