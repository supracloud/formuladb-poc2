set -xe

FRMDB_ENV_NAME="$1"
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

# -------------------------------------------------------------------------
# k8s
# -------------------------------------------------------------------------

cd ${SCRIPTPATH}/..

if ! kubectl get namespaces|grep "\b${FRMDB_ENV_NAME}\b"; then 
    kubectl create namespace "${FRMDB_ENV_NAME}" 
fi

if ! kubectl -n "${FRMDB_ENV_NAME}" get secrets | grep "\bregcred\b"; then 
    kubectl get secret regcred -n production -o yaml | sed "s/namespace: production/namespace: ${FRMDB_ENV_NAME}/" | kubectl create -f -
else
    true
fi

cd "${ORIGDIR}"
