/**
 * © 2019 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const retry = require('async-retry')
const fetch = require('node-fetch')

export async function createNewEnvironment(envName: string) {
  // Don't want to alter for now staging or prod
  if (['production', 'staging', ''].includes(envName)) return;

  try {
    await exec(`kubectl get namespace|grep ${envName}`);
  } catch (error) {
    // TODO implement concurrent execution
    console.log(`Environment ${envName} not found. Creating ...`);
    await exec(`perl -p -i -e 's!value.*#TBD_ENV_NAME!value: ${envName} #TBD_ENV_NAME!' k8s/overlays/client/patches/pg-backup-deployment.yaml`);

    await exec(`perl -p -i -e 's!value.*#TBD_ENV_NAME!value: ${envName} #TBD_ENV_NAME!' k8s/overlays/client/patches/be-deployment.yaml`);
  
    await exec(`perl -p -i -e 's!^(.*)\\s.*?\\.formuladb\.io$!\\1 ${envName}.formuladb.io!' k8s/overlays/client/resources/ingress.yaml`);
    
    // From now on we want to cleanup on error
    try {
      console.log(`Namespace ... `);
      await exec(`kubectl create namespace ${envName}`); 

      console.log(`Registry secret ...`);
      await exec(`kubectl get secret regcred --export -oyaml | kubectl apply --namespace=${envName} -f -`);

      console.log(`GKE ...`);
      await exec(`skaffold deploy -n ${envName} -p client --images=registry.gitlab.com/metawiz/febe/formuladb-be:0.0.16-182-g16369013-dirty`);

      console.log(`Object storage clone ...`);
      await exec(`gsutil -m rsync -r gs://formuladb-static-assets/production/ gs://formuladb-static-assets/${envName}/`,
                {maxBuffer: 10240 * 1000});

      console.log(`Data provisioning ...`);
      await exec(`PGPASSWORD=postgres psql -U postgres -d postgres -h db.${envName} < k8s/pg_dump.sql`);

      await retry(async bail => {
        // if anything throws, we retry
        const res = await fetch(`https://${envName}.formuladb.io`)
        
        console.log(`https://${envName}.formuladb.io returned ${res.status}`);
        if (200 !== res.status) {
          console.log(`Not ready yet ...`);
          throw "Not ready!";
        }
        return 200;
      })
    } catch (error) {
      console.log(`Environment setup failed with error ${error}. Cleaning up ...`);
      await cleanupEnvironment(envName);
    }
              
    console.log(`Done!`);
  }
}

export async function cleanupEnvironment(envName: string) {
  // Don't want to alter for now staging or prod
  if (['production', 'staging', ''].includes(envName)) return;
  try {
    await exec(`kubectl get namespace|grep ${envName}`);
  } catch (error) {
    return `Namespace ${envName} not found. Nothing to delete!`;
  }
  console.log(`Deleting namespace ${envName}`);
  await exec(`kubectl delete namespace ${envName}`); 
  console.log(`Deleting bucket folder ${envName}`);
  await exec(`gsutil -m rm -r gs://formuladb-static-assets/${envName}/`, {maxBuffer: 10240 * 1000});
  return `Deleted env ${envName}!`;
}
