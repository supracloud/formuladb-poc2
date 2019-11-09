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
