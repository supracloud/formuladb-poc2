set -ex

envName=$1

if ! kubectl get namespace ${envName}; then
    echo "env ${envName} does not exist, exiting..."
    exit 1
fi

mkdir -p env_workspace/${envName}
cd env_workspace/${envName}

echo "Deleting env branch"
mkdir tmpgit
cd tmpgit
git init
git push git@gitlab.formuladb.io:formuladb/formuladb-env.git :refs/heads/${envName}

echo "Deleting namespace ${envName}"
kubectl delete namespace ${envName}
    
echo "Deleting k8s directory copy for ${envName}"
rm -rf env_workspace/${envName} || true

echo "Deleted env ${envName}!"
