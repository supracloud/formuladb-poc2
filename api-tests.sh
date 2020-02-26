set -ex

for i in ci/api-tests/*; do
    echo "==================================================================="
    bash $i
done
