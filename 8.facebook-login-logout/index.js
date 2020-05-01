const puppeteer = require("puppeteer");
// const axios = require("axios");
// const fs = require("fs");
// Postman으로 먼저 확인

const crawler = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setUserAgent(); // Set UserAgent
  await page.goto(); // 링크

  try {
    let data = [];
    // data = await getData(page, data);

    console.log(data);
  } catch (error) {
    console.log("첫 번째 지점에서 error가 발생:", error);
  }

  await page.close();
  await browser.close();
};

// async function getData(page, data) {
// const results = await page.evaluate(() => {
//   // Javascript Selector
// });
// Data 반환
// return Promise.resolve(data);
// }

crawler();
