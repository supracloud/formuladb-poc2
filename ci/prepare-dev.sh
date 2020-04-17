set -xe

# for puppeteer
# sudo apt-get install libxss1

bash ci/prepare-env.sh
if [ ! -d 'tsc-out' ]; then
    npm run compile
    npm run bundle -- --watch --mode development
fi

export BASEDIR="${PWD}/`dirname $0`"
if ! kubectl get namespaces|grep production; then 
    kubectl create namespace production
    kubectl -n "${FRMDB_ENV_NAME}" create secret generic regcred --from-file=.dockerconfigjson=${BASEDIR}/docker-config.json --type=kubernetes.io/dockerconfigjson
fi

perl -p -i -e 's!path: .*#TDB_PWD_ENV_DIR!path: '${PWD/\/mnt/}'/git #TDB_PWD_ENV_DIR!' k8s/overlays/development/patches/be-sts.yaml
