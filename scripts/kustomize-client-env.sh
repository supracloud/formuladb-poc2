set -ex

newEnvName=$1
if [ -z "$newEnvName" ]; then 
    echo "usage: kustomize-client-env.sh newEnvName adminEmail adminHashedPasswd"
    exit 1;
fi

perl -p -i -e "s!namespace.*#TBD_ENV_NAME!namespace: ${newEnvName} #TBD_ENV_NAME!" k8s/base/kustomization.yaml
perl -p -i -e "s!DEFAULT_APP_PAGE, value: .*!DEFAULT_APP_PAGE, value: users/user.html }!" k8s/overlays/client/patches/be-sts.yaml
