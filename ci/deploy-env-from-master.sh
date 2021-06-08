set -ex

export BASEDIR="`dirname $0`"
ENVNAME=$1
CI_PUSH_ENV_TOKEN=pWJYaf-Ezj4rzx8yJAU3

if [ -z "$ENVNAME" ]; then echo "Usage: deploy-env-from-master.sh env-name"; exit 1; fi

if [ -d "../formuladb-env" ] && cd ../formuladb-env ; then
    echo "using existing git repo"
else
    cd ..
    git clone https://gitlab-ci-token:${CI_PUSH_ENV_TOKEN}@gitlab.formuladb.io/formuladb/formuladb-env.git
    cd formuladb-env
    git config user.email "git.ci.bot@formuladb.io"
    git config user.name "Git CI Bot"
fi
git checkout ${ENVNAME}
git pull origin ${ENVNAME} -Xtheirs

echo "== merging ${ENVNAME} into master ====================="
git checkout master
git pull origin master -Xtheirs
git merge --no-ff --no-commit ${ENVNAME} || true
for i in frmdb-apps/formuladb-io/_head.html db/pg_dump.sql.gz date.txt db/t_user.csv; do
    git reset HEAD $i
    git checkout -- $i
done
git diff-index --quiet HEAD || git commit -m "merged ${ENVNAME} into master"
git push origin master

echo "== merging master into ${ENVNAME} ====================="
git checkout ${ENVNAME}
git pull origin ${ENVNAME} -Xtheirs
git merge --no-ff --no-commit master || true
for i in frmdb-apps/formuladb-io/_head.html db/pg_dump.sql.gz date.txt db/t_user.csv; do
    git reset HEAD $i
    git checkout -- $i
done
git diff-index --quiet HEAD || git commit -m "merged master into ${ENVNAME}"

echo "== Pushing ${ENVNAME} env, there is a small time window between env pushing and image creation + sts patching... ==="
git push origin ${ENVNAME}
