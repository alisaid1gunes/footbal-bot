import { Match } from "./match.entity";
import * as puppeteer from "puppeteer";
import { LastMatch } from "./last-match.entity";
import { Detail } from "./detail.entity";
import { Odd } from "./odd.entity";

export class MatchService {
  private page: any;
  public matches: Match[];
  private browser: any;
  private inEventHeaderList: any[] = [];
  constructor() {
    this.matches = [];
    this.inEventHeaderList = [];
  }

  public async getMatches(leagues: any[]) {
    const mainPage = await this.openPage(
      "https://www.flashscore.co.uk/",
      {
        waitUntil: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
      },
      true
    );
    await this.goToMenu(mainPage);
    await this.goToSettings(mainPage);
    await this.changeOddFormat(mainPage);
    await this.goToTimeZone(mainPage);
    await this.goToTimeZoneSelect(mainPage);
    await this.goToClose(mainPage);
    await this.goToScheduled(mainPage);
    await this.getMainPageMatchesDivs(mainPage);
    await this.getDetails(leagues);
    return this.matches;
  }

  public async openPage(URL: string, options: any, waitForFunction: boolean) {
    this.browser = await puppeteer.launch({
      headless: false, //if it is true browser can not display

      ignoreHTTPSErrors: true,
    });
    this.page = await this.browser.newPage();
    await this.page.goto(URL, options);
    if (waitForFunction) {
      await this.page.waitForFunction(() => document.readyState === "complete");
    }
    return this.page;
  }

  public async goToMenu(page: any) {
    await page.waitForSelector('div[class="header__button"][role="button"]');
    await page.click('div[class="header__button"][role="button"]'); //menu button click
  }

  public async goToSettings(page: any) {
    await page.waitForSelector(
      'div[class="contextMenu__row"][tabindex="0"][role="button"]'
    );
    console.log("settings");
    await page.evaluate(() => {
      const el = document.querySelector(
        'div[class="contextMenu__row"][tabindex="0"][role="button"]'
      ) as HTMLElement;
      el.click(); //settingsbutton click
    });
  }

  public async changeOddFormat(page: any) {
    console.log("odd select");
    await page.waitForSelector("input[name='oddsFormats'][type='radio']");
    console.log("input[name='oddsFormats'][type='radio']");
    await page.evaluate(() => {
      const el = document.querySelectorAll(
        "input[name='oddsFormats'][type='radio']"
      ) as NodeListOf<HTMLElement>;

      el[1].click(); //odds format click
    });
  }
  public async goToTimeZone(page: any) {
    console.log("timezone");
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
  }

  public async goToTimeZoneSelect(page: any) {
    console.log("timezone select");
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
  }

  public async goToClose(page: any) {
    console.log("close");
    await page.waitForSelector('svg[class="close modal__closeButton"]');

    const close = await page.$('svg[class="close modal__closeButton"]');
    await close?.click(); //menu close button click
  }

  public async goToScheduled(page: any) {
    console.log("scheduled");
    await page.waitForSelector(".filters__tab", {
      timeout: 5000,
    });
    console.log("filters__tab var");

    const items = await page.$$(".filters__tab, .filters__tab selected");
    console.log(items.length);
    if ((await page.$(".filters__tab, .filters__tab selected")) !== null) {
      await items[4].evaluate((el: { click: () => void }) => {
        el.click();
      }); //scheduled click
    }
  }

  public async getMainPageMatchesDivs(page: any) {
    //all home matches in page

    await page.waitForSelector(".sportName.soccer");

    const eventHeader = await page.$(".sportName.soccer");

    const divs = await eventHeader?.$$("div");
    console.log("divs.length" + divs.length);
    for (let i = 0; i < divs.length; i++) {
      const div = divs[i];

      if (div) {
        this.inEventHeaderList.push(div);
      }
    }

    // @ts-ignore
    let league = "";
    for (let i = 0; i < this.inEventHeaderList.length; i++) {
      const element = this.inEventHeaderList[i];
      const className = await element?.evaluate(
        (e: { getAttribute: (arg0: string) => any }) => e.getAttribute("class")
      );
      if (className === "event__titleBox") {
        const typeDiv = await element.$(".event__title--type");

        const type = await typeDiv?.evaluate(
          (e: { textContent: any }) => e.textContent
        );
        const leagueDiv = await element.$(".event__title--name");

        const leagueText = await leagueDiv?.evaluate(
          (e: { textContent: any }) => e.textContent
        );

        league = type + ": " + leagueText;
      }

      if (
        className ===
          "event__match event__match--scheduled event__match--twoLine" ||
        className ===
          "event__match event__match--scheduled event__match--last event__match--twoLine"
      ) {
        const time = await element.$(".event__time");
        const timeText = await time?.evaluate(
          (e: { textContent: any }) => e.textContent
        );
        const homeTeam = await element.$(".event__participant--home");
        const homeTeamText = await homeTeam?.evaluate(
          (e: { textContent: any }) => e.textContent
        );
        const awayTeam = await element.$(".event__participant--away");
        const awayTeamText = await awayTeam?.evaluate(
          (e: { textContent: any }) => e.textContent
        );
        const id = await element.evaluate(
          (e: { getAttribute: (arg0: string) => any }) => e.getAttribute("id")
        );
        const match = new Match();
        match.time = timeText;
        match.homeTeam = homeTeamText;
        match.awayTeam = awayTeamText;
        match.league = league;
        match.pageId = id;
        this.matches.push(match);
      }
    }

    return this.matches;
  }

  public async getDetails(leagues: any[]) {
    for (let i = 0; i < this.matches.length; i++) {
      const match = this.matches[i];
      if (leagues.includes(match.league) || leagues.length === 0) {
        let pageH2 = await this.browser.newPage();

        await pageH2.goto(
          "https://www.flashscore.co.uk/match/" +
            match.pageId?.substring(4) +
            "/#/h2h/overall",
          {
            waitUntil: "domcontentloaded",
          }
        );

        const lastHomeTeamMatches: LastMatch[] = [];
        const lastAwayTeamMatches: LastMatch[] = [];
        const lastH2HMatches: LastMatch[] = [];
        const detail = new Detail();
        await pageH2.waitForSelector(
          'a[class="subTabs__tab"][href="#/h2h/home"]'
        );

        await pageH2.evaluate(() => {
          const el = document.querySelector(
            'a[class="subTabs__tab"][href="#/h2h/home"]'
          ) as HTMLElement;
          el.click();
        });

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
            const dateText = await date?.evaluate(
              (e: { textContent: any }) => e.textContent
            );
            const leagueText = await league?.evaluate(
              (e: { textContent: any }) => e.textContent
            );
            const homeText = await home?.evaluate(
              (e: { textContent: any }) => e.textContent
            );
            const awayText = await away?.evaluate(
              (e: { textContent: any }) => e.textContent
            );
            const resultGoals = await result?.evaluate(
              (e: { textContent: any }) => e.textContent
            );
            const goals = resultGoals?.split("");

            if (i === 0) {
              lastHomeTeamMatches.push({
                date: dateText,
                league: leagueText,
                homeTeam: homeText,
                awayTeam: awayText,
                homeTeamGoals: goals[0],
                awayTeamGoals: goals[1],
              });
            } else if (i === 1) {
              lastH2HMatches.push({
                date: dateText,
                league: leagueText,
                homeTeam: homeText,
                awayTeam: awayText,
                homeTeamGoals: goals[0],
                awayTeamGoals: goals[1],
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
          const dateText = await date?.evaluate(
            (e: { textContent: any }) => e.textContent
          );
          const leagueText = await league?.evaluate(
            (e: { textContent: any }) => e.textContent
          );
          const homeText = await home?.evaluate(
            (e: { textContent: any }) => e.textContent
          );
          const awayText = await away?.evaluate(
            (e: { textContent: any }) => e.textContent
          );
          const resultGoals = await result?.evaluate(
            (e: { textContent: any }) => e.textContent
          );
          const goals = resultGoals?.split("");
          lastAwayTeamMatches.push({
            date: dateText,
            league: leagueText,
            homeTeam: homeText,
            awayTeam: awayText,
            homeTeamGoals: goals[0],
            awayTeamGoals: goals[1],
          });
        }

        await pageH2.waitForSelector(
          'a[class="tabs__tab"][href="#/odds-comparison"]'
        );

        await pageH2.evaluate(() => {
          const el = document.querySelector(
            'a[class="tabs__tab"][href="#/odds-comparison"]'
          ) as HTMLElement;
          el.click();
        });
        //href="#/odds-comparison/over-under"

        await pageH2.waitForSelector(
          'a[class="tabs__tab"][href="#/odds-comparison/over-under"]'
        );

        await pageH2.evaluate(() => {
          const el = document.querySelector(
            'a[class="tabs__tab"][href="#/odds-comparison/over-under"]'
          ) as HTMLElement;
          el.click();
        });
        const tableRow = await pageH2.$$(".ui-table__row");
        const rowEl = tableRow[0];

        const total = await rowEl.$(".oddsCell__noOddsCell");
        const totalText = await total?.evaluate(
          (e: { textContent: any }) => e.textContent
        );
        const odds = await rowEl.$$(".oddsCell__odd");
        const overText = await odds[0].evaluate(
          (e: { textContent: any }) => e.textContent
        );

        const underText = await odds[1].evaluate(
          (e: { textContent: any }) => e.textContent
        );
        const odd = new Odd();
        odd.total = totalText;
        odd.over = overText;
        odd.under = underText;
        detail.homeTeamLastMatches = lastHomeTeamMatches;
        detail.awayTeamLastMatches = lastAwayTeamMatches;
        detail.h2hLastMatches = lastH2HMatches;
        detail.odd = odd;
        match.detail = detail;
      }
    }
  }
}
