set -xe

if [[ -z ${FRMDB_ENV_NAME+x} ]]; then
    FRMDB_ENV_NAME="`git branch|grep '^*'|cut -d ' ' -f2`"
fi

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")

export ORIGDIR=$PWD
export GIT_SSH_COMMAND="ssh -i $SCRIPTPATH/../ssh/frmdb.id_rsa"
echo $SCRIPTPATH
echo $ORIGDIR
trap err ERR

function err() {
    echo "ERR on line ${BASH_LINENO[0]}: $BASH_COMMAND"
    cd "${ORIGDIR}"
}

# -------------------------------------------------------------------------
# git
# -------------------------------------------------------------------------
if [ ! -d "formuladb-env" ]; then
    BASE_BRANCH="${FRMDB_APPS_BASE_BRANCH}"
    if [[ "`git ls-remote --heads git@gitlab.com:metawiz/formuladb-env.git \"${FRMDB_ENV_NAME}\"| wc -l`" -gt 0 ]]; then
        BASE_BRANCH="${FRMDB_ENV_NAME}"
    fi
    git clone --jobs 10 --branch "${BASE_BRANCH}" --single-branch --depth 1 \
        git@gitlab.com:metawiz/formuladb-env.git
fi

for submodule in formuladb-icons formuladb-themes formuladb-static formuladb-apps; do
    cd $BASEDIR
    if [ ! -d "${submodule}" ]; then
        git clone --jobs 10 --branch master --single-branch --depth 1 \
            git@gitlab.com:metawiz/${submodule}.git
    fi

    cd ${submodule}
    if [[ "`git branch|grep '^*'|cut -d ' ' -f2`" == "${FRMDB_ENV_NAME}" ]]; then
        echo "${submodule} already at the right branch ${FRMDB_ENV_NAME}"
    else
        git checkout -b "${FRMDB_ENV_NAME}"
        git push --set-upstream origin "${FRMDB_ENV_NAME}"
    fi
done

# -------------------------------------------------------------------------
# k8s
# -------------------------------------------------------------------------

cd ${SCRIPTPATH}/..
export KUBECONFIG=${SCRIPTPATH}/../k8s/production-kube-config.conf

if ! kubectl get namespaces|grep "\b${FRMDB_ENV_NAME}\b"; then 
    kubectl create namespace "${FRMDB_ENV_NAME}" 
fi

if ! kubectl -n "${FRMDB_ENV_NAME}" get secrets | grep "\bregcred\b"; then 
    kubectl get secret regcred -n production -o yaml | sed "s/namespace: production/namespace: ${FRMDB_ENV_NAME}/" | kubectl create -f -
else
    true
fi

cd "${ORIGDIR}"
