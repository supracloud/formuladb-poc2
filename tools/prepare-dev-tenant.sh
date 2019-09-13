TENANT_NAME=$1
if [ -z "$TENANT_NAME" ]; then echo "please supply tenant name"; exit 1; fi

export FRMDB_TOOLS_DIR=`dirname $0`

# -------------------------------------------------------------------------
# First dependency: k8s
# -------------------------------------------------------------------------

if ! k3d get-kubeconfig &>/dev/null
    . deploy-k3s.sh
fi
while ! k3d get-kubeconfig 2>/dev/null; do echo "waiting for k8s ..."; sleep 1; done;

# -------------------------------------------------------------------------
# Second dependency: obj storage
# -------------------------------------------------------------------------

node $FRMDB_TOOLS_DIR/gcloud.js

# -------------------------------------------------------------------------
# Third dependency: gitlab
# -------------------------------------------------------------------------

##TODO
# curl -v --request PUT --header 'PRIVATE-TOKEN: T8fpbohTXHdsE9yVsL1s' --header "Content-Type: application/json" \
#     --data '{"name": "'$TENANT_NAME'", "path": "'$TENANT_NAME'", "visibility": "private"}' \
#     'https://gitlab.com/api/v4/groups'


