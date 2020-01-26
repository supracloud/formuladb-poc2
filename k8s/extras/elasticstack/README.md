# Elastic Stack
```sh

kubectl create secret generic es-auth --namespace monitoring --from-file k8s/extras/elasticstack/auth

kubectl create namespace monitoring

kubectl apply -f k8s/extras/elasticstack/elasticsearch-certificate-issuer.yaml

helm repo add elastic https://helm.elastic.co

helm install --namespace monitoring --name elasticsearch-masters elastic/elasticsearch -f k8s/extras/elasticstack/elasticsearch-master-values.yaml

helm install --namespace monitoring --name elasticsearch-data elastic/elasticsearch -f k8s/extras/elasticstack/elasticsearch-data-values.yaml

kubectl apply -f k8s/extras/elasticstack/kibana-certificate-issuer.yaml

helm install --namespace monitoring --name kibana elastic/kibana -f k8s/extras/elasticstack/kibana-values.yaml
```

# APM Server
```sh

kubectl apply -f k8s/extras/elasticstack/apm-server-certificate-issuer.yaml

helm install --namespace monitoring --name apm-server -f k8s/extras/elasticstack/apm-server-values.yaml stable/apm-server
```

## Metricbeat
`kubectl apply -f k8s/extras/elasticstack/metricbeat-kubernetes.yaml`

## Filebeat
```sh
# for gitlab and monitoring
kubectl apply -n monitoring -f k8s/extras/elasticstack/filebeat-kubernetes.yaml
# for formuladb apps 
# with info from https://gist.github.com/tkuther/b432827283f360293a87b5be49594f91
kubectl apply -n kube-system -f k8s/extras/elasticstack/filebeat-kubernetes-remote-cluster.yaml
# Kibana visualizations inspired from here
# https://sysadmins.co.za/setup-kibana-dashboards-for-nginx-log-analysis/

# Import index pattern, analytics dashboard and analytics visualizations from json file.
```

## Heartbeat
`kubectl apply -n monitoring -f k8s/extras/elasticstack/heartbeat-kubernetes.yaml`

# Kube-state-metrics
`kubectl apply -f k8s/extras/elasticstack/kube-state-metrics.yaml`
