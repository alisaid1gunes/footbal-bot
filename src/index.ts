import * as puppeteer from "puppeteer";

async function run() {
  const browser = await puppeteer.launch({
    headless: false, //if it is true browser can not display

    ignoreHTTPSErrors: true,
  });

  let page = await browser.newPage();

  await page.goto("https://www.flashscore.com/", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector('div[class="header__button"][role="button"]');
  await page.click('div[class="header__button"][role="button"]');

  await page.waitForSelector(
    'div[class="contextMenu__row"][tabindex="0"][role="button"]'
  );

  await page.evaluate(() => {
    const el = document.querySelector(
      'div[class="contextMenu__row"][tabindex="0"][role="button"]'
    ) as HTMLElement;
    el.click();
  });

  await page.waitForSelector(
    'div[class="timeZone__button"][tabindex="0"][role="button"]'
  );

  await page.evaluate(() => {
    const el = document.querySelector(
      'div[class="timeZone__button"][tabindex="0"][role="button"]'
    ) as HTMLElement;
    if (el) {
      el.click();
    }
  });

  await page.waitForSelector(".timeZone__link");

  await page.evaluate(() => {
    const el = document.querySelectorAll(
      ".timeZone__link"
    ) as NodeListOf<HTMLElement>;

    for (let i = 0; i < el.length; i++) {
      const element = el[i];
      if (element.innerText.includes("GMT+0")) {
        console.log(element.innerText);
        element.click();
      }
    }
  });

  await page.waitForSelector('svg[class="close modal__closeButton"]');

  const close = await page.$('svg[class="close modal__closeButton"]');
  await close?.click();

  await page.waitForSelector(".filters__tab", {
    timeout: 1000,
  });

  const items = await page.$$(".filters__tab");

  console.log(
    await items[0].evaluate((node) => {
      node.innerHTML; // 0.item innerhtml
    })
  );

  await items[4].click(); // item 4 click. item 4 is scheduled matches tab

  await page.waitForSelector(
    ".event__match event__match--scheduled event__match--last event__match--twoLine"
  );

  const matches = await page.$$(".event__match event__match--twoLine");

  console.log(matches.length);
}

run();
