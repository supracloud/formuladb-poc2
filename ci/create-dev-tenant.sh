ENV_NAME=$1
if [ -z "$ENV_NAME" ]; then echo "Usage: create_tenant.sh ENV_NAME"; exit 1; fi

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

# node $BASEDIR/gcloud.js 'createBucketIfNotExists("'$ENV_NAME'")'

# ASSETS="`git ls-files apps/hotel-booking/`" node $BASEDIR/gcloud.js \
#     'uploadAssets("'$ENV_NAME'")'

gsutil -m rsync -r apps/formuladb.io gs://formuladb-static-assets/$ENV_NAME/formuladb.io/portal
gsutil -m rsync -r apps/formuladb.io gs://formuladb-static-assets/$ENV_NAME/ #TODO: remove this when nginx rule is working
gsutil -m rsync -r apps/hotel-booking gs://formuladb-static-assets/$ENV_NAME/examples/hotel-booking
gsutil -m rsync -r vvvebjs gs://formuladb-static-assets/$ENV_NAME/frmdb-editor
gsutil -m rsync -x ".*.js.map$" -r dist-fe gs://formuladb-static-assets/$ENV_NAME/formuladb
perl -p -i -e 's!value.*#TBD_ENV_NAME!value: '$ENV_NAME' #TBD_ENV_NAME!' k8s/overlays/development/patches/lb-deployment.yaml
perl -p -i -e 's!value.*#TBD_ENV_NAME!value: '$ENV_NAME' #TBD_ENV_NAME!' k8s/overlays/development/patches/be-deployment.yaml

# -------------------------------------------------------------------------
# External dependency: Elastic stack
# -------------------------------------------------------------------------

# -------------------------------------------------------------------------
# External dependency: k8s
# -------------------------------------------------------------------------

if ! kubectl get namespaces|grep "\b${ENV_NAME}\b"; then 
    kubectl create namespace "${ENV_NAME}" 
fi

if ! kubectl -n "${ENV_NAME}" get secrets | grep "\bregcred\b"; then 
    kubectl -n "${ENV_NAME}" create secret generic regcred --from-file=.dockerconfigjson=${BASEDIR}/docker-config.json --type=kubernetes.io/dockerconfigjson; 
fi
