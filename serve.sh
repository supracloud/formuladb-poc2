handleErr () {
    errcode=$?
    set +x
    echo "ERR on line ${BASH_LINENO[0]}: $BASH_COMMAND RETURNED $errcode"
    echo exit $errcode
}
trap handleErr ERR

./node_modules/.bin/live-server --port=8081 -V --no-browser \
    --mount=/formuladb/:./formuladb/ \
    --mount=/formuladb-env/:./formuladb-env/ \
    --proxy=/formuladb-api:http://localhost:8084/formuladb-api \
