export FRMDB_TOOLS_DIR=`dirname $0`
export GOOGLE_APPLICATION_CREDENTIALS=$FRMDB_TOOLS_DIR/FormulaDB-storage-full.json

node $FRMDB_TOOLS_DIR/gcloud.js "$1"
