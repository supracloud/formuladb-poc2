handleErr () {
    errcode=$?
    set +x
    echo "ERR on line ${BASH_LINENO[0]}: $BASH_COMMAND RETURNED $errcode"
    echo exit $errcode
}
trap handleErr ERR

./node_modules/.bin/live-server --wait=200 --port=8081 -V --no-browser \
    --mount=/formuladb/:./formuladb/ \
    --mount=/formuladb-themes/:./formuladb-themes/ \
    --mount=/formuladb-static/:./formuladb-static/ \
    --mount=/formuladb-apps/:./formuladb-apps/ \
    --proxy=/formuladb-api:http://localhost:8084/formuladb-api \
