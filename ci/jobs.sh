#!/bin/bash
set -Ee

trap _cleanup ERR
trap _cleanup EXIT

FRMDB_ENV_NAME="${CI_COMMIT_SHA}"
if [[ -z "$FRMDB_ENV_NAME" ]]; then
    FRMDB_ENV_NAME=`git log -1 --format=%H`
fi
echo "FRMDB_ENV_NAME=${FRMDB_ENV_NAME}"
export FRMDB_ENV_NAME
export BASEDIR=`dirname $0`

function _cleanup {
    /usr/bin/killall -q kubectl || true
    /usr/bin/killall -q node || true
}

function build_images_and_deploy {
    set -x
    chmod og-rwx ssh
    chmod og-r ssh/*
    chmod uog-wx ssh/*
    pwd
    GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -i $PWD/ssh/frmdb.id_rsa" git submodule update --init --jobs 5 --depth 1
    ls formuladb-env
    ls formuladb-e2e
    
    set -x
    NAMESPACE=$1
    if [ -z "$NAMESPACE" ]; then echo "pls provide NAMESPACE"; exit 1; fi
    SKAFFOLD_PROFILE=$2
    if [ -z "$SKAFFOLD_PROFILE" ]; then echo "pls provide SKAFFOLD_PROFILE"; exit 2; fi

    bash $BASEDIR/prepare-env.sh
    bash $BASEDIR/../scripts/prepare-env.sh
    skaffold -n $NAMESPACE run -p $SKAFFOLD_PROFILE

    # while ! kubectl -n $NAMESPACE get pods | grep 'db-.*Running'; do sleep 1; done
    # POD=`kubectl -n $NAMESPACE get pod -l service=db -o jsonpath='{.items[0].metadata.name}'`
    # nc -z localhost 5432 || kubectl -n $NAMESPACE port-forward $POD 5432:5432 &
    # while ! nc -z localhost 5432; do sleep 1; done
    # npm run e2e:data

    while ! kubectl -n $NAMESPACE get pods | grep 'db-.*Running'; do sleep 1; done
    while ! kubectl -n $NAMESPACE get pods | grep 'be-.*Running'; do sleep 1; done
    while ! kubectl -n "$NAMESPACE" exec service/be ls /wwwroot/git/formuladb-env/apps/Hotel_Booking | grep 'app.yaml'; do 
        sleep 1; 
        kubectl -n "$NAMESPACE" logs service/be
    done
    kubectl -n "$NAMESPACE" exec service/be -- node /dist-be/frmdb-be-load-test-data.js
}

function build_images_and_deploy_dev {
    build_images_and_deploy "$FRMDB_ENV_NAME" dev
}

function test_postgres {
    POD=`kubectl -n $FRMDB_ENV_NAME get pod -l service=db -o jsonpath='{.items[0].metadata.name}'`
    nc -z localhost 5432 || kubectl -n $FRMDB_ENV_NAME port-forward $POD 5432:5432 &
    while ! nc -z localhost 5432; do sleep 1; done
    FRMDB_STORAGE=postgres npm test
}

function test_stress {
    npm test -- core/src/frmdb_engine.stress.spec.ts
    POD=`kubectl -n $FRMDB_ENV_NAME get pod -l service=db -o jsonpath='{.items[0].metadata.name}'`
    nc -z localhost 5432 || kubectl -n $FRMDB_ENV_NAME port-forward $POD 5432:5432 &
    while ! nc -z localhost 5432; do sleep 1; done
    FRMDB_STORAGE=postgres npm test -- core/src/frmdb_engine.stress.spec.ts
}

function test_e2e {
    set -x

    FRMDB_ENV_NAME=$1
    if [ -z "FRMDB_ENV_NAME" ]; then echo "pls provide FRMDB_ENV_NAME"; exit 1; fi
    URL=$2
    if [ -z "URL" ]; then echo "pls provide URL"; exit 2; fi

    POD=`kubectl -n $FRMDB_ENV_NAME get pod -l service=be -o jsonpath='{.items[0].metadata.name}'`
    nc -z localhost 8084 || kubectl -n $FRMDB_ENV_NAME port-forward $POD 8084:3000 &

    cd ${BASEDIR}/../formuladb-e2e
    pwd
    npm install
    npm run compile
    npm run webdriver-update
    pwd
    cat package.json

    target=headless
    if uname -a | grep 'Linux.*Microsoft'; then 
        target=""
    fi
    TARGET=$target npm test -- --baseUrl="$URL"
}

function e2e_dev_env {
    # POD=`kubectl -n $FRMDB_ENV_NAME get pod -l service=db -o jsonpath='{.items[0].metadata.name}'`
    # nc -z localhost 5432 || kubectl -n $FRMDB_ENV_NAME port-forward $POD 5432:5432 &
    # while ! nc -z localhost 5432; do sleep 1; done
    # npm run e2e:data

    while ! kubectl -n "$FRMDB_ENV_NAME" get pods | grep 'be-.*Running'; do sleep 1; done

    # test_e2e "$FRMDB_ENV_NAME" "http://localhost:8084"
    test_e2e "$FRMDB_ENV_NAME" "http://$FRMDB_ENV_NAME.formuladb.io"
}

function build_images_and_deploy_staging {
    build_images_and_deploy staging staging
}

function e2e_staging {
    test_e2e staging "https://staging.formuladb.io"
}

function build_images_and_deploy_production {
    build_images_and_deploy production production
}

function e2e_production {
    #WARNING: make sure only safe tests
    test_e2e production "https://formuladb.io"
}

function cleanup {
    # docker system prune -af
    find /home/gitlab-runner/cache/ -type f -mmin +60 -delete
    # cleanup registry: BE development images in febe project
    bash ./ci/cleanup-docker-registry.sh mfDqKQ6zwhZaszaNpUys 4245551 398919 7
    kubectl get namespaces|egrep '[0-9a-f]{40} .*Active.*  [2-9][0-9]d$'|egrep -o "[0-9a-f]{40}" | xargs kubectl delete namespace
}

function e2e_staging_with_videos {
    npm install --only=dev
    docker run \
        --rm \
        --name e2e_staging_with_videos \
        --cap-add=SYS_ADMIN \
        --user $(id -u):$(id -g) \
        -v $PWD:/febe \
        -v /dev/shm:/dev/shm \
        registry.gitlab.com/metawiz/febe/ci-with-video:1.0.3 \
        bash -c 'source /bootstrap && TARGET=recordings-with-audio protractor e2e/protractor.conf.js --baseUrl="https://formuladb.io"'

        # bash -c 'source /bootstrap && 
        # curl -XGET --header "PRIVATE-TOKEN: RER-gkXZCCi8irBNsUgL" https://gitlab.com/api/v4/projects/metawiz%2Ffebe/repository/archive.tar.gz > febe.tgz &&
        # tar -xzvf febe.tgz &&
        # mv febe-master-* febe &&
        # cd febe &&
        # TARGET=recordings-with-audio protractor e2e/protractor.conf.js --baseUrl="https://staging.formuladb.io"'
}


function publish_static_assets() {
    echo ""
    #################
    # TODO publish static assets to git@gitlab.com:metawiz/formuladb-env.git
    #################

    # gsutil -m rsync -d -r apps/formuladb-internal/formuladb.io gs://formuladb-env/static-assets/$FRMDB_ENV_NAME/formuladb-internal/formuladb.io
    # gsutil -m rsync -d -r apps/formuladb-examples/hotel-booking gs://formuladb-env/static-assets/$FRMDB_ENV_NAME/formuladb-examples/hotel-booking

    # gsutil -m rsync -r vvvebjs gs://formuladb-env/static-assets/$FRMDB_ENV_NAME/formuladb-editor
    # gsutil -m rsync -x ".*.js.map$" -r formuladb gs://formuladb-env/static-assets/$FRMDB_ENV_NAME/formuladb
    # gsutil -m rsync -r fe/img gs://formuladb-env/static-assets/$FRMDB_ENV_NAME/formuladb/img
    # gsutil -m rsync -r fe/icons gs://formuladb-env/static-assets/$FRMDB_ENV_NAME/formuladb/icons

    # curl -L -O https://github.com/elastic/apm-agent-rum-js/releases/latest/download/elastic-apm-rum.umd.min.js
    # gsutil cp elastic-apm-rum.umd.min.js gs://formuladb-env/static-assets/$FRMDB_ENV_NAME/elastic-apm-rum.umd.min.js
}

eval $1
