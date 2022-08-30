import { Detail } from "./detail.entity";

export class Match {
  time?: string;
  homeTeam?: string;
  awayTeam?: string;
  detail?: Detail;
  league?: string;
  pageId?: string;
  totalPoint?: number;
}
