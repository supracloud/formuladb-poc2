FROM nginx:1.14

RUN apt-get update && \
  apt-get install -y net-tools vim procps inetutils-ping curl

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY dist/fe /usr/share/nginx/html/formuladb

RUN rm /etc/nginx/conf.d/default.conf
COPY formuladb-nginx.conf /etc/nginx/conf.d/formuladb-nginx.conf
