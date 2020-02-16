bash ci/kubectlrsync.sh -crq --exclude=.git be:/wwwroot/git/formuladb-env/frmdb-apps/ formuladb-env/frmdb-apps/
bash ci/kubectlrsync.sh -crq --exclude=.git be:/wwwroot/git/formuladb-env/db/ formuladb-env/db/
bash ci/kubectlrsync.sh -crq --exclude=.git be:/wwwroot/git/formuladb-env/static/ formuladb-env/static/
