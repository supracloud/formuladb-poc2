GIT_SSH_COMMAND="ssh -i /mnt/d/code/metawiz/febe/ssh/frmdb.id_rsa" git clone git@gitlab.com:formuladb-internal-apps/formuladb.io.git

## Create new App ##############
FRMDB_APP_NAME=$1
if [ -z "$FRMDB_APP_NAME" ]; then echo "Usage: create-app.sh FRMDB_ENV_NAME FRMDB_TENANT_NAME FRMDB_APP_NAME"; exit 1; fi

for appName in "${FRMDB_APP_NAME}" "${FRMDB_APP_NAME}----db" "${FRMDB_APP_NAME}----obj"; do
    curl -v --request POST --header 'PRIVATE-TOKEN: RER-gkXZCCi8irBNsUgL' --header "Content-Type: application/json" \
        --data '{"path": "formuladb-env/'${appName}'"}' \
        'https://gitlab.com/api/v4/projects'
done


#####################################
## git lfs
#####################################
git lfs track '**/*.png'
git lfs track '**/*.jpg'
git lfs track '**/*.jpeg'
git lfs track 'static/**/*.svg'
git lfs track 'icons/**/*.svg'
git lfs track '**/*.webm'
git lfs track '**/*.eot'
git lfs track '**/*.ttf'
git lfs track '**/*.woff'
git lfs track '**/*.woff2'
git lfs track '**/*.otf'
git lfs track 'css/**.css'

#####################################
## gcloud storage
#####################################
if ! gcloud auth list|grep formuladb-env/static-assets; then
    gcloud auth activate-service-account --key-file $BASEDIR/FormulaDB-storage-full.json
fi

gsutil -m rsync -r formuladb-env/static gs://formuladb-env/static-assets/formuladb-env/static

# node $BASEDIR/gcloud.js 'createBucketIfNotExists("'$FRMDB_ENV_NAME'")'

gsutil -m rsync -d -r formuladb.io gs://formuladb-env/static-assets/$FRMDB_ENV_NAME/formuladb-internal/formuladb.io

gsutil -m rsync -r vvvebjs gs://formuladb-env/static-assets/$FRMDB_ENV_NAME/formuladb-editor
gsutil -m rsync -x ".*.js.map$" -r formuladb gs://formuladb-env/static-assets/$FRMDB_ENV_NAME/formuladb
gsutil -m rsync -r fe/img gs://formuladb-env/static-assets/$FRMDB_ENV_NAME/formuladb/img
gsutil -m rsync -r fe/icons gs://formuladb-env/static-assets/$FRMDB_ENV_NAME/formuladb/icons

gsutil -m rsync -r  gs://formuladb-env/static-assets/production/formuladb-internal .


#####################################
## formuladb API
#####################################
curl -XPUT  -H "Content-Type: text/yaml" --data-binary @apps/inventory/App.yml http://localhost:3000/formuladb-api/inventory
curl -XPUT  -H "Content-Type: text/yaml" --data-binary @apps/inventory/Schema.yml http://localhost:3000/formuladb-api/inventory/schema
curl -XPUT  -H "Content-Type: text/csv" --data-binary @apps/inventory/\$User.csv http://localhost:3000/formuladb-api/inventory/bulk


I=35; for i in [a-z]*; do idx=`printf '%07d' $I`; k=`echo $i | sed 's/^/'$idx'-/'`; echo mv $i $k; ((I++)) ; done
#for i in *; do [[ $i =~ ([0-9]+)-(.*.svg) ]]; printf "%07d-%s\n" $((10#${BASH_REMATCH[1]})) ${BASH_REMATCH[2]} ; done

#curl -XPOST  -H "Content-Type: application/json" -d '{"type_": "ServerEventModifiedFormData", "obj": {"_id": "$System_Param~~x", "value": "value1"}}' http://localhost:${PORT:-3000}/formuladb-api/formuladb-io/event

curl -XPUT -H "Content-Type: text/csv" https://staging.formuladb.io/formuladb-api/formuladb-io/bulk --data-binary @git/formuladb-env/db/tapp_template.csv

curl -XPUT -H "Content-Type: text/csv" http://localhost:30898/formuladb-api/formuladb-io/bulk --data-binary @git/formuladb-env/db/t_dictionary.csv
curl -XPUT -H "Content-Type: text/csv" frmdb.localhost/restaurant/formuladb-io/bulk --data-binary @git/formuladb-env/db/trestaurant_menu_itemX.csv

curl -XPUT -H "Content-Type: text/csv" http://frmdb.localhost/formuladb-api/restaurant/bulk \
    --data-binary @git/formuladb-env/db/trestaurant_menu_item.csv

curl -XPOST http://localhost:${PORT:-3000}/formuladb-api/formuladb-io/event -H "Content-Type: application/json" -d '{"type_": "ServerEventModifiedFormData", "obj": {"_id":"Report_Order_Item~~5017114","order_id":263042,"order_state":"PROCESSED_","order_client_code":"CL00128","order_address_code":"SP04","product_list_product_id":5017114,"inventory_code":"MATPLV","product_code":"84526600000","ordered_quantity":1,"ordered_value":"0.00000","quantity":1,"delivered_value_sfa":"0.00000","quantity_error":0,"price":"0.00000","order_client":"SEPHORA COSMETICS ROMANIA SA","order_actor_code":"413","order_address":null,"order_address_name":"BUC ORHIDEEA / 104","order_city":"BUCURESTI","order_external_id":null,"order_external_param":null,"order_details":"aviz val zero - pub","order_month":"2018-12","order_created_at":"2018-12-02T14:59:46.882Z","order_updated_at":"2018-12-03T14:03:01.228Z","order_wms_id":null,"order_wms_aviz":null,"order_wms_awb":null,"order_wms_statusorderwms":null,"order_wms_statusawb":null,"order_wms_deliveryaddress":null,"order_wms_insertdate":null,"order_wms_imported":null,"order_wms_importdate":null,"order_cargus_link":null,"order_fancourier_link":null,"stock":0,"reserved_stock":0,"imported_stock":0,"remotely_reserved_stock":0,"nav_shipment_quantity":null,"delivered_value_nav":null,"nav_shipment_no":null,"barcode":"3423478452664","product_name":"DG THE ONLY ONE EDPV 100 ML TESTER","group1":"BEAUTE PRESTIGE INTERNATIONAL","group2":"DOLCE-GABBANA","group3":"THE ONLY ONE","group4":"P-TESTERS","updated_at":"2018-12-02T15:00:16.980Z","created_at":"2018-12-02T15:00:16.979Z"}}'



#####################################
## Db stuff
#####################################
cat t_permission.csv | psql -h ${PGHOST:-db} -U postgres -c "COPY t_permission FROM STDIN WITH CSV HEADER DELIMITER ',' QUOTE '\"' ESCAPE '\\'"
cat  | psql -h ${PGHOST:-db} -U postgres -c "COPY t_user FROM STDIN WITH CSV HEADER DELIMITER ',' QUOTE '\"' ESCAPE '\\'"

pg_dump -U postgres --table=tmpt --data-only --column-inserts postgres

#####################################
## git stuff
#####################################

# cleanup regression branches
git branch -a | egrep -o  'origin/.{41}' | while read i; do echo ======= $i ===============; git log -1 --since='1 day ago' -s $i; if [ -z "`git log -1 --since='1 day ago' -s $i`" ]; then echo "old branch, deleting...."; git push git@gitlab.formuladb.io:acristu/formuladb-env.git +:refs/heads/${i/origin\//} ; fi; done

#####################################
## k8s stuff
#####################################

kubectl -n staging patch sts be -p "`cat k8s/overlays/staging/patches/be-sts.yaml `"

# CronJob(s)
# kubectl create job --from=cronjob/<name of cronjob> <name of job>
kubectl -n orbicobeautyro create job --from=cronjob/sync-report-order-item sync-report-order-item-`date +\%Y\%m\%d\%H\%M\%S`

## on-prem
curl -sfL https://get.k3s.io | sudo sh -s - --https-listen-port 6444

kubectl get pods -A -o custom-columns=PodName:.metadata.name,PodUID:.metadata.uid|grep be-0
sudo grep 05182bf3-b787-48bd-b087-e522f5060c77 /var/log/messages|tail -1
grep cni-6d92b7f9-6119-04ed-7438-79f0dbee9adb /proc/*/mounts
ps -ef|grep 16255

[sfa@new-sfa be]$ kubectl get pods -A -o custom-columns=PodName:.metadata.name,PodUID:.metadata.uid|grep be-0
be-0                                            002a6158-3b27-47ce-8d19-798d7b2cb047
[sfa@new-sfa be]$ ls /var/log/pods/|grep 002a6158-3b27-47ce-8d19-798d7b2cb047
orbicobeautyro_be-0_002a6158-3b27-47ce-8d19-798d7b2cb047


gcloud container clusters list
# mi-am adaugat credentialele in context pentru toate clusterele
gcloud container clusters get-credentials formuladb --zone europe-west1-b
gcloud container clusters get-credentials formuladb-gitlab-and-monitoring --zone europe-west1-b
kubectl config rename-context gke_seismic-plexus-232506_europe-west1-b_formuladb-gitlab-and-monitoring mon
kubectl config rename-context gke_seismic-plexus-232506_europe-west1-b_formuladb prod

#####################################
## fix-html
#####################################

find git/formuladb-env/frmdb-apps/ -name \*.html | xargs grep '<div class="card-deck frmdb-cards-3">'|cut -d':' -f1|sort|uniq|xargs node dist-be/frmdb-be.js fix-html

#####################################
## migrate issue closed status from gitlab.com to gitlab.formuladb.io
#####################################
curl -s --header "PRIVATE-TOKEN: mfDqKQ6zwhZaszaNpUys" 'https://gitlab.com/api/v4/projects/4245551/issues?state=closed&scope=all&per_page=100' | jq '.[].title' | while read p
do
    echo $p
    gitlab_title=$(echo $p | sed 's/^"//g' | sed 's/"$//g' | sed 's/ /+/g' | sed 's/;/%3B/g' | sed 's/\//%2F/g' | sed 's/,/%2C/g')
    iids=$(curl -s --header "PRIVATE-TOKEN: 9XeyeoB2FWMnzXXx1SzQ" 'https://gitlab.formuladb.io/api/v4/projects/10/issues?search='$gitlab_title | jq '.[].iid')
    for id in $iids
    do
        formuladb_title=$(curl -s --header "PRIVATE-TOKEN: 9XeyeoB2FWMnzXXx1SzQ" 'https://gitlab.formuladb.io/api/v4/projects/10/issues/'$id | jq '.title' | sed 's/\\"/"/g')
        if [ "$formuladb_title" = "$p" ]; then
            echo $id " ---- " $p
            curl -s --request PUT --header "PRIVATE-TOKEN: 9XeyeoB2FWMnzXXx1SzQ" 'https://gitlab.formuladb.io/api/v4/projects/10/issues/'$id'?state_event=close' 2>&1 > /dev/null
        fi
    done
    echo "================"
done


#####################################
## misc
#####################################

date +%Y-%m-%d_%H-%M-%S_%5N

#parse formula expression
node -e 'const jsep=require("jsep"); jsep.addLiteral("@", "@"); console.log(JSON.stringify(jsep.parse("SUMIF(A.x, @[_id] == x)"), null, 4))'|jq

#sniff http traffix
sudo tcpdump -vvvs 1024 -i any -s 0 'tcp port http'
