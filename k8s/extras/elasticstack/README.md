# APM Server
```sh
kubectl create secret generic es-auth --from-file auth
helm repo add elastic https://helm.elastic.co
helm install --name elasticsearch-masters elastic/elasticsearch -f elasticsearch-master-values.yaml
helm install --name elasticsearch-data elastic/elasticsearch -f elasticsearch-data-values.yaml
helm install --name kibana elastic/kibana -f kibana-values.yaml
helm install --name apm-server -f apm-server.yaml stable/apm-server
```

## TODO
* Add annotations for cert manager, kibana, elastic and apm server ingress and in the end remove the formuladb-online certificate
* namespace elastic stuff, not default

## Metricbeat
`kubectl apply -f k8s/extras/elasticstack/metricbeat-kubernetes.yaml`

## Filebeat
`kubectl apply -f k8s/extras/elasticstack/filebeat-kubernetes.yaml`

## Heartbeat
`helm install --name heartbeat -f k8s/extras/elasticstack/heartbeat-kubernetes.yaml stable/heartbeat`

# Kube-state-metrics
`kubectl apply -f k8s/extras/elasticstack/kube-state-metrics.yaml`
