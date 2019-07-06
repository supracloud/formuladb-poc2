set -x

handleErr () {
    errcode=$?
    set +x
    echo "ERR on line ${BASH_LINENO[0]}: $BASH_COMMAND RETURNED $errcode"
    echo exit $errcode
}
trap handleErr ERR

FEBEDIR=$PWD
while true; do
  . .env.dev

  if [ ! -d "$APPDIR" ]; then
    echo "$APPDIR is not a directory, please set the APPDIR var in .env.dev, waiting..."
    continue
  fi

  if [ ! -f "${APPDIR}/docker-compose.yml" ]; then
      echo "docker-compose not found in $APPDIR, waiting..."
      continue
  fi

  if [ ! -f "${APPDIR}/index.html" ]; then
      echo "index.html not found in $APPDIR, waiting..."
      continue
  fi

  if ! (command nodemon -h || command nc); then
      echo "run npm install -g nodemon && apt-get install -y netcat in order to serve/debug this app, waiting..."
      continue
  fi

  break
done


FRMDB_RELEASE=0.0.12 nodemon --verbose --delay 200ms --watch dist-be/frmdb-be.js --exec \
  "npm run docker:be && docker-compose -f ${APPDIR}/docker-compose.yml up -d db be && nc -zvw3 localhost 8084 && touch ${APPDIR}/index.html" &

sleep 2

cd "${APPDIR}"
live-server --entry-file="index.html" --wait=200 --port=8081 -V --no-browser \
     --proxy=/formuladb-api:http://localhost:8084/formuladb-api \
     --mount=/formuladb/:"$FEBEDIR/dist-fe/"
    "${APPDIR}"
