TENANT_NAME=$1
if [ -z "$TENANT_NAME" ]; then echo "please supply tenant name"; exit 1; fi

export FRMDB_TOOLS_DIR=`dirname $0`
export GOOGLE_APPLICATION_CREDENTIALS=$FRMDB_TOOLS_DIR/FormulaDB-storage-full.json

# -------------------------------------------------------------------------
# First dependency: k8s
# -------------------------------------------------------------------------

if ! k3d get-kubeconfig &>/dev/null; then
    . deploy-k3s.sh
fi
while ! k3d get-kubeconfig 2>/dev/null; do echo "waiting for k8s ..."; sleep 1; done;

# -------------------------------------------------------------------------
# Second dependency: obj storage
# -------------------------------------------------------------------------

# node $FRMDB_TOOLS_DIR/gcloud.js 'createBucketIfNotExists("'$TENANT_NAME'")'

ASSETS=`git ls-files apps/hotel-booking/ | sed -e 's!apps/!!'` node $FRMDB_TOOLS_DIR/gcloud.js \
    'uploadAssets("'$TENANT_NAME'")'
