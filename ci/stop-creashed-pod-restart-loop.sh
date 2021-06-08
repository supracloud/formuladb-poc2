set -ex 

envName=$1
if [ -z "$envName" ]; then 
    echo "usage: deploy-from-local-dev.sh envName"
    exit 1;
fi

export KUBECONFIG=k8s/production-kube-config.conf
kubectl -n "${envName}" patch sts be -p "apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: be
spec:
  template:
    spec:
      containers:
      - name: be
        command: ['sh', '-c', 'sleep 1000000']
"
