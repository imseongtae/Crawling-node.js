const puppeteer = require('puppeteer');

const host =
	'http://ticket.interpark.com/Ticket/Goods/GoodsInfo.asp?GoodsCode=19010154';
const userAgent =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.0 Safari/537.36';
const width = 1080;
const height = 900;
const options = {
	headless: false,
	slowMo: true,
	args: [
		`--window-size=${width},${height}`,
		'--no-sandbox',
		'--disable-setuid-sandbox',
	],
};
const iframePagename = 'ifrGoodsReview'; // iframe의 이름

const crawler = async () => {
	const browser = await puppeteer.launch(options);
	const page = await browser.newPage();
	await page.setViewport({
		width: 1080,
		height: 900,
	});
	await page.setUserAgent(userAgent);

	//data Arr
	let data = [];
	try {
		await page.goto(await generateURL(), {
			waitUntil: 'networkidle0',
		});
		await page.click('#spReviewCnt');
		await page.waitFor(2000);

		data = await getData(page, data);
		console.log(data);
		console.log(data.length);
	} catch (error) {
		console.log(error);
	}

	await page.close();
	await browser.close();
};

crawler();

// iframe 안의 pagination 개수를 세는 함수
const countPagination = async iframe => {
	let pageCount = 0;
	try {
		pageCount = await iframe.evaluate(() => {
			const pageContainer = document.querySelectorAll('.pageing_num > a')
				.length;
			return pageContainer;
		});
		return Promise.resolve(pageCount);
	} catch (error) {
		console.log(error);
	}
};

// iframe 안의 pagination 페이징 함수
const paging = async (iframe, pageCount) => {
	try {
		if (iframe) {
			console.log(pageCount);
			await iframe.waitFor(2000);
			await iframe.click(`.pageing_num>a:nth-child(${pageCount})`);
		}
	} catch (error) {
		console.log(error);
	}
};

const getData = async (page, data) => {
	// 아이프레임 들어가서 리뷰가 몇 페이지가 있는지 카운트..!
	const iframe = page.frames().find(frame => frame.name() === iframePagename);

	const countPage = await countPagination(iframe);
	console.log(countPage);

	let results = [];
	for (let i = 1; i <= countPage; i++) {
		await paging(iframe, i);
		await page.waitFor(2000);

		// 아이프레임 들어가서 데이터 크롤링하는 코드
		if (iframe) {
			const crawlPage = await iframe.evaluate(() => {
				let reviews = [];
				const reviewEls = document.querySelectorAll('.TxtWrap');
				if (reviewEls.length) {
					reviewEls.forEach(v => {
						let subject = v.querySelector('.subject');
						let textarea = v.querySelector('.textarea');

						if (subject && textarea) {
							reviews.push({
								subject: subject && subject.textContent,
								textarea: textarea && textarea.textContent,
							});
						}
					});
				}
				return reviews;
			});
			// console.log(results);
			results = results.concat(crawlPage);
		}
	}

	data = data.concat(results);
	return Promise.resolve(data);
};

const generateURL = async () => {
	const url = host;
	console.log(url);
	return url;
};
