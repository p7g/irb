FROM node:current-alpine

ENV NODE_ENV=production

COPY . /irb
WORKDIR /irb

RUN npm install
RUN npm run build

CMD npm run start