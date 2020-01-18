if [ -n "$BUILD_DEVELOPMENT" -o "staging" = "${FRMDB_ENV_NAME}" -o "production" = "${FRMDB_ENV_NAME}" ]; then
  pg_dump -h db -U postgres -w > /wwwroot/git/formuladb-env/db/pg_dump.sql
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
