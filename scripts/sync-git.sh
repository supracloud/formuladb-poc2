if [ -n "$FRMDB_LOCALDEV_ENV" ]; then exit 0; fi

set -ex
cd /wwwroot/git/formuladb-env

# git log --name-status -20|cat

if [ -n "$(git status --porcelain)" ]; then
  git add .
  git config user.email "git.bot@formuladb.io"
  git config user.name "Git Bot"
  git commit -m "changes from git sync"
fi

git pull -Xtheirs --no-edit origin "${FRMDB_ENV_NAME}"
#TODO make better conflict handling here!
git push --set-upstream origin "${FRMDB_ENV_NAME}"

if [ -f '.git/index.lock' -a -n "$(find .git/index.lock -mmin +10 -print)" ]; then
  echo "zombie git lock file found, removing it"
  rm -f .git/index.lock
fi
