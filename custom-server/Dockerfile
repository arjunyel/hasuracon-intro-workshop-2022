FROM node:16

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY . .

RUN npm ci

EXPOSE 4000

CMD [ "npx", "--yes", "ts-node", "--transpileOnly" ,"src/main.ts" ]
