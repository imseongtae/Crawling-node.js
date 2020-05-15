const review = require('./review-module');

const crawler = async (browser, page) => {
	//data Arr
	let data = [];
	// console.log(page);
	// console.log(typeof page);
	try {
		await page.waitFor(2000);
		await page.waitForSelector('#cateTab_040');
		await page.click('#cateTab_040');
		await page.waitFor(2000);
		await page.evaluate(() => {
			Array.from(
				document.querySelectorAll('#ticketplaycategory_result > div span'),
			)
				.find(v => v.textContent === '클래식/무용')
				.click();
		});

		await page.waitFor(2000);
		data = await getData(browser, page, data);

		return Promise.resolve(data);
		// console.log(data);
		// console.log(data.length);
	} catch (error) {
		console.error(error);
	}
};

// pagination container의 pagination을 페이징하는 함수
const paging = async (page, pageNumber) => {
	try {
		if (page) {
			console.log(pageNumber);
			await page.waitFor(2000);
			// await page.click(`#ticketplayend_page > a:nth-child(${pageNumber + 2})`);
			await page.evaluate(pageNumber => {
				if (pageNumber == 1 || pageNumber % 10 !== 1) {
					Array.from(document.querySelectorAll('#ticketplayend_page > a'))
						.find(a => a.textContent == pageNumber)
						.click();
				} else {
					document.querySelector('a.Next_On').click();
				}
			}, pageNumber);
		}
	} catch (error) {
		console.log(error);
	}
};

// 페이징하기 위한 인덱스 반환
const countTotalPerformanceAndTotalIteration = async page => {
	const countTotalPerformance = await page.evaluate(() => {
		const count = document
			.querySelector('#play_countend')
			.textContent.replace(/[^0-9]/g, '');
		return parseInt(count, 10);
	});
	console.log(
		'countTotalPerformanceAndTotalIteration: ',
		countTotalPerformance,
		Math.ceil(countTotalPerformance / 5),
	);
	return Math.ceil(countTotalPerformance / 5);
};
// URL: string
const crawlPerformanceURL = async page => {
	try {
		return await page.evaluate(() => {
			// return url
			return Array.from(
				document.querySelectorAll('#playend_list dt > h4 > a'),
			).map(v => v.href);
		});
	} catch (error) {
		console.log(error);
	}
};

const getData = async (browser, page, data) => {
	// browser 객체를 아예 저 안으로 전달해버리자
	// const crawlPage = await browser.newPage();

	// const countIteration = await countTotalPerformanceAndTotalIteration(page);
	const countIteration = 1;
	let results = []; // 여기 대신 받아온 배열
	for (let i = 1; i <= countIteration; i++) {
		await paging(page, i);
		await page.waitFor(1000);
		// results = results.concat(await crawlPerformanceInformation(page));
		let url = await crawlPerformanceURL(page);
		// 각 공연 항목에 대한 URL을 줘야 함
		for (let j = 0; j < 5; j++) {
			console.log('for문을 도는 인덱스의 값: ', j, url[j]);
			let reviews = await review(browser, url[j]);
			results = results.concat(reviews); // review 정보를 계속 저장
		}
	}
	// 배열 정리
	data = data.concat(results); // data.push를 하므로 주석
	return Promise.resolve(data);
};

module.exports = crawler;
