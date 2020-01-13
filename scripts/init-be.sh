set -x

echo "env: $FRMDB_ENV_NAME"

export BASEDIR=`dirname $0`
export GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -i /ssh/frmdb.id_rsa"

pwd
find /wwwroot/git -type d 

if [ -n "$BUILD_DEVELOPMENT" ]; then 
    cp -ar /formuladb-env /wwwroot/git/
    exit; 
fi


cd /wwwroot/git
if [ ! -d "formuladb-env" ]; then

    if [[ "`git ls-remote --heads git@gitlab.formuladb.io:formuladb/formuladb-env.git \"${FRMDB_ENV_NAME}\"| wc -l`" -gt 0 ]]; then
        git clone --branch ${FRMDB_ENV_NAME} --single-branch --depth 1 git@gitlab.formuladb.io:formuladb/formuladb-env.git
    else
        git clone --single-branch --depth 1 file:///formuladb-env

        cd /wwwroot/git/formuladb-env
        git config user.email "git.bot@formuladb.io"
        git config user.name "Git Bot"
        git remote set-url origin git@gitlab.formuladb.io:formuladb/formuladb-env.git
    fi
fi

cd /wwwroot/git/formuladb-env
if [[ "`git branch|grep '^*'|cut -d ' ' -f2`" == "${FRMDB_ENV_NAME}" ]]; then
    git pull origin ${FRMDB_ENV_NAME}
else
    git checkout -b "${FRMDB_ENV_NAME}"
    git push --atomic --set-upstream origin "${FRMDB_ENV_NAME}"
fi
