cd /wwwroot/git/formuladb-apps

if [ -n "$(git status --porcelain)" ]; then
  git add .
  git commit -m "changes from git sync"
  git pull -Xtheirs
  #TODO make better conflic handling here!
  git push --set-upstream origin "${FRMDB_ENV_NAME}"
else
  echo "no changes";
fi
