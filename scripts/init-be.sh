set -x

echo "env: $FRMDB_ENV_NAME"

export BASEDIR=`dirname $0`
export GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -i /ssh/frmdb.id_rsa"

pwd
find /wwwroot/git -type d 

cd /wwwroot/git
if [ ! -d "formuladb-env" ]; then

    if git clone --branch "${FRMDB_ENV_NAME}" --single-branch --depth 1 git@gitlab.com:metawiz/formuladb-env.git; then
        echo "branch already existing remotely"
    else
        cp -ar /formuladb-env formuladb-env 
        cd formuladb-env
        git init
        git remote add origin git@gitlab.com:metawiz/formuladb-env.git
        git checkout -b "${FRMDB_ENV_NAME}"

        git add .
        git config user.email "sync@formuladb.io"
        git config user.name "Frmdb Sync"
        git commit -m "Created env ${FRMDB_ENV_NAME}"

        git push --atomic --set-upstream origin "${FRMDB_ENV_NAME}"
    fi
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
