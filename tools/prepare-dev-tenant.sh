TENANT_NAME=$CI_COMMIT_SHA
if [ -z "$TENANT_NAME" ]; then 
    TENANT_NAME=`git rev-parse HEAD`
fi

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

hash gsutil || {
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
    sudo apt-get install -y apt-transport-https ca-certificates
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
    sudo apt-get update && sudo apt-get install -y google-cloud-sdk
    gcloud auth activate-service-account --key-file=tools/FormulaDB-storage-full.json
}

# node $FRMDB_TOOLS_DIR/gcloud.js 'createBucketIfNotExists("'$TENANT_NAME'")'

# ASSETS="`git ls-files apps/hotel-booking/`" node $FRMDB_TOOLS_DIR/gcloud.js \
#     'uploadAssets("'$TENANT_NAME'")'

gsutil -m rsync -r apps/hotel-booking gs://formuladb-static-assets/$TENANT_NAME/production/hotel-booking
perl -p -i -e 's/value.*#TBD_CI_COMMIT_SHA/value: '$TENANT_NAME' #TBD_CI_COMMIT_SHA/' k8s/overlays/development/patches/lb-deployment.yaml