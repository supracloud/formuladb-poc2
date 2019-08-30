set -x

handleErr () {
    errcode=$?
    set +x
    echo "ERR on line ${BASH_LINENO[0]}: $BASH_COMMAND RETURNED $errcode"
    echo exit $errcode
}
trap handleErr ERR

./deploy-k3s.sh

mkdir -p live-server-wwwroot
cd live-server-wwwroot #optimize speed
../node_modules/.bin/live-server --wait=200 --port=8081 -V --no-browser \
    --mount=/formuladb-editor/:../vvvebjs/ \
    --mount=/formuladb/:./../dist-fe/ \
    --mount=/formuladb/img/:./../fe/img/ \
    --mount=/formuladb/frmdb-runtime-utils.js:./../fe/js/frmdb-runtime-utils.js \
    --mount=/frmdb-apps/inventory:../../../frmdb-themes/startbootstrap-sb-admin-2 \
    --proxy=/frmdb-apps/inventory:http://localhost:8084/frmdb-apps/inventory \
    --mount=/frmdb-apps/hotel-booking:../../../frmdb-themes/royal-master \
    --proxy=/frmdb-apps/hotel-booking:http://localhost:8084/frmdb-apps/hotel-booking \
    --mount=/:../../../frmdb-apps/formuladb.io \
    --proxy=/formuladb-api:http://localhost:8084/formuladb-api \
    --proxy=/:http://localhost:8084/ \
