set -ex

if [ -f "/wwwroot/git/formuladb-env/db/backup-db-before-hook.sh" ]; then
    bash /wwwroot/git/formuladb-env/db/backup-db-before-hook.sh
fi

psql -h ${PGHOST:-db} -U postgres -Atc "select tablename from pg_tables where schemaname='public'" | 
while read t; do 
    psql -h ${PGHOST:-db} -U postgres -c "COPY (SELECT * FROM public.${t} ORDER BY _id LIMIT 1000) TO STDOUT WITH CSV HEADER DELIMITER ',' QUOTE '\"' ESCAPE '\\'" > /wwwroot/git/formuladb-env/db/$t.csv
done

pg_dump --schema-only -h ${PGHOST:-db} -U postgres -w > /wwwroot/git/formuladb-env/db/pg_dump.schema.sql
pg_dump -h ${PGHOST:-db} -U postgres -w | gzip > /wwwroot/git/formuladb-env/db/pg_dump.sql.gz
if [ -f "/wwwroot/git/formuladb-env/db/backup-db-after-hook.sh" ]; then
    bash /wwwroot/git/formuladb-env/db/backup-db-after-hook.sh
fi
