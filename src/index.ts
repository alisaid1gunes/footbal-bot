import { MatchService } from "./matches/match.service";

async function run() {
  const matchService = new MatchService();
  const matches = await matchService.getMatches([]);
  //SPAIN: LaLiga
  console.log(matches);
}
run(); //run fonksiyonu çağrılır.
