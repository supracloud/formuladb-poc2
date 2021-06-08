set -ex

KUBECONFIG=$1
NAMESPACE=$2
HOSTNAME=$3
if [ ! -f "$KUBECONFIG" -o -z "$NAMESPACE" -o -z "$HOSTNAME" ]; then
    echo "Usage: deploy-onprem.sh KUBECONFIG NAMESPACE HOSTNAME"
    exit 1
fi
export KUBECONFIG

if ! kubectl get namespace "$NAMESPACE"; then 
    kubectl create namespace "$NAMESPACE" 
fi
if ! kubectl -n "${NAMESPACE}" get secrets | grep "\bregcred\b"; then 
    kubectl -n "${NAMESPACE}" create secret generic regcred --from-file=.dockerconfigjson=ci/docker-config.json --type=kubernetes.io/dockerconfigjson; 
fi

# NAMESPACE=orbicobeautyro
# KUBECONFIG=git/formuladb-env/code/k8s/kubeconfig.conf
# helm upgrade --install es elastic/elasticsearch --namespace "$NAMESPACE" \
#     --set replicas=1 \
#     --set esJavaOpts="-Xmx2g -Xms2g" \
#     --set clusterHealthCheckParams="wait_for_status=yellow&timeout=1s"

# helm upgrade --install kibana elastic/kibana --namespace "$NAMESPACE" \
#     --set ingress.enabled=true \
#     --set ingress.hosts[0]=$HOSTNAME \
#     --set ingress.path=/app/kibana

# NAMESPACE=orbicobeautyro \
# KUBECONFIG=git/formuladb-env/code/k8s/kubeconfig.conf \
# helm upgrade --install filebeat elastic/filebeat --namespace "$NAMESPACE"

#### using node_exporter and prometheus from lensapp
#### helm upgrade --install metricbeat elastic/metricbeat --namespace "$NAMESPACE"
#### #kubectl exec metricbeat-tbd -- sh -c 'metricbeat setup --dashboards -E setup.kibana.host=kibana-kibana:5601'

perl -p -i -e 's!host: .*#TBD-REPLACE-WITH-ONPREM-HOSTNAME!host: '$HOSTNAME' #TBD-REPLACE-WITH-ONPREM-HOSTNAME!' k8s/overlays/k3s/resources/ingress.yaml

skaffold -n "$NAMESPACE" run -p k3s --label skaffold.dev/run-id="static" --label app.kubernetes.io/managed-by="skaffold"
