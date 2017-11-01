FROM apache/couchdb:latest

COPY local.ini /opt/couchdb/etc/local.d/
