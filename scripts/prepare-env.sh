FRMDB_ENV_NAME="`git branch|grep '^*'|cut -d ' ' -f2`"
export BASEDIR=`dirname $0`
export ORIGDIR=$PWD
export GIT_SSH_COMMAND="ssh -i /mnt/d/code/metawiz/febe/ssh/frmdb.id_rsa"

trap err ERR

function err() {
    echo "ERR on line ${BASH_LINENO[0]}: $BASH_COMMAND"
    cd "${ORIGDIR}"
}

# -------------------------------------------------------------------------
# git
# -------------------------------------------------------------------------
if [ ! -d "formuladb-env" ]; then
    git clone --jobs 5 --branch master --single-branch --depth 1 --recursive --shallow-submodules \
        git@gitlab.com:metawiz/formuladb-env.git
fi

cd formuladb-env
if [[ "`git branch|grep '^*'|cut -d ' ' -f2`" == "${FRMDB_ENV_NAME}" ]]; then
    echo "formuladb-env already at the right branch"
else
    git checkout -b "${FRMDB_ENV_NAME}"
    git submodule foreach git checkout -b "${FRMDB_ENV_NAME}"
    git submodule foreach git push git push --set-upstream origin "${FRMDB_ENV_NAME}"
    git push --set-upstream origin "${FRMDB_ENV_NAME}"
fi

# -------------------------------------------------------------------------
# k8s
# -------------------------------------------------------------------------

cd ${ORIGDIR}/${BASEDIR}/..
export KUBECONFIG=$BASEDIR/../k8s/production-kube-config.conf

if ! kubectl get namespaces|grep "\b${FRMDB_ENV_NAME}\b"; then 
    kubectl create namespace "${FRMDB_ENV_NAME}" 
fi

if ! kubectl -n "${FRMDB_ENV_NAME}" get secrets | grep "\bregcred\b"; then 
    kubectl -n "${FRMDB_ENV_NAME}" create secret generic regcred --from-file=.dockerconfigjson=${ORIGDIR}/${BASEDIR}/../ci/docker-config.json --type=kubernetes.io/dockerconfigjson; 
else
    true
fi



cd "${ORIGDIR}"
