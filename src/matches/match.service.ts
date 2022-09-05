import { Match } from "./match.entity";
import * as puppeteer from "puppeteer";
import { SettingsHandler } from "./settings.handler";
import { DetailsHandler } from "./details.handler";
import { CalculatorHandler } from "./calculator.handler";

export class MatchService {
  private page: any;
  public matches: Match[];
  private browser: any;
  private inEventHeaderList: any[] = [];
  private settingsHandler: SettingsHandler;
  private detailsHandler: DetailsHandler;
  private calculatorHandler: CalculatorHandler;

  constructor() {
    this.matches = [];
    this.inEventHeaderList = [];
    this.settingsHandler = new SettingsHandler();
    this.detailsHandler = new DetailsHandler();
    this.calculatorHandler = new CalculatorHandler(this.matches);
  }

  public async getMatches(leagues: any[]) {
    const mainPage = await this.openPage(
      "https://www.flashscore.co.uk/",
      {
        waitUntil: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
      },
      true
    );
    await this.settingsHandler.handle(mainPage);
    await this.goToScheduled(mainPage);
    await this.getMainPageMatchesDivs(mainPage);
    await this.detailsHandler.getDetails(leagues, this.matches, this.browser);
    await this.browser.close();
    return await this.calculatorHandler.calculate();
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

  public async goToScheduled(page: any) {
    await page.waitForSelector(".filters__tab", {
      timeout: 5000,
    });

    const items = await page.$$(".filters__tab, .filters__tab selected");
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
}
