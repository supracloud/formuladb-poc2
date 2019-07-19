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
  "npm run docker:be && docker-compose up -d db be && nc -zvw3 localhost 8084 && touch dist-fe/frmdb-fe.js" &

sleep 2

mkdir -p live-server-wwwroot
cd live-server-wwwroot #optimize speed
live-server --wait=200 --port=8081 -V --no-browser \
    --mount=/formuladb-editor/:../../VvvebJs/ \
    --mount=/customize-editor.js:./../fe/js/customize-editor.js \
    --mount=/formuladb/frmdb-fe.js:./../dist-fe/frmdb-fe.js \
    --mount=/formuladb/frmdb-fe.js.map:./../dist-fe/frmdb-fe.js.map \
    --mount=/formuladb/frmdb-data-grid.js:./../dist-fe/frmdb-data-grid.js \
    --mount=/formuladb/frmdb-data-grid.js.map:./../dist-fe/frmdb-data-grid.js.map \
    --mount=/formuladb/frmdb-form.js:./../dist-fe/frmdb-form.js \
    --mount=/formuladb/frmdb-editor.js:./../dist-fe/frmdb-editor.js \
    --mount=/formuladb/frmdb-editor.js.map:./../dist-fe/frmdb-editor.js.map \
    --mount=/formuladb-apps/:../../../frmdb-apps/ \
    --mount=/:../../portal/public \
    --proxy=/formuladb-api:http://localhost:8084/formuladb-api \
    --proxy=/:http://localhost:8084/ \
