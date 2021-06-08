set -ex

envName=$1

if ! kubectl get namespace ${envName}; then
    echo "env ${envName} does not exist, exiting..."
    exit 1
fi

if [ "$envName" = "staging" -o "$envName" = "production" ]; then
    echo "env ${envName} cannot be deleted..."
    exit 2
fi

echo "Deleting env branch"
mkdir -p /tmp/tmpgit.$$
cd /tmp/tmpgit.$$
git init
git push https://gitlab.formuladb.io/formuladb/formuladb-env.git :refs/heads/${envName}
cd -
rm -rf /tmp/tmpgit.$$

echo "Deleting namespace ${envName}"
kubectl delete namespace ${envName}

echo "Deleted env ${envName}!"
