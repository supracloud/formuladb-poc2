FROM node:lts-alpine

RUN apk update --no-cache && apk upgrade --no-cache && \
    apk add --no-cache bash git

COPY package.json /package.json

RUN npm install --only=production

COPY dist-be/frmdb-be.js /dist-be/frmdb-be.js

EXPOSE 3000

CMD [ "npm", "start" ]
