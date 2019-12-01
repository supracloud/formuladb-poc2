set -x

echo "env: $FRMDB_ENV_NAME"

export BASEDIR=`dirname $0`
export GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -i /ssh/frmdb.id_rsa"

pwd
find /wwwroot/git -type d 

for submodule in formuladb-icons formuladb-themes formuladb-static formuladb-apps; do
    cd /wwwroot/git
    if [ ! -d "${submodule}" ]; then
        cp -ar /${submodule} ${submodule} 
    fi

    cd ${submodule}
    if [[ "`git branch|grep '^*'|cut -d ' ' -f2`" == "${FRMDB_ENV_NAME}" ]]; then
        git pull
    else
        git checkout -b "${FRMDB_ENV_NAME}"
        git push --set-upstream origin "${FRMDB_ENV_NAME}"
    fi

done

# TODO: we should overwrite this should be the current user using --author ?
git config user.email "alexandru.cristu@formuladb.io"
git config user.name "Alexandru Cristu Sync"
