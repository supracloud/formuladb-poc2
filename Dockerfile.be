FROM node:lts-alpine

ARG BUILD_DEVELOPMENT
ENV NPM_SCRIPT=${BUILD_DEVELOPMENT:+start_dev}
ENV NPM_SCRIPT=${NPM_SCRIPT:-start}

ENV GIT_SSH_COMMAND="ssh -i /ssh/frmdb.id_rsa"

RUN apk update --no-cache && apk upgrade --no-cache && \
    apk add --no-cache bash git vim openssh vimdiff

COPY package.json /package.json

RUN npm install --only=production

ADD ./formuladb-editor /wwwroot/formuladb-editor
ADD ./dist-fe /wwwroot/formuladb
COPY ./fe/js/*.js /wwwroot/formuladb/
ADD ./fe/img /wwwroot/formuladb/img
ADD ./ssh /ssh
ADD ./scripts /scripts
ADD ./formuladb-apps /wwwroot/git/formuladb-apps

COPY dist-be/frmdb-be* /dist-be/

EXPOSE 3000

CMD npm run $NPM_SCRIPT
