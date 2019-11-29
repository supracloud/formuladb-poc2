# Update ingress for ssh access
https://docs.gitlab.com/charts/advanced/external-nginx/#helm-deployment
```sh
--set tcp.22="gitlab/gitlab-gitlab-shell:22"
```

# Certificates handling 

https://docs.gitlab.com/charts/installation/tls.html#external-cert-manager-and-internal-issuer  --set certmanager.install=false \
  --set certmanager-issuer.email=you@example.com \
  --set global.ingress.annotations."kubernetes\.io/tls-acme"=true

# SMTP email
kubectl create secret generic smtp-password -n gitlab --from-literal=password=fk3bwuqazZ9y5U3

# Install git lab from chart

```sh
helm repo add gitlab https://charts.gitlab.io/
helm repo update
helm upgrade --install gitlab gitlab/gitlab \
  --namespace gitlab \
  --set certmanager.install=false \
  --set certmanager-issuer.email=laurentiu.soica@formuladb.io \
  --set global.ingress.annotations."kubernetes\.io/tls-acme"=true \
  --set global.hosts.domain=formuladb.io \
  --timeout 600 \
  --set nginx-ingress.enabled=false \
  --set global.ingress.class=nginx \
  --set global.smtp.enabled=true \
  --set global.email.from=laurentiu.soica@formuladb.io \
  --set global.email.reply_to=laurentiu.soica@formuladb.io \
  --set global.smtp.address=smtp.gmail.com \
  --set global.smtp.domain=smtp.gmail.com \
  --set global.smtp.authentication=login \
  --set global.smtp.password.secret=smtp-password \
  --set global.smtp.port=587 \
  --set global.smtp.tls=false \
  --set global.smtp.starttls_auto=true \
  --set global.smtp.user_name=laurentiu.soica@formuladb.io \
  --set prometheus.install=false \
  --set gitlab-runner.install=true \
  --set registry.hpa.minReplicas=1 \
  --set gitlab.gitlab-exporter.enabled=false


```

# Initial login

```sh
kubectl get secret <name>-gitlab-initial-root-password -ojsonpath='{.data.password}' | base64 --decode ; echo
```
