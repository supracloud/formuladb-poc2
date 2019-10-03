FRMDB_ENV_NAME="e`git branch|grep '^*'|cut -d ' ' -f2`"

export BASEDIR=`dirname $0`

# -------------------------------------------------------------------------
# git
# -------------------------------------------------------------------------
bash ${BASEDIR}/prepare-app-for-env.sh "${FRMDB_ENV_NAME}" formuladb-internal-apps formuladb.io
bash ${BASEDIR}/prepare-app-for-env.sh "${FRMDB_ENV_NAME}" formuladb-apps Hotel_Booking

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