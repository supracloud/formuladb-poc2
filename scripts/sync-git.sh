if [ -n "$BUILD_DEVELOPMENT" -o "staging" = "${FRMDB_ENV_NAME}" ]; then
  pg_dump --schema-only -h db -U postgres -w > /wwwroot/git/formuladb-env/db/pg_dump.schema.sql
  psql -h db -U postgres -Atc "select tablename from pg_tables where schemaname='public'" | 
    while read t; do 
      psql -h db -U postgres -c "COPY (SELECT * FROM public.${t} ORDER BY _id) TO STDOUT WITH CSV HEADER" > /wwwroot/git/formuladb-env/db/$t.csv
    done
else
  pg_dump -h db -U postgres -w | gzip > /wwwroot/git/formuladb-env/db/pg_dump.sql.gz
fi

cd /wwwroot/git/formuladb-env
if [ -n "$(git status --porcelain)" ]; then
  git add .
  if [ -z "$BUILD_DEVELOPMENT" ]; then
    git commit -m "changes from git sync"
    git pull -Xtheirs
    #TODO make better conflict handling here!
    git push --set-upstream origin "${FRMDB_ENV_NAME}"
  fi
else
  echo "no changes";
fi
