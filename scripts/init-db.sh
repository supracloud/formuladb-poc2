set -ex

echo "###################################################################"
echo "Init db for formuladb-be for env: $FRMDB_ENV_NAME"
echo "###################################################################"
ls -ltr /wwwroot/git/formuladb-env || true
ls -ltr /wwwroot/formuladb

export BASEDIR=`dirname $0`
export GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -i /ssh/frmdb.id_rsa"

psql -e -h db -U postgres -c "\d" || true
if psql -e -h db -U postgres -c "\d" | egrep 't_dictionary|t_currency|t_user'; then
    echo "database already initialized"
else
    zipCmd=zcat
    zipSuffix=.gz
    if [ -n "$BUILD_DEVELOPMENT" -o "staging" = "${FRMDB_ENV_NAME}" ]; then
    zipCmd=cat
    zipSuffix=
    fi

    /wwwroot/git/formuladb-env/db/pg_dump.schema.sql | psql -e -h db -U postgres 
    for csv in /wwwroot/git/formuladb-env/db/*.csv${zipSuffix}; do 
        ls -lh $csv
        t=`basename $csv|sed -e 's/\.csv$//; s/\.csv.gz$//'`
        echo "Loading data for table ${t}"
        $zipCmd $csv | head
        $zipCmd $csv | psql -h db -U postgres -c "
            CREATE TEMP TABLE tmp_table ON COMMIT DROP AS SELECT * FROM ${t} WITH NO DATA;
            COPY tmp_table FROM STDIN WITH CSV HEADER;
            INSERT INTO ${t} SELECT * FROM tmp_table ON CONFLICT DO NOTHING;
        "
    done

    psql -e -h db -U postgres -c "INSERT into tparameter (_id, value) VALUES ('Parameter~~DB_STATE', 'FRMDB_INITIALIZED')"

fi
