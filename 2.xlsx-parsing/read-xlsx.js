
const xlsx = require('xlsx')

// readFile로 파일을 읽음
const workbook = xlsx.readFile('./../xlsx/data.xlsx')
const ws = workbook.Sheets.영화목록

// 엑셀 데이터를 javascript 객체로 바꾸는 메서드 \
const records = xlsx.utils.sheet_to_json(ws)

console.log(records)

for (const [i, r] of records.entries()) {
  console.log(i, r)
}