set -x

handleErr () {
    errcode=$?
    set +x
    echo "ERR on line ${BASH_LINENO[0]}: $BASH_COMMAND RETURNED $errcode"
    echo exit $errcode
}
trap handleErr ERR

./tools/prepare-dev-tenant.sh

mkdir -p live-server-wwwroot
cd live-server-wwwroot #optimize speed
../node_modules/.bin/live-server --wait=200 --port=8081 -V --no-browser \
    --mount=/formuladb-editor/:../vvvebjs/ \
    --mount=/formuladb/:./../dist-fe/ \
    --mount=/formuladb/img/:./../fe/img/ \
    --mount=/formuladb/frmdb-runtime-utils.js:./../fe/js/frmdb-runtime-utils.js \
    --proxy=/:http://localhost:8085/ \
