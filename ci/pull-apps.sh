export BASEDIR=`dirname $0`
export GOOGLE_APPLICATION_CREDENTIALS=$BASEDIR/FormulaDB-storage-full.json

gsutil -m rsync -r gs://formuladb-env/static-assets/staging/formuladb-internal/formuladb.io apps/formuladb-internal/formuladb.io
gsutil -m rsync -r gs://formuladb-env/static-assets/staging/formuladb-examples/hotel-booking apps/formuladb-examples/hotel-booking
