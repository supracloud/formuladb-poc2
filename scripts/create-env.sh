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
if [ -n "$BUILD_DEVELOPMENT" -o -n "$BUILD_CI" ]; then
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
done

#     try {
#         const res = await fetch(``)
#         console.log(`https://${newEnvName}.formuladb.io returned ${res.status}`);
#         if (200 === res.status) {
#             console.log(`Env ready. Data provisioning ...`);
# kubectl -n ${newEnvName} exec service/be -- env DISABLE_TEST_USERS=true ADMIN_USER_EMAIL=${email} ADMIN_USER_PASS=${password} node /dist-be/frmdb-be-load-test-data.js
#              maxBuffer: 10240 * 1000});
            
#             console.log(`Done!`);
#             return;
#         }
#         console.log(`Fetch returned with ${res.status}. Retrying ...`);
#     } catch (error) {
#         console.log(`Fetch failed with error ${error}. Retrying ...`);
#     }
#     await delay(5000);
# }

# throw "Env not ready. Giving up ...";
