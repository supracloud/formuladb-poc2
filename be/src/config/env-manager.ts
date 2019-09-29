/**
 * © 2019 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

const util = require('util');
const exec = util.promisify(require('child_process').exec);

export async function createNewEnvironment(envName: string) {
  try {
    await exec(`KUBECONFIG=k8s/production-kube-config.conf kubectl get namespace|grep ${envName}`);
  } catch (error) {
    console.log(`Environment ${envName} not found. Creating ...`);
    await exec(`perl -p -i -e 's!value.*#TBD_ENV_NAME!value: ${envName} #TBD_ENV_NAME!' k8s/overlays/client/patches/pg-backup-deployment.yaml`);

    await exec(`perl -p -i -e 's!value.*#TBD_ENV_NAME!value: ${envName} #TBD_ENV_NAME!' k8s/overlays/client/patches/be-deployment.yaml`);
  
    await exec(`perl -p -i -e 's!^(.*)\\s.*?\\.formuladb\.io$!\\1 ${envName}.formuladb.io!' k8s/overlays/client/resources/ingress.yaml`);
    
    console.log(`Namespace ...`);
    await exec(`KUBECONFIG=k8s/production-kube-config.conf kubectl create namespace ${envName}`); 

    console.log(`Registry secret ...`);
    await exec(`KUBECONFIG=k8s/production-kube-config.conf kubectl get secret regcred --export -oyaml | KUBECONFIG=k8s/production-kube-config.conf kubectl apply --namespace=${envName} -f -`);

    console.log(`GKE ...`);
    await exec(`KUBECONFIG=k8s/production-kube-config.conf skaffold deploy -n ${envName} -p client --images=registry.gitlab.com/metawiz/febe/formuladb-be:0.0.16`);

    console.log(`Object storage clone ...`);
    await exec(`gsutil cp -r gs://formuladb-static-assets/production/ gs://formuladb-static-assets/${envName}/`);

    console.log(`Done!`);
  }
}
