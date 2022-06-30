import express from "express";
import { graphQLServer } from "./graphql";
import { request, gql } from "graphql-request";
import * as jwt from "jsonwebtoken";

const app = express();

app.use(express.json());

// Bind GraphQL Yoga to `/graphql` endpoint
app.use("/graphql", graphQLServer);

app.use("/events", async (req, res) => {
  console.log("New user", req.body.event.data.new.email, "registered");
  res.sendStatus(200);
});

app.use("/register", async (req, res) => {
  const { email } = req.body.input;

  const {
    insert_user_one: { id },
  } = await request(
    "http://graphql-engine:8080/v1/graphql",
    gql`
      mutation MyMutation($email: String!) {
        insert_user_one(
          object: { email: $email }
          on_conflict: { constraint: user_email_key, update_columns: [] }
        ) {
          id
        }
      }
    `,
    { email },
    {
      "x-hasura-admin-secret": "myadminsecretkey",
    }
  );

  return res.json({
    jwt: jwt.sign(
      {
        "https://hasura.io/jwt/claims": {
          "x-hasura-allowed-roles": ["user"],
          "x-hasura-default-role": "user",
          "x-hasura-user-id": id,
        },
      },
      "this-is-a-generic-HS256-secret-key-and-you-should-really-change-it",
      {
        algorithm: "HS256",
        expiresIn: "10h",
      }
    ),
  });
});

app.listen(4000, "0.0.0.0");
