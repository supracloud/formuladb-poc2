FROM node:lts-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache bash git

ADD package.json /app/
WORKDIR /app
RUN npm install

COPY index.js /app/index.js

CMD [ "node", "/app/index.js" ]
