FRMDB_ENV_NAME=$1
if [ -z "$FRMDB_ENV_NAME" ]; then echo "Usage: init-app.sh FRMDB_ENV_NAME FRMDB_TENANT_NAME FRMDB_APP_NAME"; exit 1; fi
FRMDB_TENANT_NAME=$2
if [ -z "$FRMDB_TENANT_NAME" ]; then echo "Usage: init-app.sh FRMDB_ENV_NAME FRMDB_TENANT_NAME FRMDB_APP_NAME"; exit 1; fi
FRMDB_APP_NAME=$3
if [ -z "$FRMDB_APP_NAME" ]; then echo "Usage: init-app.sh FRMDB_ENV_NAME FRMDB_TENANT_NAME FRMDB_APP_NAME"; exit 1; fi

export BASEDIR=`dirname $0`

export GIT_SSH_COMMAND="ssh -i ${BASEDIR}/../ssh/frmdb.id_rsa"
mkdir -p ${FRMDB_TENANT_NAME}
git clone --branch "${FRMDB_ENV_NAME}" --single-branch \
    git@gitlab.com:${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}.git ${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}
git clone --branch "${FRMDB_ENV_NAME}" --single-branch \
    git@gitlab.com:${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}.git ${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}----db
git clone --branch "${FRMDB_ENV_NAME}" --single-branch \
    git@gitlab.com:${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}.git ${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}----obj

# mkdir -p formuladb-themes
# THEME_NAME=`cat ${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}/app.yaml | grep theme_name | cut -d ':' -f2`
# git clone --branch "${FRMDB_ENV_NAME}" --single-branch \
#     git@gitlab.com:formuladb-themes/${THEME_NAME}.git formuladb-themes/${THEME_NAME}
