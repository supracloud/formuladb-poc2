```sh
# On gitlab and monitoring GKE
helm install --name nginx-ingress stable/nginx-ingress --set rbac.create=true --set controller.publishService.enabled=true --set controller.kind=DaemonSet --set tcp.22="gitlab/gitlab-gitlab-shell:22"
```

```sh
# On formuladb prod gke
helm install --name nginx-ingress stable/nginx-ingress --set rbac.create=true --set controller.publishService.enabled=true --set controller.kind=DaemonSet
# This is to get the source IP in the nginx ingress controller
# see https://kubernetes.io/docs/tutorials/services/source-ip/#source-ip-for-services-with-type-loadbalancer
kubectl patch svc nginx-ingress-controller -p '{"spec":{"externalTrafficPolicy":"Local"}}'
```


https://github.com/kubernetes/kubernetes/issues/65387
https://groups.google.com/forum/#!topic/kubernetes-users/HOaGQD4J8j0
https://stackoverflow.com/questions/53253380/gke-nodes-cant-reach-external-ip-hosted-on-the-same-gke-cluster
