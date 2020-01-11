```sh
helm install --name nginx-ingress stable/nginx-ingress --set rbac.create=true --set controller.publishService.enabled=true --set tcp.22="gitlab/gitlab-gitlab-shell:22"
```

https://github.com/kubernetes/kubernetes/issues/65387
https://groups.google.com/forum/#!topic/kubernetes-users/HOaGQD4J8j0
https://stackoverflow.com/questions/53253380/gke-nodes-cant-reach-external-ip-hosted-on-the-same-gke-cluster
