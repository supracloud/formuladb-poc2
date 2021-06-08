set -ex 

ENVNAME=$1
if [ -z "$ENVNAME" ]; then 
    echo "usage: deploy-be-from-localdev.sh ENVNAME"
    exit 1;
fi

echo "== building febe image ==="
beImage=`skaffold build -p localdev | 
    grep 'registry.formuladb.io/formuladb/febe/formuladb-be -> registry.formuladb.io/formuladb/febe/formuladb-be' |
    grep -o 'registry.formuladb.io/formuladb/febe/formuladb-be:.*-dirty'
`

echo "== pushing image $beImage ====="
docker push $beImage

echo "== deploying be ====================="
export KUBECONFIG=k8s/production-kube-config.conf
kubectl -n ${ENVNAME} patch sts be -p "apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: be
spec:
  template:
    spec:
      containers:
      - name: be
        image: ${beImage}
"
