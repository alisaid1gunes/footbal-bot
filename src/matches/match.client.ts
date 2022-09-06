import {
  ApolloClient,
  ApolloLink,
  gql,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";

import fetch from "cross-fetch";
import { Match } from "./match.entity";

export const recordDB = async (match: Match) => {
  const authMiddleware = (authToken: string) =>
    new ApolloLink((operation, forward) => {
      // add the authorization to the headers
      if (authToken) {
        operation.setContext({
          headers: {
            authorization: `Bearer ${authToken}`,
          },
        });
      }

      return forward(operation);
    });
  const httpLink = new HttpLink({
    uri: "https://graphcool.univerlist.com/simple/v1/ckay3iu6s00040172bwqnrgac",
    fetch,
  });
  const client = new ApolloClient({
    link: authMiddleware(process.env.TOKEN as string).concat(httpLink),
    cache: new InMemoryCache(),
    typeDefs: gql`
      scalar DateTime
      enum MatchType {
        Futbol
      }
    `,
  });

  client
    .mutate({
      mutation: gql`
        mutation createTeam(
          $prediction: String!
          $predictionEN: String!
          $matchDate: DateTime!
          $matchType: MatchType!
          $teamFirst: String!
          $teamSecond: String!
          $homeImage: String!
          $awayImage: String!
          $productsId: ID!
          $locationIds: [ID!]
        ) {
          createTeam(
            prediction: $prediction
            predictionEN: $predictionEN
            matchDate: $matchDate
            matchType: $matchType
            teamFirst: $teamFirst
            teamSecond: $teamSecond
            homeImage: $homeImage
            awayImage: $awayImage
            productsId: $productsId
            locationIds: $locationIds
          ) {
            prediction
          }
        }
      `,
      variables: {
        prediction: match.totalPoint! > 2.5 ? "2.5 Üst" : "2.5 Alt",
        predictionEN: match.totalPoint! > 2.5 ? "2.5 Over" : "2.5 Under",
        matchDate: match.dateGMT,
        matchType: "Futbol",
        teamFirst: match.homeTeam,
        teamSecond: match.awayTeam,
        homeImage: match.homeTeamImage,
        awayImage: match.awayTeamImage,
        productsId: "cjudvlen3j9mx0183kza55j5t",
        locationIds: ["cjz3uqgbt5yge0165k2lz16oo"],
      },
    })
    .then((result) => console.log(result));
};
