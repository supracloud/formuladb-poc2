set -ex

export BASEDIR="${PWD}/`dirname $0`"

# newEnvName=t1; \
# adminEmail=t1@email; \
# adminHashedPasswd=c9d9b8cab32214716ee1b44b3aae2502; \
newEnvName=$1
adminEmail=$2
adminHashedPasswd=$3
defaultAppName=$4
defaultPageName=$5

if [ -z "$newEnvName" -o -z "$adminEmail" -o -z "$adminHashedPasswd" ]; then 
    echo "usage: create-env.sh newEnvName adminEmail adminHashedPasswd [defaultAppName] [defaultPageName]"
    exit 1;
fi

if kubectl get namespace ${newEnvName}; then
    echo "env ${newEnvName} already exists, exiting..."
    exit 2
fi

mkdir -p env_workspace/${newEnvName} && cp -r k8s skaffold.yaml env_workspace/${newEnvName}
cd env_workspace/${newEnvName}
bash $BASEDIR/kustomize-client-env.sh "${newEnvName}"

kubectl create namespace "${newEnvName}" 
kubectl -n "${newEnvName}" create secret generic regcred --from-file=.dockerconfigjson=${BASEDIR}/docker-config-client.json --type=kubernetes.io/dockerconfigjson; 
            
images=`kubectl get sts be -n$FRMDB_ENV_NAME -o=jsonpath='{.spec.template.spec.containers[0].image}'`
echo "GKE with image ${images} ..."
skaffoldProfile=client
skaffold deploy -n ${newEnvName} -p ${skaffoldProfile} --label skaffold.dev/run-id="static" --label app.kubernetes.io/managed-by="skaffold" --images=${images}
            
protocol=https
domain=formuladb.io

for step in `seq 0 24`; do
    sleep 4
    if curl ${protocol}://${newEnvName}.${domain}; then
        echo "Env ready...checking schema"
    else
        echo "Env not ready...waiting"; continue
    fi

    if curl -s ${protocol}://${newEnvName}.${domain}/formuladb-api/base-app/schema | grep System_Param; then
        echo "API ready"
        break;
    else
        echo "waiting for containers to start..."; continue
    fi
done

echo "removing formuladb-io app"
kubectl -n "${newEnvName}" exec be-0 -- rm -rf wwwroot/git/formuladb-env/frmdb-apps/formuladb-io

echo "tables"
kubectl -n "${newEnvName}" exec db-0 -- psql -U postgres -c "\\d"

echo "creating root admin user"
for step in `seq 0 20`; do 
    sleep 2; 
    if kubectl -n "${newEnvName}" exec db-0 -- psql -U postgres -c "\\d t_user" | grep t_user; then break; fi 
done
kubectl -n "${newEnvName}" exec db-0 -- psql -U postgres -c "truncate table t_user"
kubectl -n "${newEnvName}" exec db-0 -- psql -U postgres -c "INSERT INTO t_user (_id, role, password) VALUES ('\$User~~${adminEmail}', '\$ADMIN', '${adminHashedPasswd}')"
kubectl -n "${newEnvName}" exec db-0 -- psql -U postgres -c "SELECT * FROM t_user"

echo "setting default permissions"
kubectl -n "${newEnvName}" exec db-0 -- psql -U postgres -c "truncate table t_permission"
echo '_id,role,app_name,resource_entity_id,resource_id,permission,for_who,details
$Permission~~1,$ANONYMOUS,*,$Page,"",0READ,ALL,by default anyone can view website pages
$Permission~~2,$USER,*,$Page,"",0READ,ALL,by default anyone can view website pages' \
    | kubectl -n "${newEnvName}" exec -i db-0 -- psql -U postgres -c "COPY t_permission FROM STDIN WITH CSV DELIMITER ',' HEADER"

echo "Setting default app"
kubectl -n "t17" exec be-0 -- bash -c 'egrep "is_default_app|default_page" /wwwroot/git/formuladb-env/frmdb-apps/*/app.yaml'

if [ -n "$defaultAppName" ]; then
    kubectl -n "${newEnvName}" exec be-0 -- bash -c 'perl -p -i -e "s/is_default_app: false/is_default_app: true/" /wwwroot/git/formuladb-env/frmdb-apps/'$defaultAppName'/app.yaml'
    if [ -n "$defaultPageName" ]; then
        kubectl -n "${newEnvName}" exec be-0 -- bash -c 'perl -p -i -e "s/default_page: .*/default_page: '$defaultPageName'/" /wwwroot/git/formuladb-env/frmdb-apps/'$defaultAppName'/app.yaml'
    fi
else
    kubectl -n "${newEnvName}" exec be-0 -- bash -c 'perl -p -i -e "s/is_default_app: false/is_default_app: true/" /wwwroot/git/formuladb-env/frmdb-apps/users/app.yaml'
fi
