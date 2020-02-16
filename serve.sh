handleErr () {
    errcode=$?
    set +x
    echo "ERR on line ${BASH_LINENO[0]}: $BASH_COMMAND RETURNED $errcode"
    echo exit $errcode
}
trap handleErr ERR

./node_modules/.bin/live-server --quiet --port=8081 --no-browser \
    --wait=1000 \
    --watch=formuladb \
    --mount=/formuladb/:./formuladb/ \
    --mount=/formuladb-env/themes/:./formuladb-env/themes \
    --mount=/formuladb-env/icons/:./formuladb-env/icons \
    --mount=/formuladb-env/static/:./formuladb-env/static \
    --mount=/formuladb-env/plugins/:./formuladb-env/plugins \
    --proxy=/frmdb-apps/:http://localhost:8084/frmdb-apps \
    --proxy=/formuladb-api:http://localhost:8084/formuladb-api
