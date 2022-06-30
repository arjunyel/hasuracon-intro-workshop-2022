# Intro to Hasura

1. In an empty folder, use the Hasura CLI to create a project in the `hasura` diresctory

   ```bash
   hasura init hasura
   ```

1. Setup the Docker Compose file

   1. Clone the Docker Compose file

      ```bash
      # curl
      curl https://raw.githubusercontent.com/hasura/graphql-engine/stable/install-manifests/docker-compose/docker-compose.yaml -o docker-compose.yml
      # wget
      wget https://raw.githubusercontent.com/hasura/graphql-engine/stable/install-manifests/docker-compose/docker-compose.yaml
      ```

   1. In docker-compose.yml, under services -> graphql-engine

      1. For `image` add `.cli-migrations-v3` to the end

      1. Add a `volumes` section

         ```yaml
         volumes:
           - ./hasura/metadata:/hasura-metadata
           - ./hasura/migrations:/hasura-migrations
         ```

      1. In `environment` section

         1. Set `HASURA_GRAPHQL_ENABLE_CONSOLE` to "false"

         1. Add these entries

            ```yaml
            HASURA_GRAPHQL_ADMIN_SECRET: myadminsecretkey
            HASURA_GRAPHQL_JWT_SECRET: '{ "type": "HS256", "key": "this-is-a-generic-HS256-secret-key-and-you-should-really-change-it" }'
            CUSTOM_GRAPHQL_SERVER: http://host.docker.internal:4000/graphql
            CUSTOM_BACKEND_SERVER: http://host.docker.internal:4000
            CUSTOM_BACKEND_SERVER_EVENTS: http://host.docker.internal:4000/events
            ```

   1. Add example backend server as a service

      ```yaml
      backend-server:
        image: arjunyelhasura/hasuracon-intro-workshop-2022:latest
        ports:
          - "4000:4000"
        depends_on:
          - "graphql-engine"
        restart: always
      ```

1. Run the docker containers

   ```bash
   docker compose up -d
   ```

1. Run the Hasura CLI pointing at our project folder and using our admin secret

   ```bash
   hasura console --project hasura --admin-secret myadminsecretkey
   ```

1. In the data tab connect a database with name `default` and via the enviroment variable `PG_DATABASE_URL`

1. In the `public` database add a table `user` with the following columns:

   - Frequently used columns id (the UUID one) and created_at
   - email (type Text and unique)

1. Add a table `todo` with the following columns

   - Frequently used columns id (the UUID one) and created_at
   - title (type Text)
   - is_completed (type Boolean and default false)
   - user_id (type UUID)

1. Add a foreign key connecting the todo and user table

   1. Select the todo table and click modify

   1. Add a foreign key, reference table is `user` and maps `user_id` to `id`

   1. In the relationships tab, under object relationships add the suggested `user` connection

1. Add permissions for `todo` table. Click on the permissions tab and add a new role `user`

   - Insert: with custom check of `{"user_id":{"_eq":"X-Hasura-User-Id"}}`, allow setting the title, and column preset user_id from session variable X-Hasura-User-Id
   - Select: with same custom check as insert, and allow access to all columns
   - Update: pre and post update check same as others, all them to update is_completed
   - Delete: same check as others

1. Setup the permissions for the `user` table

   - Select: with custom check of `{"id":{"_eq":"X-Hasura-User-Id"}}`, and select all columns

1. Using Hasura Actions, create a user registration endpoint

   1. Select the actions tab at the top of the console and create a new one

      ```graphql
      type Mutation {
        registerUser(email: String!): RegisteredUser!
      }
      ```

   1. The custom type we define

      ```graphql
      type RegisteredUser {
        jwt: String!
      }
      ```

   1. the handler will be `{{CUSTOM_BACKEND_SERVER}}/register`

1. Add a remote schema

   1. In the remote schema tab, add `custom-server` from the enviroment variable `CUSTOM_GRAPHQL_SERVER`
   1. In the data tab, todo table relationships, add a remote schema relationship to the sentiment field. From the `title` column

1. Add event trigger

   1. In events tab, add a new one named `new_user`
   1. table is `user`, operation is insert and via console, and the handler is enviroment variable `CUSTOM_BACKEND_SERVER_EVENTS`
