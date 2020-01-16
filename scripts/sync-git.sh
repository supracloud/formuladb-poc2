if [ -n "$BUILD_DEVELOPMENT" ]; then exit; fi

cd /wwwroot/git/formuladb-env
if [ -n "$(git status --porcelain)" ]; then
  git add .
  git commit -m "changes from git sync"
  git pull -Xtheirs
  #TODO make better conflict handling here!
  git push --set-upstream origin "${FRMDB_ENV_NAME}"
else
  echo "no changes";
fi
