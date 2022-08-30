import { LastMatch } from "./last-match.entity";
import { Detail } from "./detail.entity";
import { Odd } from "./odd.entity";
import { Match } from "./match.entity";

export class DetailsHandler {
  public async detailHandler(j: number, h2h_row: any) {
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

    return {
      dateText,
      leagueText,
      homeText,
      awayText,
      goals,
    };
  }

  public async getDetails(leagues: any[], matches: Match[], browser: any) {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      if (leagues.includes(match.league) || leagues.length === 0) {
        let pageH2 = await browser.newPage();

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
            const { dateText, leagueText, homeText, awayText, goals } =
              await this.detailHandler(j, h2h_row);

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
          const { dateText, leagueText, homeText, awayText, goals } =
            await this.detailHandler(j, away_row);
          lastAwayTeamMatches.push({
            date: dateText,
            league: leagueText,
            homeTeam: homeText,
            awayTeam: awayText,
            homeTeamGoals: goals[0],
            awayTeamGoals: goals[1],
          });
        }
        const odd = new Odd();
        try {
          await pageH2.waitForSelector(
            'a[class="tabs__tab"][href="#/odds-comparison"]',
            { timeout: 500 }
          );

          await pageH2.evaluate(() => {
            const el = document.querySelector(
              'a[class="tabs__tab"][href="#/odds-comparison"]'
            ) as HTMLElement;
            el.click();
          });
          //href="#/odds-comparison/over-under"

          await pageH2.waitForSelector(
            'a[class="tabs__tab"][href="#/odds-comparison/over-under"]',
            { timeout: 500 }
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
          const overText = await odds[0]?.evaluate(
            (e: { textContent: any }) => e.textContent
          );

          const underText = await odds[1]?.evaluate(
            (e: { textContent: any }) => e.textContent
          );
          odd.total = totalText;
          odd.over = overText;
          odd.under = underText;
        } catch (e) {
          console.log(e);
        }

        detail.homeTeamLastMatches = lastHomeTeamMatches;
        detail.awayTeamLastMatches = lastAwayTeamMatches;
        detail.h2hLastMatches = lastH2HMatches;
        detail.odd = odd;
        match.detail = detail;
        pageH2.close();
      }
      matches[i] = match;
    }
  }
}
