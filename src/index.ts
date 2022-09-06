import { MatchService } from "./matches/match.service";
// import * as cron from "node-cron";
import { recordDB } from "./matches/match.client";
import * as dotenv from "dotenv";
dotenv.config();
async function run() {
  const matchService = new MatchService();
  const matches = await matchService.getMatches([
    "EUROPE: Europa League - Group Stage",
    "EUROPE: Europa Conference League - Group Stage"
  ]);
  //SPAIN: LaLiga

  for (let i = 0; i < 8; i++) {
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
