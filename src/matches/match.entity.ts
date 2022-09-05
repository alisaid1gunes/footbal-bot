import { Detail } from "./detail.entity";

export class Match {
  time?: string;
  homeTeamImage?: string;
  awayTeamImage?: string;
  homeTeam?: string;
  awayTeam?: string;
  detail?: Detail;
  league?: string;
  pageId?: string;
  totalPoint?: number;
}
