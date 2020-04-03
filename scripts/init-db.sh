set -ex

echo "###################################################################"
echo "Init db for formuladb-be for env: $FRMDB_ENV_NAME"
echo "###################################################################"

if [ -n "$BUILD_DEVELOPMENT" ]; then
    psql -e -h db -U postgres -c 'DROP SCHEMA public CASCADE'
    psql -e -h db -U postgres -c 'CREATE SCHEMA public'
    node --inspect=0.0.0.0:9231 dist-be/frmdb-be.js init-db
else
    psql -e -h db -U postgres -c "\d" || true
    if psql -e -h db -U postgres -c "\d" | egrep 't_dictionary|t_currency|t_user'; then
        echo "database already initialized"
    else
        zcat /wwwroot/git/formuladb-env/db/pg_dump.sql.gz | psql -e -h db -U postgres
    fi
fi
