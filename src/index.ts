import { MatchService } from "./matches/match.service";

async function run() {
  const matchService = new MatchService();
  const matches = await matchService.getMatches(["ENGLAND: Premier League"]);
  //SPAIN: LaLiga

  for (let i = 0; i < 5; i++) {
    const match = matches[i];
    console.dir(match, { depth: null });
  }
}
run(); //run fonksiyonu çağrılır.
