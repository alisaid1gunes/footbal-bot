import * as puppeteer from "puppeteer";

async function run() {
  const browser = await puppeteer.launch({
    headless: false, //if it is true browser can not display

    ignoreHTTPSErrors: true,
  });

  let page = await browser.newPage();

  await page.goto("https://www.flashscore.com/", {
    waitUntil: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
  });
  await page.waitForFunction(() => document.readyState === "complete");

  await page.waitForSelector('div[class="header__button"][role="button"]');
  await page.click('div[class="header__button"][role="button"]'); //menu button click

  await page.waitForSelector(
    'div[class="contextMenu__row"][tabindex="0"][role="button"]'
  );

  await page.evaluate(() => {
    const el = document.querySelector(
      'div[class="contextMenu__row"][tabindex="0"][role="button"]'
    ) as HTMLElement;
    el.click(); //settingsbutton click
  });

  await page.waitForSelector(
    'div[class="timeZone__button"][tabindex="0"][role="button"]'
  );

  await page.evaluate(() => {
    const el = document.querySelector(
      'div[class="timeZone__button"][tabindex="0"][role="button"]'
    ) as HTMLElement;
    if (el) {
      el.click(); //timezone button click
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
        element.click(); ///timzone click
      }
    }
  });

  await page.waitForSelector('svg[class="close modal__closeButton"]');

  const close = await page.$('svg[class="close modal__closeButton"]');
  await close?.click(); //menu close button click

  await page.waitForSelector(".filters__tab", {
    timeout: 5000,
  });

  const items = await page.$$(".filters__tab, .filters__tab selected");

  if ((await page.$(".filters__tab, .filters__tab selected")) !== null) {
    await items[4].click(); //scheduled click
  }

  await page.waitForSelector(".event__participant--home", {
    timeout: 10000,
  });

  const matchesHome = await page.$$(".event__participant--home"); //all home matches in page

  await page.waitForSelector(".event__participant--away", {
    timeout: 3000,
  });
  const matchesAway = await page.$$(".event__participant--away"); //all away matches in page

  await page.waitForSelector(".event__time");
  const matchesTime = await page.$$(".event__time"); ////all matches time in page

  for (let i = 0; i < matchesHome.length; i++) {
    const homeElement = matchesHome[i]; //home match element
    const textHome = await homeElement.evaluate((e) => e.textContent); //home match text
    const textHomeArray = textHome?.split("\n"); //home match text array

    const awayElement = matchesAway[i]; //away match element
    const textAway = await awayElement.evaluate((e) => e.textContent); //away match text
    const textAwayArray = textAway?.split("\n"); //away match text array

    const timeElement = matchesTime[i]; //time match element
    const textTime = await timeElement?.evaluate((e) => e.textContent); //time match text
    const textTimeArray = textTime?.split("\n"); //time match text array

    for (let j = 0; j < textHomeArray!.length; j++) {
      console.log({
        home: textHomeArray![j], //home match text
        away: textAwayArray![j], //away match text
        time: textTimeArray![j], //time match text
      });
    }
  }

  await page.waitForSelector(".event__match--twoLine");
  const twoLine = await page.$$(".event__match--twoLine");

  //for (let i = 0; i < twoLine.length; i++)

  for (let i = 0; i < twoLine.length; i++) {
    console.log("----------------------------------------------------");
    const element = twoLine[i];
    const id = await element.evaluate((e) => e.getAttribute("id"));

    let pageH2 = await browser.newPage();

    await pageH2.goto(
      "https://www.flashscore.com/match/" + id?.substring(4) + "/#/h2h/overall",
      {
        waitUntil: "domcontentloaded",
      }
    );
    let oddsValueInners = null;

    await pageH2
      .waitForSelector(".oddsValueInner", {
        timeout: 3000,
      })
      .catch((e) => {
        console.log(e);
      });

    if (await pageH2.$(".oddsValueInner")) {
      oddsValueInners = await pageH2?.$$(".oddsValueInner");
    }

    await pageH2.waitForSelector('a[class="subTabs__tab"][href="#/h2h/home"]');

    await pageH2.evaluate(() => {
      const el = document.querySelector(
        'a[class="subTabs__tab"][href="#/h2h/home"]'
      ) as HTMLElement;
      el.click();
    });
    const details = {
      latestHomeMatches: [] as any[],
      latestAwayMatches: [] as any[],
      h2hMatches: [] as any[],
      odds: {
        one: {} as any,
        x: {} as any,
        two: {} as any,
      },
    };
    await pageH2.waitForSelector(".rows");

    const rows = await pageH2.$$(".rows");

    for (let i = 0; i < rows.length; i++) {
      const element = rows[i];
      const h2h_row = await element.$$(".h2h__row");
      for (let j = 0; j < h2h_row.length; j++) {
        const date = await h2h_row[j].$(".h2h__date");
        const league = await h2h_row[j].$(".h2h__event");
        const home = await h2h_row[j].$(".h2h__participantInner");
        const away = await h2h_row[j].$(".h2h__awayParticipant");
        const result = await h2h_row[j].$(".h2h__result");
        const dateText = await date?.evaluate((e) => e.textContent);
        const leagueText = await league?.evaluate((e) => e.textContent);
        const homeText = await home?.evaluate((e) => e.textContent);
        const awayText = await away?.evaluate((e) => e.textContent);
        const resultGoals = await result?.evaluate((e) => e.textContent);
        const goals = resultGoals?.split("");
        if (i === 0) {
          details.latestHomeMatches.push({
            date: dateText,
            league: leagueText,
            home: homeText,
            away: awayText,
            goals: goals,
          });
        } else if (i === 1) {
          details.h2hMatches.push({
            date: dateText,
            league: leagueText,
            home: homeText,
            away: awayText,
            goals: goals,
          });
        }
      }
    }

    await pageH2.evaluate(() => {
      const el = document.querySelector(
        'a[class="subTabs__tab"][href="#/h2h/away"]'
      ) as HTMLElement;
      el.click();
    });
    await pageH2.waitForSelector(".rows");

    const rowsAway = await pageH2.$$(".rows");

    const awayElement = rowsAway[0];
    const away_row = await awayElement.$$(".h2h__row");
    for (let j = 0; j < away_row.length; j++) {
      const date = await away_row[j].$(".h2h__date");
      const league = await away_row[j].$(".h2h__event");
      const home = await away_row[j].$(".h2h__participantInner");
      const away = await away_row[j].$(".h2h__awayParticipant");
      const result = await away_row[j].$(".h2h__result");
      const dateText = await date?.evaluate((e) => e.textContent);
      const leagueText = await league?.evaluate((e) => e.textContent);
      const homeText = await home?.evaluate((e) => e.textContent);
      const awayText = await away?.evaluate((e) => e.textContent);
      const resultGoals = await result?.evaluate((e) => e.textContent);
      const goals = resultGoals?.split("");
      details.latestAwayMatches.push({
        date: dateText,
        league: leagueText,
        home: homeText,
        away: awayText,
        goals: goals,
      });
    }

    for (let i = 0; i < 3; i++) {
      if (oddsValueInners) {
        const odd = await oddsValueInners[i]?.evaluate((e) => e?.textContent);
        if (i === 0 && odd) {
          details.odds.one = odd;
        } else if (i === 1 && odd) {
          details.odds.x = odd;
        } else if (i === 2 && odd) {
          details.odds.two = odd;
        }
      }
    }
    await pageH2.close();
    console.log(details);
    console.log("----------------------------------------------------");
  }
}
run();
