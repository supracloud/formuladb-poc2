set -x

echo "env: $FRMDB_ENV_NAME"

export BASEDIR=`dirname $0`
export GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -i /ssh/frmdb.id_rsa"

pwd
find /wwwroot/git -type d 
cd /wwwroot/git
if [ ! -d "formuladb-apps" ]; then
    git clone --jobs 10 --branch "${FRMDB_ENV_NAME}" --single-branch --depth 1 \
        git@gitlab.com:metawiz/formuladb-apps.git formuladb-apps
    cd formuladb-apps
else
    cd formuladb-apps
    if [[ "`git branch|grep '^*'|cut -d ' ' -f2`" == "${FRMDB_ENV_NAME}" ]]; then
        git pull
    else
        git checkout -b "${FRMDB_ENV_NAME}"
        git push --set-upstream origin "${FRMDB_ENV_NAME}"
    fi
fi

# TODO: we should overwrite this should be the current user using --author ?
git config user.email "alexandru.cristu@computaris.com"
git config user.name "Alexandru Cristu Sync"
