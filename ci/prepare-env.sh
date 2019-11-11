if [[ -z "${FRMDB_ENV_NAME}" ]]; then
    FRMDB_ENV_NAME="`git branch|grep '^*'|cut -d ' ' -f2`"
fi

export BASEDIR=`dirname $0`
# export KUBECONFIG=$BASEDIR/../k8s/production-kube-config.conf

# -------------------------------------------------------------------------
# Tooling / Clients
# -------------------------------------------------------------------------
hash kubectl &>/dev/null || { 
  curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/amd64/kubectl
  chmod +x ./kubectl
  sudo mv ./kubectl /usr/local/bin/kubectl
}
hash kubectl &>/dev/null || { echo "kubectl not found! See https://kubernetes.io/docs/tasks/tools/install-kubectl/"; exit 1; }

hash skaffold &>/dev/null || {
  curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64
  chmod +x skaffold
  sudo mv skaffold /usr/local/bin
}
hash skaffold &>/dev/null || { echo "skaffold not found! See https://skaffold.dev/docs/getting-started/#installing-skaffold"; exit $ERRCODE; }

hash kustomize &>/dev/null || { 
  curl -s https://api.github.com/repos/kubernetes-sigs/kustomize/releases |\
    grep browser_download |\
    grep linux |\
    cut -d '"' -f 4 |\
    grep /kustomize/v |\
    sort | tail -n 1 |\
    xargs curl -O -L
  mv kustomize_*_linux_amd64 kustomize
  chmod u+x ./kustomize
  sudo mv ./kustomize /usr/local/bin/
}
hash kustomize &>/dev/null || { echo "kustomize not found! See https://github.com/kubernetes-sigs/kustomize/blob/master/docs/INSTALL.md"; exit 1; }

hash gsutil || {
    if [ -f /etc/lsb-release ]; then
        echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
        sudo apt-get install -y apt-transport-https ca-certificates
        curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
        sudo apt-get update && sudo apt-get install -y google-cloud-sdk
        gcloud auth activate-service-account --key-file=tools/FormulaDB-storage-full.json
    else
        #not really tested
        curl https://sdk.cloud.google.com | bash
        gcloud auth activate-service-account --key-file=tools/FormulaDB-storage-full.json
    fi
}

# -------------------------------------------------------------------------
# External dependency: git
# -------------------------------------------------------------------------
# if uname -a | grep 'Linux.*Microsoft'; then echo asfdasd; fi

# -------------------------------------------------------------------------
# External dependency: obj storage
# -------------------------------------------------------------------------

if ! gcloud auth list|grep formuladb-static-assets; then
    gcloud auth activate-service-account --key-file $BASEDIR/FormulaDB-storage-full.json
fi

### using a single central bucket for now...
# node $BASEDIR/gcloud.js 'createBucketIfNotExists("'$FRMDB_ENV_NAME'")'

# -------------------------------------------------------------------------
# k8s
# -------------------------------------------------------------------------
if [ -z "$NO_K8S" ]; then
  echo "Preparing k8s deployment for namespace ${FRMDB_ENV_NAME}."
  perl -p -i -e 's!value.*#TBD_ENV_NAME!value: '$FRMDB_ENV_NAME' #TBD_ENV_NAME!' k8s/overlays/development/patches/be-deployment.yaml

  if ! uname -a | grep 'Linux.*Microsoft' >/dev/null; then 
    perl -p -i -e 's![-\w\d.]+.formuladb.io #TBD_ENV_NAME.formuladb.io!'$FRMDB_ENV_NAME'.formuladb.io #TBD_ENV_NAME.formuladb.io!' k8s/overlays/development/resources/ingress.yaml
    cat k8s/overlays/development/resources/ingress.yaml
  fi

fi
