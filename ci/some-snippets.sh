GIT_SSH_COMMAND="ssh -i /mnt/d/code/metawiz/febe/ssh/frmdb.id_rsa" git clone git@gitlab.com:formuladb-apps/Hotel_Booking.git
GIT_SSH_COMMAND="ssh -i /mnt/d/code/metawiz/febe/ssh/frmdb.id_rsa" git clone git@gitlab.com:formuladb-apps/Hotel_Booking----db.git
GIT_SSH_COMMAND="ssh -i /mnt/d/code/metawiz/febe/ssh/frmdb.id_rsa" git clone git@gitlab.com:formuladb-apps/Hotel_Booking----obj.git

GIT_SSH_COMMAND="ssh -i /mnt/d/code/metawiz/febe/ssh/frmdb.id_rsa" git clone git@gitlab.com:formuladb-themes/royal.git

GIT_SSH_COMMAND="ssh -i /mnt/d/code/metawiz/febe/ssh/frmdb.id_rsa" git clone git@gitlab.com:formuladb-internal-apps/formuladb.io.git
GIT_SSH_COMMAND="ssh -i /mnt/d/code/metawiz/febe/ssh/frmdb.id_rsa" git clone git@gitlab.com:formuladb-internal-apps/formuladb.io----db.git
GIT_SSH_COMMAND="ssh -i /mnt/d/code/metawiz/febe/ssh/frmdb.id_rsa" git clone git@gitlab.com:formuladb-internal-apps/formuladb.io----obj.git


## Create new App ##############
FRMDB_APP_NAME=$1
if [ -z "$FRMDB_APP_NAME" ]; then echo "Usage: create-app.sh FRMDB_ENV_NAME FRMDB_TENANT_NAME FRMDB_APP_NAME"; exit 1; fi

for appName in "${FRMDB_APP_NAME}" "${FRMDB_APP_NAME}----db" "${FRMDB_APP_NAME}----obj"; do
    curl -v --request POST --header 'PRIVATE-TOKEN: RER-gkXZCCi8irBNsUgL' --header "Content-Type: application/json" \
        --data '{"path": "formuladb-apps/'${appName}'"}' \
        'https://gitlab.com/api/v4/projects'
done
