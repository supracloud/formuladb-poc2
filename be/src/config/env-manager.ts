/**
 * © 2019 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const https = require('https')

export async function createNewEnvironment(envName: string) {
  try {
    await exec(`kubectl get namespace|grep ${envName}`);
  } catch (error) {
    console.log(`Environment ${envName} not found. Creating ...`);
    await exec(`perl -p -i -e 's!value.*#TBD_ENV_NAME!value: ${envName} #TBD_ENV_NAME!' k8s/overlays/client/patches/pg-backup-deployment.yaml`);

    await exec(`perl -p -i -e 's!value.*#TBD_ENV_NAME!value: ${envName} #TBD_ENV_NAME!' k8s/overlays/client/patches/be-deployment.yaml`);
  
    await exec(`perl -p -i -e 's!^(.*)\\s.*?\\.formuladb\.io$!\\1 ${envName}.formuladb.io!' k8s/overlays/client/resources/ingress.yaml`);
    
    console.log(`Namespace ...`);
    await exec(`kubectl create namespace ${envName}`); 

    console.log(`Registry secret ...`);
    await exec(`kubectl get secret regcred --export -oyaml | kubectl apply --namespace=${envName} -f -`);

    console.log(`GKE ...`);
    await exec(`skaffold deploy -n ${envName} -p client --images=registry.gitlab.com/metawiz/febe/formuladb-be:0.0.16-98-gd3dfd176-dirty`);

    console.log(`Object storage clone ...`);
    await exec(`gsutil -m rsync -r gs://formuladb-static-assets/production/ gs://formuladb-static-assets/${envName}/`,
              {maxBuffer: 10240 * 1000});

    console.log(`Done!`);
  }
}

function retryUntilSuccess(org, max, callback) {
  const options = {
    hostname: `${org}.formuladb.io`,
    port: 443,
    path: '/',
    method: 'GET'
  }

  var req = https.request(options, function(res) {
    req.end();
    if (res.statusCode != 200) {
      if (max > 0) {
        setTimeout(function() {
          retryUntilSuccess(org, max-1, callback);
        }, 1000);
      } else {
        callback(null, history);
      }
    } else {
      callback(null, history);
    }
  });

  req.on('error', function(e) {
    if (max > 0) {
      setTimeout(function() {
        retryUntilSuccess(org, max-1, callback);
      }, 1000);
    } else {
      callback(null, history);
    }
  });
}
