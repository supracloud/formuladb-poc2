```sh
# On gitlab and monitoring GKE
helm install --name nginx-ingress stable/nginx-ingress --set rbac.create=true --set controller.publishService.enabled=true --set controller.kind=DaemonSet --set tcp.22="gitlab/gitlab-gitlab-shell:22"
```

```sh
# On formuladb prod gke
# - adding ingress namespace and name for analytics
helm upgrade --install nginx-ingress stable/nginx-ingress --set rbac.create=true \
 --set controller.publishService.enabled=true --set controller.kind=DaemonSet \
 --set controller.config.log-format-upstream='$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent" $request_length $request_time [$proxy_upstream_name] [$proxy_alternative_upstream_name] $upstream_addr $upstream_response_length $upstream_response_time $upstream_status $req_id $namespace $ingress_name $service_name $service_port'
# This is to get the source IP in the nginx ingress controller
# see https://kubernetes.io/docs/tutorials/services/source-ip/#source-ip-for-services-with-type-loadbalancer
kubectl patch svc nginx-ingress-controller -p '{"spec":{"externalTrafficPolicy":"Local"}}'
```


https://github.com/kubernetes/kubernetes/issues/65387
https://groups.google.com/forum/#!topic/kubernetes-users/HOaGQD4J8j0
https://stackoverflow.com/questions/53253380/gke-nodes-cant-reach-external-ip-hosted-on-the-same-gke-cluster
