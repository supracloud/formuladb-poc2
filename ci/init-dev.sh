set -xe

export BASEDIR="${PWD}/`dirname $0`"

# for puppeteer
# sudo apt-get install libxss1

FRMDB_ENV_NAME="`git branch|grep '^*'|cut -d ' ' -f2`"

cd git/formuladb-env
git checkout -b "$FRMDB_ENV_NAME"
git push origin "$FRMDB_ENV_NAME"
