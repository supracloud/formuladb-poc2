set -x

handleErr () {
    errcode=$?
    set +x
    echo "ERR on line ${BASH_LINENO[0]}: $BASH_COMMAND RETURNED $errcode"
    echo exit $errcode
}
trap handleErr ERR

#WARNING: This was only tested under WSL.
#Reqs: k3d, kubectl, skaffold, kustomize (because skaffold cannot yet use kubectl apply -k)

hash kubectl &>/dev/null || { 
  curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/amd64/kubectl
  chmod +x ./kubectl
  sudo mv ./kubectl /usr/local/bin/kubectl
}
hash kubectl &>/dev/null || { echo "kubectl not found! See https://kubernetes.io/docs/tasks/tools/install-kubectl/"; exit 1; }

hash k3d &>/dev/null || { 
  sudo curl -s https://raw.githubusercontent.com/rancher/k3d/master/install.sh | bash
}
hash k3d &>/dev/null || { echo "k3d not found! See https://github.com/rancher/k3d/"; exit $ERRCODE; }

hash skaffold &>/dev/null || {
  curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64
  chmod +x skaffold
  sudo mv skaffold /usr/local/bin
}
hash skaffold &>/dev/null || { echo "skaffold not found! See https://skaffold.dev/docs/getting-started/#installing-skaffold"; exit $ERRCODE; }

hash kustomize &>/dev/null || { 
  curl -s https://api.github.com/repos/kubernetes-sigs/kustomize/releases/latest |\
  grep browser_download |\
  grep linux |\
  cut -d '"' -f 4 |\
  xargs curl -O -L
  mv kustomize_*_linux_amd64 kustomize
  chmod u+x ./kustomize
  sudo mv ./kustomize /usr/local/bin/
}
hash kustomize &>/dev/null || { echo "kustomize not found! See https://github.com/kubernetes-sigs/kustomize/blob/master/docs/INSTALL.md"; exit 1; }


[ -f "$HOME/.docker/config.json" ] || { echo "Not logged in to docker registry. Run docker login registry.gitlab.com"; exit $ERRCODE; }

# To completely erase the dev environment execute: k3d delete
if ! k3d get-kubeconfig &>/dev/null
then
  k3d create --api-port 6550 # add --publish 80:80 --publish 443:443 to access the Ingress that exposes the LB
  while ! k3d get-kubeconfig --name='k3s-default' 2> /dev/null
  do
    sleep 5
  done

  export KUBECONFIG="$(k3d get-kubeconfig --name='k3s-default')"

  while ! kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/master/deploy/local-path-storage.yaml 2> /dev/null
  do
    sleep 5
  done

  while ! kubectl patch storageclass local-path -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
  do
    sleep 5
  done

  while ! kubectl create secret generic regcred --from-file=.dockerconfigjson=$HOME/.docker/config.json --type=kubernetes.io/dockerconfigjson
  do
    sleep 5
  done
else
  export KUBECONFIG="$(k3d get-kubeconfig --name='k3s-default')"
fi
