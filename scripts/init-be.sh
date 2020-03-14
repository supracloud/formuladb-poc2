set -ex

echo "env: $FRMDB_ENV_NAME"

export BASEDIR=`dirname $0`
export GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -i /ssh/frmdb.id_rsa"

if [ -n "$BUILD_DEVELOPMENT" ]; then 
    echo "using hostPath volume"
    mount
    ls /wwwroot/git/formuladb-env/db
else
    cd /wwwroot/git
    if [ ! -d "formuladb-env" ]; then

        if [[ "`git ls-remote --heads git@gitlab.formuladb.io:formuladb/formuladb-env.git \"${FRMDB_ENV_NAME}\"| wc -l`" -gt 0 ]]; then
            git clone --branch ${FRMDB_ENV_NAME} --single-branch --depth 1 git@gitlab.formuladb.io:formuladb/formuladb-env.git
        else
            cp -ar /formuladb-env /wwwroot/git/

            cd /wwwroot/git/formuladb-env
            git init
            git remote add origin git@gitlab.formuladb.io:formuladb/formuladb-env.git
            git config user.email "git.bot@formuladb.io"
            git config user.name "Git Bot"
        fi
    fi

    cd /wwwroot/git/formuladb-env
    if [[ "`git branch|grep '^*'|cut -d ' ' -f2`" == "${FRMDB_ENV_NAME}" ]]; then
        git pull origin ${FRMDB_ENV_NAME}
    else
        git config user.email "git.bot@formuladb.io"
        git config user.name "Git Bot"
        git checkout -b "${FRMDB_ENV_NAME}"
        git push --atomic --set-upstream origin "${FRMDB_ENV_NAME}"
    fi
fi

if [ -n "$BUILD_DEVELOPMENT" -o "staging" = "${FRMDB_ENV_NAME}" ]; then
    psql -e -h db -U postgres < /wwwroot/git/formuladb-env/db/pg_dump.schema.sql 
    for csv in /wwwroot/git/formuladb-env/db/*.csv; do 
        ls -lh $csv
        t=`basename $csv|sed -e 's/\.csv$//'`
        cat $csv | psql -h db -U postgres -c "
            CREATE TEMP TABLE tmp_table ON COMMIT DROP AS SELECT * FROM ${t} WITH NO DATA;
            COPY tmp_table FROM STDIN WITH CSV HEADER;
            INSERT INTO ${t} SELECT * FROM tmp_table ON CONFLICT DO NOTHING;
        " || true
    done
fi
