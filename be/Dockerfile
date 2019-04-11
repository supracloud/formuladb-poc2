FROM node:lts-alpine

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)

# RUN apt-get update && \
#   apt-get install -y socat net-tools git && \
#   apt-get clean

RUN apk update && apk upgrade && \
    apk add --no-cache bash git

COPY package.json /package.json

RUN npm install  --only=production

COPY dist/be/src/server.js /dist/be/src/server.js
COPY .env.prod /.env

EXPOSE 3000

CMD [ "npm", "start" ]
