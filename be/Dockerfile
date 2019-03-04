FROM node:8

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json /package.json

RUN npm install  --only=production

COPY dist/be/src/server.js /dist/be/src/server.js
COPY .env.prod /.env

EXPOSE 3000

CMD [ "npm", "start" ]
