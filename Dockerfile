FROM node:current-alpine

ENV NODE_ENV=production

WORKDIR /irb

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm install

COPY . .

RUN npm run build

ENTRYPOINT ["npm", "run", "start"]