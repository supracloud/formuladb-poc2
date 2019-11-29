```sh
helm install --name nginx-ingress stable/nginx-ingress --set rbac.create=true --set controller.publishService.enabled=true --set tcp.22="gitlab/gitlab-gitlab-shell:22"
```
