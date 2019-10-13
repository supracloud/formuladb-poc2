/**
 * © 2019 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const retry = require('async-retry')
const fetch = require('node-fetch')

export async function createNewEnvironment(envName: string) {
  // If production or staging, just don't
  if (['production', 'staging', ''].includes(envName)) return;

  try {
    await exec(`kubectl get namespace ${envName}`);
  } catch (error) {
    console.log(`Environment ${envName} not found. Creating ...`);
    
    // From now on we want to cleanup on error
    try {
      // Do a copy on the k8s resources for concurrent env setup
      console.log(`Cloning k8s resources for ${envName} ... `);
      await exec(`mkdir -p env_workspace/${envName} && cp -r k8s skaffold.yaml env_workspace/${envName}`);
      await exec(`perl -p -i -e 's!value.*#TBD_ENV_NAME!value: ${envName} #TBD_ENV_NAME!' k8s/overlays/client/patches/pg-backup-deployment.yaml`,
                 {cwd: `env_workspace/${envName}`});
      await exec(`perl -p -i -e 's!value.*#TBD_ENV_NAME!value: ${envName} #TBD_ENV_NAME!' k8s/overlays/client/patches/be-deployment.yaml`,
                 {cwd: `env_workspace/${envName}`});
      await exec(`perl -p -i -e 's!^(.*)\\s.*?\\.formuladb\.io$!\\1 ${envName}.formuladb.io!' k8s/overlays/client/resources/ingress.yaml`,
                 {cwd: `env_workspace/${envName}`});

      await exec(`FRMDB_ENV_NAME=${envName} bash /scripts/prepare-env.sh`,
                 {cwd: `env_workspace/${envName}`});

      console.log(`GKE ...`);
      await exec(`skaffold deploy -n ${envName} -p client --images=registry.gitlab.com/metawiz/febe/formuladb-be:0.0.16-185-g1cb1e942-dirty`,
                 {cwd: `env_workspace/${envName}`});

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

    console.log(`Env ready. Data provisioning ...`);
    await exec(`kubectl -n ${envName} exec service/be -- node /dist-be/frmdb-be-load-test-data.js`,
               {cwd: `env_workspace/${envName}`, maxBuffer: 10240 * 1000});

    console.log(`Done!`);
  }
}

export async function cleanupEnvironment(envName: string) {
  // If production or staging, just don't
  if (['production', 'staging', ''].includes(envName)) return;
  try {
    await exec(`kubectl get namespace ${envName}`);
  } catch (error) {
    return `Namespace ${envName} not found. Nothing to delete!`;
  }

  // Delete git remote branch for formuladb-apps. Thus, make sure we have the local git clone available
  await exec(`FRMDB_ENV_NAME=${envName} bash /scripts/prepare-env.sh`,
             {cwd: `env_workspace/${envName}`});
  await exec(`git push origin --delete ${envName} || true`,
             {cwd: `env_workspace/${envName}/formuladb-apps`});
  console.log(`Branch ${envName} deleted in remote.`);

  console.log(`Deleting namespace ${envName}`);
  await exec(`kubectl delete namespace ${envName}`); 

  console.log(`Deleting k8s directory copy for ${envName}`);
  await exec(`rm -rf env_workspace/${envName} || true`);
  return `Deleted env ${envName}!`;
}
