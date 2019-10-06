handleErr () {
    errcode=$?
    set +x
    echo "ERR on line ${BASH_LINENO[0]}: $BASH_COMMAND RETURNED $errcode"
    echo exit $errcode
}
trap handleErr ERR

./node_modules/.bin/live-server --wait=200 --port=8081 -V --no-browser \
    --watch=./formuladb-editor,dist-fe,fe/js,fe/img,formuladb-apps \
    --proxy=/:http://localhost:8084/ \
