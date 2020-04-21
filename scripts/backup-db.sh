pg_dump -h ${PGHOST:-db} -U postgres -w | gzip > /wwwroot/git/formuladb-env/db/pg_dump.sql.gz
