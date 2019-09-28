/**
 * © 2019 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

const util = require('util');
const exec = util.promisify(require('child_process').exec);

export async function createNewEnvironment(envName: string) {
  let res = await exec("perl -p -i -e 's!value.*#TBD_ENV_NAME!value: '" + envName + "' #TBD_ENV_NAME!' k8s/overlays/client/patches/pg-backup-deployment.yaml");
  console.log('stdout:', res.stdout, 'stderr:', res.stderr);
  res = await exec("perl -p -i -e 's!value.*#TBD_ENV_NAME!value: '" + envName + "' #TBD_ENV_NAME!' k8s/overlays/client/patches/be-deployment.yaml");
  console.log('stdout:', res.stdout, 'stderr:', res.stderr);
  res = await exec("perl -p -i -e 's! .*?\.formuladb\.io!'" + envName + "'.formuladb.io!' k8s/overlays/client/resources/ingress.yaml");
  console.log('stdout:', res.stdout, 'stderr:', res.stderr);
  res = await exec("KUBECONFIG=k8s/production-kube-config.conf kubectl create namespace " + envName); 
  console.log('stdout:', res.stdout, 'stderr:', res.stderr);
  //res = await exec("KUBECONFIG=k8s/production-kube-config.conf skaffold -n " + envName + " run -p client");
  //console.log('stdout:', res.stdout, 'stderr:', res.stderr);
  // res = await exec("gsutil cp -r gs://formuladb-static-assets/production/ gs://formuladb-static-assets/" + envName + "/");
  //console.log('stdout:', res.stdout, 'stderr:', res.stderr);
}
