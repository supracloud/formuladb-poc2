FRMDB_ENV_NAME=$1
if [ -z "$FRMDB_ENV_NAME" ]; then echo "Usage: init-app.sh FRMDB_ENV_NAME FRMDB_APP_NAME"; exit 1; fi

export BASEDIR=`dirname $0`
export GIT_SSH_COMMAND="ssh -i ${BASEDIR}/../ssh/frmdb.id_rsa"

if [ ! -d "formuladb-env" ]; then
    git clone --jobs 2 --branch "${FRMDB_ENV_NAME}" --single-branch \
        git@gitlab.com:metawiz/formuladb-env.git
else
    cd formuladb-env && git pull
fi
