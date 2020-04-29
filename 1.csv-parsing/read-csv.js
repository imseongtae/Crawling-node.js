
const parse = require('csv-parse/lib/sync')
const fs = require('fs')

const csv = fs.readFileSync('./../csv/data.csv')

const records = parse(csv.toString('utf-8'))

// console.log(records)
records.forEach((r, i) => {
  console.log('index:',i, r)
})