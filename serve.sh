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
    kubectlexec be mkdir -- -p /wwwroot/git/.git
    kubectlrsync .git/modules be:/wwwroot/git/.git/modules
    kubectlrsync formuladb-apps be:/wwwroot/git/
    kubectlrsync formuladb-icons be:/wwwroot/git/
    kubectlrsync formuladb-static be:/wwwroot/git/
    kubectlrsync formuladb-themes be:/wwwroot/git/

    sleep 2
done
) &

./node_modules/.bin/live-server --port=8081 -V --no-browser \
    --mount=/formuladb/:./formuladb/ \
    --mount=/formuladb-themes/:./formuladb-themes/ \
    --mount=/formuladb-static/:./formuladb-static/ \
    --mount=/formuladb-apps/:./formuladb-apps/ \
    --mount=/formuladb-icons/:./formuladb-icons/ \
    --proxy=/formuladb-api:http://localhost:8084/formuladb-api \
