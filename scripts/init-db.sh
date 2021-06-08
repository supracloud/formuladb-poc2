set -ex

echo "###################################################################"
echo "Init db for formuladb-be for env: $FRMDB_ENV_NAME"
echo "###################################################################"

if [ -n "$FRMDB_LOCALDEV_ENV" ]; then
    echo "dev env, done via be server"
else
    until pg_isready -h ${PGHOST:-db} -p 5432 -t 1; do echo waiting for database; sleep 2; done;
    psql -e -h ${PGHOST:-db} -U postgres -c "\d" || true
    if psql -e -h ${PGHOST:-db} -U postgres -c "\d" | egrep 't_dictionary|t_currency|t_user'; then
        echo "database already initialized"
    else
        zcat /wwwroot/git/formuladb-env/db/pg_dump.sql.gz | psql -e -h ${PGHOST:-db} -U postgres
        if [ -f "/wwwroot/git/formuladb-env/db/init-db.sql" ]; then
            cat /wwwroot/git/formuladb-env/db/init-db.sql | psql -e -h ${PGHOST:-db} -U postgres
        fi
    fi
fi
