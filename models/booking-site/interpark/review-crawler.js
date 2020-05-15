const puppeteer = require('puppeteer');
// const db = require('./models');

const host =
	// 'http://ticket.interpark.com/Ticket/Goods/GoodsInfo.asp?GoodsCode=19010154';
	// 'http://ticket.interpark.com/Ticket/Goods/GoodsInfo.asp?GoodsCode=19009379';
	'http://ticket.interpark.com/Ticket/Goods/GoodsInfo.asp?GoodsCode=08007458#TabTop';
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
	// await db.sequelize.sync();
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
		// await page.goto(await generateURL(), {
		// 	waitUntil: 'networkidle0',
		// });
		// await page.click('#spReviewCnt');
		await page.goto(await generateURL());
		await page.waitFor(1500);
		await page.evaluate(() => {
			Array.from(document.querySelectorAll('#ctrlTab > a'))
				.find(v => v.textContent.replace(/[^관람후기]/g, ''))
				.click();
		});
		data = await getData(page, data);
		console.log(data);
		console.log(data.length);
	} catch (error) {
		console.log(error);
	} finally {
		await page.close();
		await browser.close();
	}
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

// 공연 후기가 0개라면 분기처리를 통해 데이터 크롤링을 하지 않고, page객체 close
const countTotalReviews = async iframe => {
	await iframe.waitFor(3000);

	try {
		const count = await iframe.evaluate(() => {
			const countReviews = document
				.querySelector('body > div > div > div.Rv_Title_Wrap > div.Title > h3')
				.textContent.replace(/[^0-9]/g, '');
			return parseInt(countReviews, 10);
		});
		return Promise.resolve(count);
	} catch (error) {
		console.log(error);
	}
};

const getData = async (page, data) => {
	await page.waitFor(3000);
	const performanceName = await page.evaluate(() => {
		return document.querySelector('#IDGoodsName').textContent;
	});
	// console.log(performanceName);
	// const perform = performanceName;
	const iframe = page.frames().find(frame => frame.name() === iframePagename);

	// 공연 후기가 0개라면 분기처리를 통해 page객체 close
	try {
		const countReviews = await countTotalReviews(iframe);
		console.log('공연후기 개수: ----------', countReviews, '------');
		if (countReviews == 0) {
			await page.waitFor(3000);
			console.log('공연 후기가 0개임 ㅠㅠㅠㅠㅠ 그래서 어캐됨?');
			await page.close();
		}
	} catch (error) {
		console.log(new Error(error));
	}

	// 아이프레임 리뷰가 페이지 카운트..!
	const countPage = await countPagination(iframe);
	console.log(countPage);

	let results = [];
	for (let i = 1; i <= countPage; i++) {
		await paging(iframe, i);
		await page.waitFor(2000);

		// 아이프레임 들어가서 데이터 크롤링하는 코드
		if (iframe) {
			const crawlPage = await iframe.evaluate(x => {
				let reviews = [];
				const reviewEls = document.querySelectorAll('.TxtWrap');
				if (reviewEls.length) {
					reviewEls.forEach(v => {
						let subject = v.querySelector('.subject');
						let textarea = v.querySelector('.textarea');
						let createdAt = v.querySelector('.date');
						let userId = v.querySelector('.id');

						if (subject && textarea) {
							reviews.push({
								performanceName: x,
								subject: subject && subject.textContent,
								textarea: textarea && textarea.textContent,
								createdAt: createdAt && createdAt.textContent,
								userId: userId && userId.textContent.replace(/예매자/, ''),
							});
						}
					});
				}
				return reviews;
			}, performanceName);
			// console.log(results);
			results = results.concat(crawlPage);
		}
	}
	// results에서 db에 넣는 작업이 필요할 듯
	// await Promise.all(
	// 	results.map(async v => {
	// 		return db.Review.upsert({
	// 			performance_name: v.performanceName,
	// 			subject: v.subject,
	// 			textarea: v.textarea,
	// 			created_at: v.createdAt,
	// 			user_id: v.userId,
	// 		});
	// 	}),
	// );
	// await db.sequelize.close();
	// 배열 정리
	data = data.concat(results);
	return Promise.resolve(data);
};

const generateURL = async () => {
	const url = host;
	console.log(url);
	return url;
};
