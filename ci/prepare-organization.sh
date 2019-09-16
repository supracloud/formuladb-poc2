ORGANIZ_NAME=$1
if [ -z "$ORGANIZ_NAME" ]; then echo "Usage: create_tenant.sh ORGANIZ_NAME"; exit 1; fi

export BASEDIR=`dirname $0`
export GOOGLE_APPLICATION_CREDENTIALS=$BASEDIR/FormulaDB-storage-full.json
export KUBECONFIG=$BASEDIR/../k8s/production-kube-config.conf

# -------------------------------------------------------------------------
# External dependency: obj storage
# -------------------------------------------------------------------------

hash gsutil || {
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
    sudo apt-get install -y apt-transport-https ca-certificates
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
    sudo apt-get update && sudo apt-get install -y google-cloud-sdk
    gcloud auth activate-service-account --key-file=tools/FormulaDB-storage-full.json
}

if ! gcloud auth list|grep formuladb-static-assets; then
    gcloud auth activate-service-account --key-file $BASEDIR/FormulaDB-storage-full.json
fi

# node $BASEDIR/gcloud.js 'createBucketIfNotExists("'$ORGANIZ_NAME'")'

# ASSETS="`git ls-files apps/hotel-booking/`" node $BASEDIR/gcloud.js \
#     'uploadAssets("'$ORGANIZ_NAME'")'

gsutil -m rsync -r apps/formuladb-internal/formuladb.io gs://formuladb-static-assets/$ORGANIZ_NAME/formuladb-internal/formuladb.io
gsutil -m rsync -r apps/formuladb-internal/formuladb.io gs://formuladb-static-assets/$ORGANIZ_NAME/ #TODO: remove this when nginx rule is working
gsutil -m rsync -r apps/formuladb-examples/hotel-booking gs://formuladb-static-assets/$ORGANIZ_NAME/formuladb-examples/hotel-booking

gsutil -m rsync -r vvvebjs gs://formuladb-static-assets/$ORGANIZ_NAME/formuladb-editor
gsutil -m rsync -x ".*.js.map$" -r dist-fe gs://formuladb-static-assets/$ORGANIZ_NAME/formuladb

curl -L -O https://github.com/elastic/apm-agent-rum-js/releases/latest/download/elastic-apm-rum.umd.min.js
gsutil -m rsync elastic-apm-rum.umd.min.js gs://formuladb-static-assets/$ORGANIZ_NAME/elastic-apm-rum.umd.min.js

# -------------------------------------------------------------------------
# External dependency: Elastic stack
# -------------------------------------------------------------------------

# nothing to do for now

# -------------------------------------------------------------------------
# External dependency: k8s
# -------------------------------------------------------------------------

perl -p -i -e 's!value.*#TBD_ENV_NAME!value: '$ORGANIZ_NAME' #TBD_ENV_NAME!' k8s/overlays/development/patches/lb-deployment.yaml
perl -p -i -e 's!value.*#TBD_ENV_NAME!value: '$ORGANIZ_NAME' #TBD_ENV_NAME!' k8s/overlays/development/patches/be-deployment.yaml

if ! kubectl get namespaces|grep "\b${ORGANIZ_NAME}\b"; then 
    kubectl create namespace "${ORGANIZ_NAME}" 
fi

if ! kubectl -n "${ORGANIZ_NAME}" get secrets | grep "\bregcred\b"; then 
    kubectl -n "${ORGANIZ_NAME}" create secret generic regcred --from-file=.dockerconfigjson=${BASEDIR}/docker-config.json --type=kubernetes.io/dockerconfigjson; 
fi
