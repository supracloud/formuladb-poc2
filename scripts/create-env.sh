set -ex

newEnvName=$1

if kubectl get namespace ${newEnvName}; then
    echo "env ${newEnvName} already exists, exiting..."
    exit 1
fi

mkdir -p env_workspace/${newEnvName} && cp -r k8s skaffold.yaml env_workspace/${newEnvName}
cd env_workspace/${newEnvName}
perl -p -i -e "s!namespace.*#TBD_ENV_NAME!namespace: ${newEnvName} #TBD_ENV_NAME!" k8s/base/kustomization.yaml
            
bash /scripts/prepare-env.sh "${newEnvName}"
            
images=`kubectl get deployment be -n$FRMDB_ENV_NAME -o=jsonpath='{.spec.template.spec.containers[0].image}'`
echo "GKE with image ${images} ..."
skaffoldProfile=client
if [ -n "$BUILD_DEVELOPMENT" ]; then
    skaffoldProfile=localci
elif [ -n "$BUILD_CI"]; then
    skaffoldProfile=ci
fi
skaffold deploy -n ${newEnvName} -p ${skaffoldProfile} --images=${images}
            
protocol=https
domain=formuladb.io
if [ -n "$BUILD_DEVELOPMENT" ]; then
    protocol=http
    domain=frmdb.localhost
elif [ -n "$BUILD_CI"]; then
    protocol=http
fi

for step in `seq 0 24`; do
    if curl ${protocol}://${newEnvName}.${domain}; then
        echo "Env ready. Data provisioning ..."
    fi
    echo "waiting for containers to start"
    sleep 4
done
