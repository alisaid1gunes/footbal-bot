import * as puppeteer from 'puppeteer';

async function run(){

    const browser = await puppeteer.launch({

        headless: false,

        ignoreHTTPSErrors: true,
    })

    let page = await browser.newPage();

    await page.goto('https://www.flashscore.com/', {
        waitUntil: 'domcontentloaded',
    });

    await page.waitForSelector('.event__time')


    console.log(await(await page.$('.event__time'))?.evaluate(node => node.textContent));

    await page.close();
    await browser.close();
}

run();