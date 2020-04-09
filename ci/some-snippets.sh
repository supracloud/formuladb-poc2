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

# ASSETS="`git ls-files apps/hotel-booking/`" node $BASEDIR/gcloud.js \
#     'uploadAssets("'$FRMDB_ENV_NAME'")'

gsutil -m rsync -d -r formuladb.io gs://formuladb-env/static-assets/$FRMDB_ENV_NAME/formuladb-internal/formuladb.io
gsutil -m rsync -d -r apps/formuladb-examples/hotel-booking gs://formuladb-env/static-assets/$FRMDB_ENV_NAME/formuladb-examples/hotel-booking

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

#####################################
## Db stuff
#####################################
cat t_permission.csv | psql -h db -U postgres -c "COPY t_permission FROM STDIN WITH CSV HEADER DELIMITER ',' QUOTE '\"' ESCAPE '\\'"
