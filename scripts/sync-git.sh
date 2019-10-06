cd /wwwroot/git/formuladb-apps
if [ -n "$(git status --porcelain)" ]; then

  git pull --rebase
  git add .
  git commit -m ""

else
  echo "no changes";

fi
