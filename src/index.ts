import { MatchService } from "./matches/match.service";
import * as cron from "node-cron";
async function run() {
  const matchService = new MatchService();
  const matches = await matchService.getMatches(["ITALY: Serie A"]);
  //SPAIN: LaLiga

  for (let i = 0; i < 5; i++) {
    const match = matches[i];
    console.dir(match, { depth: null });
  }
}

cron.schedule("* * * * *", () => {
  run();
});
