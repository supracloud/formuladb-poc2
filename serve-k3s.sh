set -x

handleErr () {
    errcode=$?
    set +x
    echo "ERR on line ${BASH_LINENO[0]}: $BASH_COMMAND RETURNED $errcode"
    echo exit $errcode
}
trap handleErr ERR

#WARNING: This was only tested under WSL.
#Reqs: k3d, kubectl, skaffold

[[ hash kubectl &> /dev/null ]] || { echo "kubectl not found! See https://kubernetes.io/docs/tasks/tools/install-kubectl/"; exit $ERRCODE; }
[[ hash k3d &> /dev/null ]] || { echo "k3d not found! See https://github.com/rancher/k3d/"; exit $ERRCODE; }
[[ hash skaffold &> /dev/null ]] || { echo "skaffold not found! See https://skaffold.dev/docs/getting-started/#installing-skaffold"; exit $ERRCODE; }

# To completely erase the dev environment execute: k3d delete
if ! k3d get-kubeconfig &>/dev/null
then
  k3d create # --publish 8084 --publish 80 --publish 443 --publish 9231 --publish 5432
  while ! k3d get-kubeconfig --name='k3s-default' 2> /dev/null
  do
    sleep 5
  done

  export KUBECONFIG="$(k3d get-kubeconfig --name='k3s-default')"

  while ! kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/master/deploy/local-path-storage.yaml 2> /dev/null
  do
    sleep 5
  done

  kubectl patch storageclass local-path -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'

  kubectl create secret generic regcred --from-file=.dockerconfigjson=$HOME/.docker/config.json --type=kubernetes.io/dockerconfigjson
else
  export KUBECONFIG="$(k3d get-kubeconfig --name='k3s-default')"
fi

mkdir -p live-server-wwwroot
cd live-server-wwwroot #optimize speed
../node_modules/.bin/live-server --wait=200 --port=8081 -V --no-browser \
    --mount=/formuladb-editor/:../vvvebjs/ \
    --mount=/formuladb/:./../dist-fe/ \
    --mount=/frmdb-apps/:../../../frmdb-apps/ \
    --mount=/frmdb-apps/hotel-booking:../../../frmdb-themes/royal-master \
    --mount=/frmdb-apps/inventory:../../../frmdb-themes/startbootstrap-sb-admin-2 \
    --mount=/:../portal/public \
    --proxy=/formuladb-api:http://localhost:8084/formuladb-api \
    --proxy=/:http://localhost:8084/ \
