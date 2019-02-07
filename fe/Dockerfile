FROM nginx:1.14

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY dist/fe /usr/share/nginx/html/formuladb

RUN rm /etc/nginx/conf.d/default.conf
COPY formuladb-nginx.conf /etc/nginx/conf.d/formuladb-nginx.conf
