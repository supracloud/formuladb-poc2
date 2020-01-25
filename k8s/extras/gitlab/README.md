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

# Create GCS service account and secret
```sh
export PROJECT_ID=$(gcloud config get-value project)
gcloud iam service-accounts create gitlab-gcs --display-name "Gitlab Cloud Storage"
gcloud projects add-iam-policy-binding --role roles/storage.admin ${PROJECT_ID} --member=serviceAccount:gitlab-gcs@${PROJECT_ID}.iam.gserviceaccount.com
gcloud iam service-accounts keys create --iam-account gitlab-gcs@${PROJECT_ID}.iam.gserviceaccount.com storage.config
kubectl create secret generic storage-config --from-file=config=storage.config
```
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
  --set gitlab.gitlab-exporter.enabled=false \
  --set gitlab.task-runner.backups.objectStorage.config.secret=storage-config \
  --set gitlab.task-runner.backups.objectStorage.config.key=config \
  --set gitlab.task-runner.backups.objectStorage.config.gcpProject=seismic-plexus-232506 \
  --set gitlab.task-runner.backups.objectStorage.backend=gcs \
  --set global.appConfig.backups.bucket=formuladb-gitlab-backup-storage \
  --set global.appConfig.backups.tmpBucket=formuladb-gitlab-tmp-storage \
  --set gitlab.task-runner.persistence.enabled=true \
  --set gitlab.task-runner.persistence.size=100Gi \
  --set gitlab.task-runner.backups.cron.persistence.enabled=true \
  --set gitlab.task-runner.backups.cron.persistence.size=100Gi \
  --set gitlab.task-runner.backups.cron.enabled=true \
  --set minio.persistence.size=1024Gi \
  --set gitlab.gitaly.persistence.size=100Gi

```

```
kubectl edit cronjob -n gitlab gitlab-task-runner-backup

Remove lines due to https://gitlab.com/gitlab-org/charts/gitlab/issues/1426

            - mountPath: /srv/gitlab/tmp
              name: task-runner-tmp
			  
          - name: task-runner-tmp
            persistentVolumeClaim:
              claimName: gitlab-task-runner-backup-tmp

``` 

TODO: add a cronjob for minio backup. gitlab charts does not support yet backup up to external object storage https://gitlab.com/gitlab-org/charts/gitlab/issues/1765

# Initial login

```sh
kubectl get secret <name>-gitlab-initial-root-password -ojsonpath='{.data.password}' | base64 --decode ; echo
```
