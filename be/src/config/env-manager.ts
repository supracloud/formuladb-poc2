/**
 * © 2019 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const retry = require('async-retry')
const fetch = require('node-fetch')

async function delay(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise(resolve => setTimeout(resolve, ms));
}

export async function createNewEnvironment(envName: string, email: string, password:string) {
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
      await exec(`perl -p -i -e 's!namespace.*#TBD_ENV_NAME!namespace: ${envName} #TBD_ENV_NAME!' k8s/base/kustomization.yaml`,
                 {cwd: `env_workspace/${envName}`});

      await exec(`FRMDB_ENV_NAME=${envName} FRMDB_APPS_BASE_BRANCH=${process.env.FRMDB_ENV_NAME} bash /scripts/prepare-env.sh`,
                 {cwd: `env_workspace/${envName}`});

      const { stdout, stderr } = await exec('kubectl get deployment be -n$FRMDB_ENV_NAME -o=jsonpath=\'{.spec.template.spec.containers[0].image}\'');
      console.log(`GKE with image ${stdout} ...`);
      await exec(`skaffold deploy -n ${envName} -p client --images=${stdout}`,
                 {cwd: `env_workspace/${envName}`});

      for (let step = 0; step < 24; step++) {
        try {
          const res = await fetch(`https://${envName}.formuladb.io`)
          console.log(`https://${envName}.formuladb.io returned ${res.status}`);
          if (200 === res.status) {
            console.log(`Env ready. Data provisioning ...`);
            await exec(`kubectl -n ${envName} exec service/be -- env DISABLE_TEST_USERS=true ADMIN_USER_EMAIL=${email} ADMIN_USER_PASS=${password} node /dist-be/frmdb-be-load-test-data.js`,
                       {cwd: `env_workspace/${envName}`, maxBuffer: 10240 * 1000});
        
            console.log(`Done!`);
            return;
          }
          console.log(`Fetch returned with ${res.status}. Retrying ...`);
        } catch (error) {
          console.log(`Fetch failed with error ${error}. Retrying ...`);
        }
        await delay(5000);
      }

      throw "Env not ready. Giving up ...";

    } catch (error) {
      console.log(`Environment setup failed with error ${error}. Cleaning up ...`);
      await cleanupEnvironment(envName);
      return;
    }
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

  // Delete git remote branch for formuladb-apps. Thus, make sure we have the local git clone available and in sync with remote
  await exec(`mkdir -p env_workspace/${envName}`);
  await exec(`FRMDB_ENV_NAME=${envName} FRMDB_APPS_BASE_BRANCH=${process.env.FRMDB_ENV_NAME} bash /scripts/prepare-env.sh`,
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
