FROM node:current-alpine

ENV NODE_ENV=production

WORKDIR /irb

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm install

COPY ./src/client ./src/client
COPY ./src/common ./src/common

RUN npm run build

COPY . .

ENTRYPOINT ["npm", "run", "start"]