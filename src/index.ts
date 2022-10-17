import { MatchService } from "./matches/match.service";
// import * as cron from "node-cron";
import { recordDB } from "./matches/match.client";
import * as dotenv from "dotenv";
dotenv.config();
async function run() {
  const matchService = new MatchService();
  const matches = await matchService.getMatches([
    "FRANCE: Ligue 1",
    "GERMANY: Bundesliga",
    "ITALY: Serie A",
    "ENGLAND: Premier League",
    "SPAIN: LaLiga",
    "TURKEY: Super Lig",
    "AUSTRALIA: A-League"
  
  ]);
  //SPAIN: LaLiga

  for (let i = 0; i < 4; i++) {
    const match = matches[i];
    console.dir(match, { depth: null });
    if (match !== undefined) {
      {
        await recordDB(match);
      }
    }
  }
}
// cron.schedule("0 2 * * *", () => {
  //Every day at  2am
  run();
// });
