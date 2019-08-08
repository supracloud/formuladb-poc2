set -x

handleErr () {
    errcode=$?
    set +x
    echo "ERR on line ${BASH_LINENO[0]}: $BASH_COMMAND RETURNED $errcode"
    echo exit $errcode
}
trap handleErr ERR

fctCheckDir() {
  test -d $1 || (echo "Dir not found ${1}"; exit 1) 
}

FRMDB_RELEASE=0.0.12 DEV_MODE=true DEFAULT_USER=$USER ./node_modules/.bin/nodemon --verbose --delay 200ms --watch dist-be/frmdb-be.js --exec \
  "npm run docker:be && docker-compose up -d db be && nc -zvw3 localhost 8084 && touch dist-fe/frmdb-fe.js" &

sleep 2

mkdir -p live-server-wwwroot
cd live-server-wwwroot #optimize speed
../node_modules/.bin/live-server --wait=200 --port=8081 -V --no-browser \
    --mount=/formuladb-editor/:../vvvebjs/ \
    --mount=/formuladb/frmdb-fe.js:./../dist-fe/frmdb-fe.js \
    --mount=/formuladb/frmdb-fe.js.map:./../dist-fe/frmdb-fe.js.map \
    --mount=/formuladb/frmdb-data-grid.js:./../dist-fe/frmdb-data-grid.js \
    --mount=/formuladb/frmdb-data-grid.js.map:./../dist-fe/frmdb-data-grid.js.map \
    --mount=/formuladb/frmdb-form.js:./../dist-fe/frmdb-form.js \
    --mount=/formuladb/frmdb-editor.js:./../dist-fe/frmdb-editor.js \
    --mount=/formuladb/frmdb-editor.js.map:./../dist-fe/frmdb-editor.js.map \
    --mount=/frmdb-apps/:../../../frmdb-apps/ \
    --mount=/frmdb-apps/hotel-booking:../../../frmdb-themes/royal-master \
    --mount=/frmdb-apps/inventory:../../../frmdb-themes/startbootstrap-sb-admin-2 \
    --mount=/:../portal/public \
    --proxy=/formuladb-api:http://localhost:8084/formuladb-api \
    --proxy=/:http://localhost:8084/ \
