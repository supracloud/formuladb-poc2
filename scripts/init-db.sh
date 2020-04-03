set -ex

if [ -n "$BUILD_DEVELOPMENT" ]; then
    psql -e -h db -U postgres -c 'DROP SCHEMA public CASCADE'
    psql -e -h db -U postgres -c 'CREATE SCHEMA public'
    psql -e -h db -U postgres < /wwwroot/git/formuladb-env/db/pg_dump.schema.sql 
    for csv in /wwwroot/git/formuladb-env/db/*.csv; do 
        ls -lh $csv
        t=`basename $csv|sed -e 's/\.csv$//'`
        cat $csv | psql -h db -U postgres -c "
            CREATE TEMP TABLE tmp_table ON COMMIT DROP AS SELECT * FROM ${t} WITH NO DATA;
            COPY tmp_table FROM STDIN WITH CSV HEADER;
            INSERT INTO ${t} SELECT * FROM tmp_table ON CONFLICT DO NOTHING;
        " || true
    done
else
    psql -e -h db -U postgres -c "\d" || true
    if psql -e -h db -U postgres -c "\d" | egrep 't_dictionary|t_currency|t_user'; then
        echo "database already initialized"
    else
        zcat /wwwroot/git/formuladb-env/db/pg_dump.schema.sql.gz | psql -e -h db -U postgres
    fi
fi
