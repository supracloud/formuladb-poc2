set -ex

NAMESPACE=$1
if [ -z "$NAMESPACE" ]; then
    echo "Usage: generate-onprem-deploy.sh NAMESPACE DEPLOY_DIR"
    exit 1
fi


skaffold -n orbicobeautyro render -p k3s \
    --label skaffold.dev/run-id="static" \
    --label app.kubernetes.io/managed-by="skaffold" \
    --output=tmp.yaml
