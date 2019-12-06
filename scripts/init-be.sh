set -x

echo "env: $FRMDB_ENV_NAME"

export BASEDIR=`dirname $0`
export GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -i /ssh/frmdb.id_rsa"

pwd
find /wwwroot/git -type d 

cd /wwwroot/git
if [ ! -d "formuladb-env" ]; then

    BASE_BRANCH="master"
    if [[ "`git ls-remote --heads git@gitlab.com:metawiz/formuladb-env.git \"${FRMDB_ENV_NAME}\"| wc -l`" -gt 0 ]]; then
        BASE_BRANCH="${FRMDB_ENV_NAME}"
    fi
    git clone --jobs 10 --branch "${BASE_BRANCH}" --single-branch --depth 1 \
        git@gitlab.com:metawiz/formuladb-env.git
fi

cd formuladb-env
if [[ "`git branch|grep '^*'|cut -d ' ' -f2`" == "${FRMDB_ENV_NAME}" ]]; then
    git pull
else
    cd formuladb-env
    if [[ "`git branch|grep '^*'|cut -d ' ' -f2`" == "${FRMDB_ENV_NAME}" ]]; then
        echo "branch already existing locally"
        git pull
    else
        echo "ERROR git repo not initialized correctly...exiting..."
        exit 1
    fi
fi
