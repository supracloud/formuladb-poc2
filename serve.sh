handleErr () {
    errcode=$?
    set +x
    echo "ERR on line ${BASH_LINENO[0]}: $BASH_COMMAND RETURNED $errcode"
    echo exit $errcode
}
trap handleErr ERR

if [ ! -d '../febe/docker-img' ]; then
     echo "you need febe project in order to serve/debug this app";
     exit 1;
fi

if ! (command nodemon || command nc); then
     echo "run npm install -g nodemon && apt-get install -y netcat in order to serve/debug this app";
     exit 1;
fi

FRMDB_RELEASE=0.0.12 nodemon --verbose --delay 200ms --watch docker-img -e t --exec "docker-compose up -d db febe maps && nc -zvw3 localhost 8084 && nc -zvw3 localhost 8085 && touch docker-img/compose.t" &

sleep 1

cd formuladb && live-server --watch=apps,docker-img/compose.t \
     --entry-file=index.html --wait=200 --port=8081 -V --no-browser \
     --proxy=/formuladb-api:http://localhost:8084/formuladb-api \
     --proxy=/formuladb:http://localhost:8084/formuladb \
     --proxy=/formuladb/frmdb-fe.js.map:http://localhost:8085/formuladb/frmdb-fe.js.map \
     --proxy=/formuladb/frmdb-data-grid.js.map:http://localhost:8085/formuladb/frmdb-data-grid.js.map \
     --entry-file=index.html
