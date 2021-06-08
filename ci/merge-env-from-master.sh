set -ex

export BASEDIR="`dirname $0`"
ENVNAME=$1

if [ -z "$ENVNAME" ]; then echo "Usage: deploy-env-from-master.sh env-name"; exit 1; fi

if [ -d "../formuladb-env" ] && cd ../formuladb-env ; then
    echo "using existing git repo"
else
    git clone 
fi
git checkout ${ENVNAME}
git pull origin ${ENVNAME} -Xtheirs

echo "== merging ${ENVNAME} into master ====================="
git checkout master
git pull origin master -Xtheirs
git merge --no-ff --no-commit ${ENVNAME} || true
for i in frmdb-apps/formuladb-io/_head.html db/pg_dump.sql.gz date.txt; do
    git reset HEAD $i
    git checkout -- $i
done
git diff-index --quiet HEAD || git commit -m "merged ${ENVNAME} into master"
git push origin master

echo "== merging master into ${ENVNAME} ====================="
git checkout ${ENVNAME}
git pull origin ${ENVNAME} -Xtheirs
git merge --no-ff --no-commit master || true
for i in frmdb-apps/formuladb-io/_head.html db/pg_dump.sql.gz date.txt; do
    git reset HEAD $i
    git checkout -- $i
done
git diff-index --quiet HEAD || git commit -m "merged master into ${ENVNAME}"

echo "== Pushing ${ENVNAME} env, there is a small time window between env pushing and image creation + sts patching... ==="
git push origin ${ENVNAME}
