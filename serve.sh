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

fctCheckDir ../VvvebJs #git clone https://github.com/acristu/VvvebJs.git
fctCheckDir ../../frmdb-themes/royal-master #git clone https://gitlab.com/frmdb-themes/royal-master.git
fctCheckDir ../../frmdb-themes/startbootstrap-sb-admin-2 #git clone https://github.com/BlackrockDigital/startbootstrap-sb-admin-2
fctCheckDir ../../frmdb-apps/hotel-booking #git clone https://gitlab.com/frmdb-apps/royal-hotel.git
# fctCheckDir ../../frmdb-apps/basic-inventory

FRMDB_RELEASE=0.0.12 nodemon --verbose --delay 200ms --watch dist-be/frmdb-be.js --exec \
  "npm run docker:be && docker-compose up -d db be && nc -zvw3 localhost 8084 && touch dist-fe/frmdb-fe.js" &

sleep 2

mkdir -p live-server-wwwroot
cd live-server-wwwroot #optimize speed
live-server --wait=200 --port=8081 -V --no-browser \
    --mount=/formuladb-editor/:../vvvebjs/ \
    --mount=/formuladb/frmdb-fe.js:./../dist-fe/frmdb-fe.js \
    --mount=/formuladb/frmdb-fe.js.map:./../dist-fe/frmdb-fe.js.map \
    --mount=/formuladb/frmdb-data-grid.js:./../dist-fe/frmdb-data-grid.js \
    --mount=/formuladb/frmdb-data-grid.js.map:./../dist-fe/frmdb-data-grid.js.map \
    --mount=/formuladb/frmdb-form.js:./../dist-fe/frmdb-form.js \
    --mount=/formuladb/frmdb-editor.js:./../dist-fe/frmdb-editor.js \
    --mount=/formuladb/frmdb-editor.js.map:./../dist-fe/frmdb-editor.js.map \
    --mount=/formuladb-apps/:../../../frmdb-apps/ \
    --mount=/formuladb-themes/:../../../frmdb-themes/ \
    --mount=/:../portal/public \
    --proxy=/formuladb-api:http://localhost:8084/formuladb-api \
    --proxy=/:http://localhost:8084/ \
