FROM apache/couchdb:latest

# RUN apt-get install trickle
COPY local.ini /opt/couchdb/etc/local.d/
COPY wondershaper.sh /
