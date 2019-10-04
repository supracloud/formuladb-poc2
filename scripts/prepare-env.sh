FRMDB_ENV_NAME="e`git branch|grep '^*'|cut -d ' ' -f2`"
export BASEDIR=`dirname $0`

trap _cleanup ERR
trap _cleanup EXIT

function _cleanup() {
    echo "ERR on line ${BASH_LINENO[0]}: $BASH_COMMAND"
    cd "${BASEDIR}"
}

# -------------------------------------------------------------------------
# git
# -------------------------------------------------------------------------
if [ ! -d "formuladb-env" ]; then
    git clone --jobs 2 --branch master --single-branch --recurse-submodules \
        git@gitlab.com:metawiz/formuladb-env.git
fi

cd formuladb-env
if [[ "`git branch|grep '^*'|cut -d ' ' -f2`" == "${FRMDB_ENV_NAME}" ]]; then
    echo "formuladb-env already at the right branch"
else
    git checkout -b "${FRMDB_ENV_NAME}"
    git submodule foreach git checkout -b "${FRMDB_ENV_NAME}"
    git submodule foreach git push
    git push
fi
cd -

# -------------------------------------------------------------------------
# k8s
# -------------------------------------------------------------------------

export KUBECONFIG=$BASEDIR/../k8s/production-kube-config.conf

if ! kubectl get namespaces|grep "\b${FRMDB_ENV_NAME}\b"; then 
    kubectl create namespace "${FRMDB_ENV_NAME}" 
fi

if ! kubectl -n "${FRMDB_ENV_NAME}" get secrets | grep "\bregcred\b"; then 
    kubectl -n "${FRMDB_ENV_NAME}" create secret generic regcred --from-file=.dockerconfigjson=${BASEDIR}/docker-config.json --type=kubernetes.io/dockerconfigjson; 
fi
