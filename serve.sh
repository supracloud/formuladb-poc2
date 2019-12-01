handleErr () {
    errcode=$?
    set +x
    echo "ERR on line ${BASH_LINENO[0]}: $BASH_COMMAND RETURNED $errcode"
    echo exit $errcode
}
trap handleErr ERR

(
. ci/tools.sh
while true; do
    kubectlrsync formuladb-env be:/wwwroot/git/formuladb-env
    kubectlrsync be:/wwwroot/git/formuladb-env formuladb-env

    sleep 2
done
) &

./node_modules/.bin/live-server --port=8081 -V --no-browser \
    --mount=/formuladb/:./formuladb/ \
    --mount=/formuladb-env/:./formuladb-env/ \
    --proxy=/formuladb-api:http://localhost:8084/formuladb-api \
