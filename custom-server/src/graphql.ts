import { makeExecutableSchema } from "@graphql-tools/schema";
import { createServer } from "@graphql-yoga/node";
import { readFileSync } from "fs";
import { Resolvers, Sentiment } from "./generated/graphql";

const typeDefs = readFileSync("./schema.graphql", "utf8");

const resolvers: Resolvers = {
  Query: {
    sentiment: (parent: unknown, args: { text: string }) => {
      const sentiments = Object.values(Sentiment);
      return sentiments[Math.floor(Math.random() * sentiments.length)];
    },
  },
};

export const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefs],
});

export const graphQLServer = createServer({
  schema,
});
