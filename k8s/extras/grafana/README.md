```sh
kubectl create namespace alerting
kubectl apply -f k8s/extras/grafana/grafana-certificate-issuer.yaml
kubectl apply -f k8s/extras/grafana/k8s-nodes-dashboard-cm.yaml
```


```sh
helm install stable/grafana -n grafana --namespace alerting --values  k8s/extras/grafana/grafana-values.yaml
```
