# 班表小幫手

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Build Status](https://travis-ci.org/g0v/tw-shift-schedule.svg?branch=master)](https://travis-ci.org/g0v/tw-shift-schedule)

驗證班表是否合法或過勞

`npm i tw-shift-schedule`

這是班表小幫手的核心檢驗邏輯。相關的專案有：

* 前端介面：https://github.com/g0v/tw-shift-schedule-ui
* REST API：https://github.com/poga/tw-shift-schedule-api

## Usage

```javascript
const shift = require('tw-shift-schedule')

// 台鐵站長張銘元班表 from https://www.twreporter.org/a/death-of-taiwan-rail-train-conductor
let schedule = shift.Schedule.fromTime([
  ['2017-12-01 09:36:00', '2017-12-01 19:44:00'],
  ['2017-12-02 05:30:00', '2017-12-02 10:14:00'],
  ['2017-12-04 16:16:00', '2017-12-04 21:04:00'],
  ['2017-12-05 07:36:00', '2017-12-05 13:15:00'],
  ['2017-12-07 10:37:00', '2017-12-07 16:11:00'],
  ['2017-12-08 13:50:00', '2017-12-08 23:58:00'],
  ['2017-12-09 08:18:00', '2017-12-09 09:19:00'],
  ['2017-12-11 10:00:00', '2017-12-11 18:24:00'],
  ['2017-12-12 18:27:00', '2017-12-12 22:16:00'],
  ['2017-12-13 07:02:00', '2017-12-13 11:20:00'],
  ['2017-12-14 12:29:00', '2017-12-14 22:58:00'],
  ['2017-12-15 05:25:00', '2017-12-15 08:17:00'],
  ['2017-12-17 15:40:00', '2017-12-18 00:26:00'],
  ['2017-12-18 07:35:00', '2017-12-18 10:09:00'],
  ['2017-12-19 16:16:00', '2017-12-19 21:04:00'],
  ['2017-12-20 07:40:00', '2017-12-20 13:15:00'],
  ['2017-12-21 13:10:00', '2017-12-21 23:23:00'],
  ['2017-12-22 09:00:00', '2017-12-22 09:34:00']
], moment.ISO_8601)

let results = shift.validate(schedule)
console.log(results) // 檢驗結果
```

`test` 資料夾下有其他範例

## API

```javascript
const shift = require('tw-shift-schedule')
```

#### `let schedule = shift.Schedule.fromTime(times, [opts])`

 從給定的時間 `times` 建立一個班表資料。

 * times: 二維陣列，每個子元素為「上班時間」與「下班時間」的 pair。如：`[['2018-01-01 08:00:00', '2018-01-01 18:00:00']]`
 * opts:
   * format: 時間的格式，預設為 ISO 8601。格式參考 https://momentjs.com/docs/#/parsing/string/
   * before: 隱藏工時-前。ex. '30 minutes'
   * after: 隱藏工時-後。ex. '30 minutes'

#### `let data = schedule.toString()`

將 schedule 物件轉為字串

#### `let schedule = shift.Schedule.load(data)`

從字串建立 schedule 物件。


#### `let errorsAndWarnings = shift.validate(schedule, opts)`

解析班表並且回傳班表是否違法。

* schedule: shift.schedule 建立的班表資料。
* opts:
  * transformed: 變形工時種類，如果不是變形工時就不填。可為：
    * `shift.validate.two_week`：兩週變形工時
    * `shift.validate.four_week`：四週變形工時
    * `shift.validate.eight_week`：八週變形工時
  * min_between_shift: 兩班之間最少休息時間（小時），預設為 8，根據勞基法可因為勞資協商而介於 8~11 之間。

##### 回傳值：

```
[
  {type: 'warning', msg: '警告內容'},
  {type: 'error', msg: '錯誤原因', offset: <相對於班表起始時間的位移，單位為分鐘>, time: <錯誤時間>}
]
```


#### `let causes = shift.overwork.check(schedule)`

檢查班表是否符合過勞因素，回傳符合的因素，若是沒有符合的則回傳空陣列。


#### `shift.overwork.Causes`

過勞因素：
```javascript
const Causes = {
  irregular: '不規律的工作',
  longHours: '長時間工作',
  nightShift: '夜班',
  previousDayOverwork: '前一天長時間工作',
  previousWeekOverwork: '前一週長時間工作',
  previousMonthOvertime: '前一個月加班時數 > 100',
  previousSixMonthsOvertime: '前六個月加班時數平均 > 45'
}
```

#### `shift.create(employeeCount, shifts)`

根據給定的資訊排出合法的班表。

```javascript
let schedules = create(1, [
  { from: '2018-09-08 09:00:00', to: '2018-09-08 15:00:00', required: 1 }
])
// schedule == [[['2018-09-08 09:00:00', '2018-09-08 15:00:00']]]
```

## Internal Data Structure

此套件將班表編碼成如下格式：

```
xxxxxxxxxx xxxxxxxxx .....xxxxx .....
```

* `x` 代表一分鐘的工作時間
* `.` 代表一分鐘的休息時間

於是便可用 `lexer` 驗證基本的班表正確性，可參考 `lexer.js`。

編碼中的空白會被忽略，可用 `#` 寫註解。

## License

The MIT License
