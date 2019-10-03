## WARNING: Under construction ##############

FRMDB_APP_NAME=$1
if [ -z "$FRMDB_APP_NAME" ]; then echo "Usage: create-app.sh FRMDB_ENV_NAME FRMDB_TENANT_NAME FRMDB_APP_NAME"; exit 1; fi

for appName in "${FRMDB_APP_NAME}" "${FRMDB_APP_NAME}----db" "${FRMDB_APP_NAME}----obj"; do
    curl -v --request POST --header 'PRIVATE-TOKEN: RER-gkXZCCi8irBNsUgL' --header "Content-Type: application/json" \
        --data '{"path": "formuladb-apps/'${appName}'"}' \
        'https://gitlab.com/api/v4/projects'
done
