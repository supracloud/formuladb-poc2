handleErr () {
    errcode=$?
    set +x
    echo "ERR on line ${BASH_LINENO[0]}: $BASH_COMMAND RETURNED $errcode"
    echo exit $errcode
}
trap handleErr ERR

npm run sync-dev-static-assets &

./node_modules/.bin/live-server --wait=200 --port=8081 -V --no-browser \
    --mount=/formuladb-editor/:./formuladb-editor/ \
    --mount=/formuladb/:././dist-fe/ \
    --mount=/formuladb/img/:././fe/img/ \
    --mount=/formuladb/icons/:././fe/icons/ \
    --mount=/test:./test \
    --mount=/formuladb/frmdb-runtime-utils.js:./fe/js/frmdb-runtime-utils.js \
    --proxy=/:http://localhost:8084/ \
