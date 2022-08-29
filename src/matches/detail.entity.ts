import { Odd } from "./odd.entity";
import { LastMatch } from "./last-match.entity";

export class Detail {
  odd?: Odd;
  homeTeamLastMatches?: LastMatch[];
  awayTeamLastMatches?: LastMatch[];
  h2hLastMatches?: LastMatch[];
}
