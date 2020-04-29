const xlsx = require('xlsx')
const axios = require('axios')
const cheerio = require('cheerio')
const add_to_sheet = require('./api/add_to_sheet')

const workbook = xlsx.readFile('./../xlsx/data.xlsx')
const ws = workbook.Sheets.영화목록 // 특정 시트를 읽어서 

// 자바스크립트 객체로 변환
const records = xlsx.utils.sheet_to_json(ws)

// 평점 크롤러
const crawler = async () => {
  add_to_sheet(ws, 'C', 's', '평점')
  for (const [i, r] of records.entries()) {
    const response = await axios.get(r.링크)
    if (response.status === 200) {
      const html = response.data;

      const $ = cheerio.load(html)
      const text = $('.score_left .star_score').text()
      console.log(r.제목, '평점', text.trim())

      const newCell = `C${i + 2}`
      add_to_sheet(ws, newCell, 'n', text.trim())
    }
  }
  xlsx.writeFile(workbook, './result/xlsx-result.xlsx')
}

const actorCrawler = async () => {
  // 컬럼 분류
  add_to_sheet(ws, 'C1', 's', '평점')
  add_to_sheet(ws, 'D1', 's', '감독')
  add_to_sheet(ws, 'E1', 's', '출연')


  for (const [i, r] of records.entries()) {
    const response = await axios.get(r.링크)
    if (response.status === 200) {
      const html = response.data;

      const $ = cheerio.load(html)
      const text = $('.score_left .star_score').text()
      const newCell = `C${i + 2}`
      add_to_sheet(ws, newCell, 'n', text.trim())
    }
  }


  for (const [i, r] of records.entries()) {
    const response = await axios.get(r.링크)
    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html)

      // 감독 추가
      const text = $('.info_spec dt.step2').next().text()
      // console.log(r.제목, '감독', text.trim())
      const newCell = `D${i + 2}`
      add_to_sheet(ws, newCell, 's', text.trim())
    }
  }

  // 배우 추가
  for (const [i, r] of records.entries()) {
    const response = await axios.get(r.링크)
    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html)

      // 배우 추가
      const text = $('.info_spec dt.step3').next().text()
      console.log(r.제목, '출연', text.trim().slice(0, text.trim().length - 3))
      const newCell = `E${i + 2}`
      add_to_sheet(ws, newCell, 's', text.trim().slice(0, text.trim().length - 4))
    }
  }
  
  // 엑셀에 쓰기
  xlsx.writeFile(workbook, './result/xlsx-result.xlsx')
}



// crawler();
actorCrawler();

