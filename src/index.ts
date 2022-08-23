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
    timeout: 3000,
  });

  const items = await page.$$(".filters__tab");

  await items[4].click(); // item 4 click. item 4 is scheduled matches tab

  await page.waitForSelector(".event__participant--home", {
    timeout: 3000,
  });

  const matchesHome = await page.$$(".event__participant--home ");
  const matchesAway = await page.$$(".event__participant--away ");
  const mathesTime = await page.$$(".event__time ");
  for (let i = 0; i < matchesHome.length; i++) {
    const homeElement = matchesHome[i];
    const textHome = await homeElement.evaluate((e) => e.textContent);
    const textHomeArray = textHome?.split("\n");

    const awayElement = matchesAway[i];
    const textAway = await awayElement.evaluate((e) => e.textContent);
    const textAwayArray = textAway?.split("\n");

    const timeElement = mathesTime[i];
    const textTime = await timeElement.evaluate((e) => e.textContent);
    const textTimeArray = textTime?.split("\n");

    for (let j = 0; j < textHomeArray!.length; j++) {
      console.log({
        home: textHomeArray![j],
        away: textAwayArray![j],
        time: textTimeArray![j],
      });
    }
  }
}
run();
