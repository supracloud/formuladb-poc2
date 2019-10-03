FRMDB_ENV_NAME=$1
if [ -z "$FRMDB_ENV_NAME" ]; then echo "Usage: init-app.sh FRMDB_ENV_NAME FRMDB_APP_NAME"; exit 1; fi

export BASEDIR=`dirname $0`

mkdir -p frmdb-wwwroot
cd frmdb-wwwroot

bash ${BASEDIR}/init-app.sh "${FRMDB_ENV_NAME}" formuladb-internal-apps formuladb.io
bash ${BASEDIR}/init-app.sh "${FRMDB_ENV_NAME}" formuladb-apps Hotel_Booking
