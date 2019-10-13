GIT_SSH_COMMAND="ssh -i /mnt/d/code/metawiz/febe/ssh/frmdb.id_rsa" git clone git@gitlab.com:formuladb-apps/Hotel_Booking.git
GIT_SSH_COMMAND="ssh -i /mnt/d/code/metawiz/febe/ssh/frmdb.id_rsa" git clone git@gitlab.com:formuladb-internal-apps/formuladb.io.git

## Create new App ##############
FRMDB_APP_NAME=$1
if [ -z "$FRMDB_APP_NAME" ]; then echo "Usage: create-app.sh FRMDB_ENV_NAME FRMDB_TENANT_NAME FRMDB_APP_NAME"; exit 1; fi

for appName in "${FRMDB_APP_NAME}" "${FRMDB_APP_NAME}----db" "${FRMDB_APP_NAME}----obj"; do
    curl -v --request POST --header 'PRIVATE-TOKEN: RER-gkXZCCi8irBNsUgL' --header "Content-Type: application/json" \
        --data '{"path": "formuladb-apps/'${appName}'"}' \
        'https://gitlab.com/api/v4/projects'
done


#####################################
## git lfs
#####################################
find . -type f | egrep '\.(png|jpg|jpeg|svg|webm|eot|ttf|woff|woff2|otf)$'|xargs git lfs track


#####################################
## gcloud storage
#####################################
if ! gcloud auth list|grep formuladb-static-assets; then
    gcloud auth activate-service-account --key-file $BASEDIR/FormulaDB-storage-full.json
fi

gsutil -m rsync -r formuladb-static gs://formuladb-static-assets/formuladb-static

# node $BASEDIR/gcloud.js 'createBucketIfNotExists("'$FRMDB_ENV_NAME'")'

# ASSETS="`git ls-files apps/hotel-booking/`" node $BASEDIR/gcloud.js \
#     'uploadAssets("'$FRMDB_ENV_NAME'")'

gsutil -m rsync -d -r apps/formuladb-internal/formuladb.io gs://formuladb-static-assets/$FRMDB_ENV_NAME/formuladb-internal/formuladb.io
gsutil -m rsync -d -r apps/formuladb-examples/hotel-booking gs://formuladb-static-assets/$FRMDB_ENV_NAME/formuladb-examples/hotel-booking

gsutil -m rsync -r vvvebjs gs://formuladb-static-assets/$FRMDB_ENV_NAME/formuladb-editor
gsutil -m rsync -x ".*.js.map$" -r dist-fe gs://formuladb-static-assets/$FRMDB_ENV_NAME/formuladb
gsutil -m rsync -r fe/img gs://formuladb-static-assets/$FRMDB_ENV_NAME/formuladb/img
gsutil -m rsync -r fe/icons gs://formuladb-static-assets/$FRMDB_ENV_NAME/formuladb/icons
