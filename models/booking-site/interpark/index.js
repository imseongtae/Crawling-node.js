const fs = require('fs');
const puppeteer = require('puppeteer');
// const db = require('./models');
const db = require('./../models');

const crawlPerformanceReview = require('./performance-review');

const artist = '조성진';
const url = 'http://ticket.interpark.com/';
const options = {
	userAgent:
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.0 Safari/537.36',
	width: 1080,
	height: 900,
	viewportWidth: 1080,
	viewportHeight: 900,
	launchOpt: {
		headless: true,
		// slowMo: true,
		// args: [
		// 	`--window-size=${this.width},${this.height}`,
		// 	'--no-sandbox',
		// 	'--disable-setuid-sandbox',
		// ],
	},
};

async function crawlTest() {
	// await connectDatabase();
	const { browser, page } = await startBrowser();
	// page = await generateURLAndSearchArtist(page);
	let data = [];
	try {
		// 이동된 url에서 돌아다니면서 정보를 가져옴
		// data = await crawlPerformanceInformation(
		// 	await generateURLAndSearchArtist(page),
		// );
		// -----이 위까지는 정상적인 코드였음

		// ---- 아래부터는 수정하는 코드 ---------
		// data = await crawlPerformanceReview(await generateURLAndSearchArtist(page));
		data = await crawlPerformanceReview(
			browser,
			await generateURLAndSearchArtist(page),
		);

		// const jsonData = JSON.stringify(data);
		// fs.writeFileSync('reviews.json', jsonData);

		// await storePerformanceInformation(data); // 데이터 DB에 저장
		// await storeAudienceReviews(data);
	} catch (error) {
		console.log(error);
	} finally {
		console.log('data의 타입: ', typeof data);
		console.log(data);
		console.log('data.length: ', data.length);
		await page.waitFor(4000);
		await closeBrowser(browser);
		await closeDatabase();
	} // finally
}

(async () => {
	await crawlTest();
	process.exit(1);
})();

async function connectDatabase() {
	await db.sequelize.sync();
}

// 관람객 공연 후기를 저장
const storeAudienceReviews = async data => {
	try {
		await Promise.all(
			data.map(async v => {
				return db.Review.upsert({
					performance_name: v.performanceName,
					subject: v.subject,
					textarea: v.textarea,
					created_at: v.createdAt,
					user_id: v.userId,
				});
			}),
		);
	} catch (error) {
		console.log(error);
	}
};

// 공연 정보를 저장
const storePerformanceInformation = async data => {
	try {
		await Promise.all(
			data.map(async v => {
				return db.Performance.upsert({
					performance_name: v.performanceName,
					info_date: v.infoDate,
					info_place: v.infoPlace,
					category: v.category,
					appearance: v.appearance,
					url: v.url,
				});
			}),
		);
	} catch (error) {
		console.log(error);
	}
};

async function closeDatabase() {
	await db.sequelize.close();
}

const generateURLAndSearchArtist = async page => {
	await page.goto(url, {
		waitUntil: 'networkidle0',
	});
	await page.type('#Nav_SearchWord', artist);
	await page.waitFor(1000);
	await page.keyboard.press('Enter');
	await page.waitFor(1000);
	return page;
};

// Boilerplate stuff
async function startBrowser() {
	const browser = await puppeteer.launch(options.launchOpt);
	const page = await browser.newPage();
	await page.setViewport({
		width: options.viewportWidth,
		height: options.viewportHeight,
	});
	await page.setUserAgent(options.userAgent);
	return { browser, page };
}

async function closeBrowser(browser) {
	return browser.close();
}

// Normalizing the text
// function getText(linkText) {
// 	linkText = linkText.replace(/\r\n|\r/g, '\n');
// 	linkText = linkText.replace(/\ +/g, ' ');

// 	// Replace &nbsp; with a space
// 	var nbspPattern = new RegExp(String.fromCharCode(160), 'g');
// 	return linkText.replace(nbspPattern, ' ');
// }
