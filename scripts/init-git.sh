set -ex

echo "###################################################################"
echo "Init git for formuladb-be for env: $FRMDB_ENV_NAME"
echo "###################################################################"
ls -ltr /wwwroot/git/formuladb-env || true
ls -ltr /wwwroot/formuladb

export BASEDIR=`dirname $0`
export GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -i /ssh/frmdb.id_rsa"

if [ -n "$FRMDB_LOCALDEV_ENV" -a -z "$BUILD_CI" ]; then 
    echo "using hostPath volume"
    mount
    ls /wwwroot/git/formuladb-env/db
else
    cd /wwwroot/git
    if [ ! -d "formuladb-env" ]; then

        if [[ "`git ls-remote --heads git@gitlab.formuladb.io:formuladb/formuladb-env.git \"${FRMDB_ENV_NAME}\"| wc -l`" -gt 0 ]]; then
            git clone --branch ${FRMDB_ENV_NAME} --single-branch --depth 1 git@gitlab.formuladb.io:formuladb/formuladb-env.git
        else
            git clone --branch master --single-branch --depth 1 git@gitlab.formuladb.io:formuladb/formuladb-env.git
        fi
    else 
        echo "env already exists"
        pwd
	    ls $PWD/formuladb-env
        date >> /wwwroot/git/formuladb-env/date.txt || true
        cat /wwwroot/git/formuladb-env/date.txt || true
    fi

    cd /wwwroot/git/formuladb-env
    git config user.email "git.bot@formuladb.io"
    git config user.name "Git Bot"
    if [[ "`git branch|grep '^*'|cut -d ' ' -f2`" == "${FRMDB_ENV_NAME}" ]]; then
        git remote -v
        git pull origin ${FRMDB_ENV_NAME} -Xtheirs
    else
        git checkout -b "${FRMDB_ENV_NAME}"
        git add .
        git commit -m "new branch ${FRMDB_ENV_NAME}" || true
        git push --atomic --set-upstream origin "${FRMDB_ENV_NAME}"
    fi
fi
