export FRMDB_TOOLS_DIR=`dirname $0`

# -------------------------------------------------------------------------
# First dependency: k8s
# -------------------------------------------------------------------------

if ! k3d get-kubeconfig &>/dev/null
    . deploy-k3s.sh
fi
while ! k3d get-kubeconfig 2>/dev/null; do echo "waiting for k8s ..."; sleep 1; done;

# -------------------------------------------------------------------------
# Second dependency: obj storage
# -------------------------------------------------------------------------

node $FRMDB_TOOLS_DIR/gcloud.js 'createBucketIfNotExists("'$TENANT_NAME'")'
