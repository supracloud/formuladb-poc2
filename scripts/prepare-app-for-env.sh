FRMDB_ENV_NAME=$1
if [ -z "$FRMDB_ENV_NAME" ]; then echo "Usage: init-app.sh FRMDB_ENV_NAME FRMDB_TENANT_NAME FRMDB_APP_NAME"; exit 1; fi
FRMDB_TENANT_NAME=$2
if [ -z "$FRMDB_TENANT_NAME" ]; then echo "Usage: init-app.sh FRMDB_ENV_NAME FRMDB_TENANT_NAME FRMDB_APP_NAME"; exit 1; fi
FRMDB_APP_NAME=$3
if [ -z "$FRMDB_APP_NAME" ]; then echo "Usage: init-app.sh FRMDB_ENV_NAME FRMDB_TENANT_NAME FRMDB_APP_NAME"; exit 1; fi

export BASEDIR=`dirname $0`

export GIT_SSH_COMMAND="ssh -i ${BASEDIR}/../ssh/frmdb.id_rsa"
mkdir -p ${FRMDB_TENANT_NAME}

if git ls-remote --heads git@gitlab.com:${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}.git "${FRMDB_TENANT_NAME}" | grep "${FRMDB_TENANT_NAME}"; then
    echo "app ${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME} already exists for this env ${FRMDB_TENANT_NAME}";
    exit 0
fi

git clone --branch master --single-branch \
    git@gitlab.com:${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}.git ${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}
${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}
git checkout -b "${FRMDB_TENANT_NAME}"
git push
cd -

git clone --branch master --single-branch \
    git@gitlab.com:${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}----db.git ${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}----db
${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}----db
git checkout -b "${FRMDB_TENANT_NAME}"
git push
cd -

git clone --branch master --single-branch \
    git@gitlab.com:${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}----obj.git ${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}----obj
cd ${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}----obj
git checkout -b "${FRMDB_TENANT_NAME}"
git push
cd -

mkdir -p formuladb-themes
THEME_NAME=`cat ${FRMDB_TENANT_NAME}/${FRMDB_APP_NAME}/app.yaml | grep theme_name | cut -d ':' -f2`
if git ls-remote --heads git@gitlab.com:formuladb-themes/${THEME_NAME}.git "${FRMDB_TENANT_NAME}" | grep "${FRMDB_TENANT_NAME}"; then
    echo "theme ${THEME_NAME} already exists for this env ${FRMDB_TENANT_NAME}";
    exit 0
fi
if [[ -n "$THEME_NAME" ]]; then
    git clone --branch master --single-branch \
        git@gitlab.com:formuladb-themes/${THEME_NAME}.git formuladb-themes/${THEME_NAME}
    cd formuladb-themes/${THEME_NAME}
    git checkout -b "${FRMDB_TENANT_NAME}"
    git push
    cd -
fi
