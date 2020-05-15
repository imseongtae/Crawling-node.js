const iframePagename = 'ifrGoodsReview'; // iframe의 이름

const crawler = async (browser, url) => {
	const page = await browser.newPage();

	//data Arr
	let data = [];
	try {
		await page.goto(url);

		// await page.waitForSelector('#spReviewCnt'); // 선택자 기다리는 걸로 안 됨
		await page.waitFor(1500);
		await page.evaluate(() => {
			Array.from(document.querySelectorAll('#ctrlTab > a'))
				.find(v => v.textContent.replace(/[^관람후기]/g, ''))
				.click();
		});

		await page.waitFor(1500);
		data = await getData(page, data);

		// await page.close();
		return Promise.resolve(data);
	} catch (error) {
		console.log(error);
	} finally {
		await page.close();
	}
};

// crawler();

// 공연 후기가 0개라면 분기처리를 통해 데이터 크롤링을 하지 않고, page객체 close
const countTotalReviews = async iframe => {
	try {
		await iframe.waitForSelector('body > div > div > div > div > h3');
		const count = await iframe.evaluate(() => {
			const number = document
				.querySelector('body > div > div > div > div > h3')
				.textContent.replace(/[^0-9]/g, '');
			return parseInt(number, 10);
		});
		return Promise.resolve(count);
	} catch (error) {
		console.log(error);
	}
};

// iframe 안의 pagination 개수를 세는 함수
const countPagination = async iframe => {
	let pageCount = 0;
	try {
		pageCount = await iframe.evaluate(() => {
			const pageContainer = document.querySelectorAll('.pageing_num > a')
				.length;
			return parseInt(pageContainer, 10);
		});
		return Promise.resolve(pageCount);
	} catch (error) {
		console.log(error);
	}
};

const getData = async (page, data) => {
	// 공연 이름
	const performanceName = await page.evaluate(() => {
		return document.querySelector('#IDGoodsName').textContent;
	});
	const iframe = page.frames().find(frame => frame.name() === iframePagename);
	await iframe.waitForSelector('body > div');

	const countReviews = await countTotalReviews(iframe);
	// 공연 후기가 0개라면 분기처리를 통해 page객체 close
	if (countReviews === 0) {
		await page.close();
	}

	// 아이프레임 내부 리뷰페이지네이션 개수 카운트..!
	const countPage = await countPagination(iframe);
	// console.log(countPage);

	// let reviews = []; // data가 대신 역할을 하도록 시도
	if (countPage == 0) {
		data = data.concat(await crawlReview(iframe, performanceName));
	} else {
		for (let i = 1; i <= countPage; i++) {
			await paging(iframe, i);
			await page.waitFor(2000);
			data = data.concat(await crawlReview(iframe, performanceName));
		}
	}

	// 배열 정리
	// data = data.concat(reviews);
	return Promise.resolve(data);
};

// Audience Review Crawling in iframe
const crawlReview = async (iframe, performanceName) => {
	try {
		return await iframe.evaluate(performanceName => {
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
							performanceName: performanceName,
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
		// results = results.concat(crawlPage);
	} catch (error) {
		console.log(error);
	}
};

// iframe 안의 pagination을 페이징하는 함수
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

module.exports = crawler;
