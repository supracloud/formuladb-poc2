set -ex

echo "###################################################################"
echo "Init db for formuladb-be for env: $FRMDB_ENV_NAME"
echo "###################################################################"

if [ -n "$BUILD_DEVELOPMENT" ]; then
    echo "dev env, done via be server"
else
    psql -e -h ${PGHOST:-db} -U postgres -c "\d" || true
    if psql -e -h ${PGHOST:-db} -U postgres -c "\d" | egrep 't_dictionary|t_currency|t_user'; then
        echo "database already initialized"
    else
        zcat /wwwroot/git/formuladb-env/db/pg_dump.sql.gz | psql -e -h ${PGHOST:-db} -U postgres
    fi
fi
