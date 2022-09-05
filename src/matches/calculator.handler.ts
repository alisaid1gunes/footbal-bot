import { Match } from "./match.entity";

export class CalculatorHandler {
  private receivedMatches: Match[];
  private filteredMatches: Match[];
  private matches: Match[];
  constructor(matches: Match[]) {
    this.receivedMatches = matches;
    this.filteredMatches = [];
    this.matches = [];
  }

  public async calculate() {
    for (let i = 0; i < this.receivedMatches.length; i++) {
      const match = this.receivedMatches[i];
      const odd = match.detail?.odd;
      if (odd !== undefined) {
        const over = odd?.over;
        if (over !== undefined) {
          if (over > 1.5) {
            console.log("over 1.5");
            this.filteredMatches.push(match);
          }
        }
      }
    }
    if (this.filteredMatches.length > 0) {
      for (let j = 0; j < this.filteredMatches.length; j++) {
        const match = this.filteredMatches[j];
        // @ts-ignore
        let homeTeamMatchTotalGoalScoring = 0;
        // @ts-ignore
        let awayTeamMatchTotalGoalScoring = 0;
        // @ts-ignore
        let h2hMatchTotalGoalScoring = 0;

        const homeTeamLastMatches = match.detail?.homeTeamLastMatches;
        if (homeTeamLastMatches !== undefined) {
          for (let k = 0; k < homeTeamLastMatches.length; k++) {
            if (k < 5) {
              const homeTeamMatch = homeTeamLastMatches[k];
              if (homeTeamMatch !== undefined) {
                const homeTeamMatchGoals = homeTeamMatch.homeTeamGoals;
                if (homeTeamMatchGoals !== undefined) {
                  const newScore =
                    Number(homeTeamMatch!.homeTeamGoals!) +
                    Number(homeTeamMatch!.awayTeamGoals!);

                  homeTeamMatchTotalGoalScoring =
                    Number(homeTeamMatchTotalGoalScoring) + Number(newScore);
                  console.log({ homeTeamMatchTotalGoalScoring });
                }
              }
            }
          }
        }
        const awayTeamLastMatches = match.detail?.awayTeamLastMatches;
        if (awayTeamLastMatches !== undefined) {
          for (let l = 0; l < awayTeamLastMatches.length; l++) {
            if (l < 5) {
              const awayTeamMatch = awayTeamLastMatches[l];
              if (awayTeamMatch !== undefined) {
                const awayTeamMatchGoals = awayTeamMatch.awayTeamGoals;
                if (awayTeamMatchGoals !== undefined) {
                  const newScore =
                    Number(awayTeamMatch!.homeTeamGoals!) +
                    Number(awayTeamMatch!.awayTeamGoals!);

                  awayTeamMatchTotalGoalScoring =
                    Number(awayTeamMatchTotalGoalScoring) + Number(newScore);
                  console.log({ awayTeamMatchTotalGoalScoring });
                }
              }
            }
          }
        }

        const h2hLastMatches = match.detail?.h2hLastMatches;
        if (h2hLastMatches !== undefined) {
          for (let m = 0; m < h2hLastMatches.length; m++) {
            if (m < 5) {
              const h2hMatch = h2hLastMatches[m];
              if (h2hMatch !== undefined) {
                const h2hMatchGoals = h2hMatch.homeTeamGoals;
                if (h2hMatchGoals !== undefined) {
                  const newScore =
                    Number(h2hMatch!.homeTeamGoals!) +
                    Number(h2hMatch!.awayTeamGoals!);

                  h2hMatchTotalGoalScoring =
                    Number(h2hMatchTotalGoalScoring) + Number(newScore);
                  console.log({ h2hMatchTotalGoalScoring });
                }
              }
            }
          }
        }
        console.log({
          homeTeamMatchTotalGoalScoring,
          awayTeamMatchTotalGoalScoring,
          h2hMatchTotalGoalScoring,
        });
        match.totalPoint =
          (Number(homeTeamMatchTotalGoalScoring) / 5) * 0.4 +
          (Number(awayTeamMatchTotalGoalScoring) / 5) * 0.4 +
          (Number(h2hMatchTotalGoalScoring) / 5) * 0.2;

        this.matches.push(match);

        this.matches.sort(
          (matchOne, matchTwo) => matchOne!.totalPoint! - matchTwo!.totalPoint!
        );
        this.matches.reverse();
      }
    }
    return this.matches;
  }
}
