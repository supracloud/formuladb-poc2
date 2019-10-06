FRMDB_ENV_NAME=$1
if [ -z "$FRMDB_ENV_NAME" ]; then echo "Usage: init-app.sh FRMDB_ENV_NAME FRMDB_APP_NAME"; exit 1; fi

export BASEDIR=`dirname $0`
export GIT_SSH_COMMAND="ssh -i ${BASEDIR}/../ssh/frmdb.id_rsa"

cd /wwwroot/git
if [ ! -d "formuladb-apps" ]; then
    git clone --jobs 10 --branch "${FRMDB_ENV_NAME}" --single-branch --depth 1 \
        git@gitlab.com:metawiz/formuladb-apps.git formuladb-apps
else
    cd formuladb-apps
    git pull
fi
