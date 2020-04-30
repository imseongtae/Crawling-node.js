const puppeteer = require('puppeteer')
const axios = require('axios')
const fs = require('fs')

// Create folder Snippet
fs.readdir('imgs', (err) => {
	if (err) {
		console.error('imgs 폴더가 없어 imgs 폴더를 생성합니다.')
		fs.mkdirSync('imgs')
	}
})

const crawler = async () => {
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage();
    await page.goto('https://unsplash.com/');
    
    try {
      let data = [];
      while(data.length <= 30) {
        data = await getImage(page, data)      
      }
      console.log(data)
      
      // Image Snippet
      data.forEach(async (src) => {
        const imgResult = await axios.get(src.replace(/\?.*$/, ''), {
          responseType: 'arraybuffer',
        })
        fs.writeFileSync(`imgs/${new Date().valueOf()}.jpeg`, imgResult.data)
      })
      
      await page.close();
      await browser.close();
    } catch (error) {
      console.log(error)
    }
}

async function getImage(page, data) {
  
  const results = await page.evaluate(() => {
    window.scrollTo(0, 0);
    let imgs = [];
    const imgEls = document.querySelectorAll('.nDTlD');
    if (imgEls.length) {
      imgEls.forEach((v) => {
        let img = v.querySelector('img._2zEKz');
        if (img && img.src) {
          imgs.push(img.src)
        }
        v.parentElement.removeChild(v)
      })      
    }
    window.scrollBy(0, 100) // 비동기 안에서는 쓰면 안됨
    setTimeout(() => {
      window.scrollBy(0, 200)
    }, 600);
    return imgs;
  })
  
  // results = results.concat
  data = data.concat(results)
  await page.waitForSelector('.nDTlD')
  
  console.log('data.length:', data.length)
  console.log('새 이미지 태그 로딩 완료!')
  return Promise.resolve(data)
}

crawler();