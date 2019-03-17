# Artifacts

## formuladb

This is the helm chart for formuladb

use `./helm install --name laurentiu ./formuladb` to deploy an app at `laurentiu.formuladb.online`

`./helm delete --purge laurentiu` to delete the app 

## create-helm-service-account.yaml

The service account required the first time you deploy helm/tiller on a fresh GKE cluster that has RBAC enabled

## docker-secret.yaml

The secret used to authenticate in gitlab docker registry where the FRMDB images are stored
