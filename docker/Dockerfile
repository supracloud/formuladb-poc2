FROM apache/couchdb:latest

RUN apt-get update -y && apt-get install -y --no-install-recommends \
    trickle \
  && rm -rf /var/lib/apt/lists/*

# RUN apt-get install trickle
COPY local.ini /opt/couchdb/etc/local.d/
COPY wondershaper.sh /
