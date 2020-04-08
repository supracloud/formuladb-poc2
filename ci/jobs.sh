#!/bin/bash
set -Ee

trap _cleanup ERR
trap _cleanup EXIT

FRMDB_ENV_NAME="n${CI_COMMIT_SHA}"
if [[ "n" = "$FRMDB_ENV_NAME" ]]; then
    FRMDB_ENV_NAME="n`git log -1 --format=%H`"
fi
echo "FRMDB_ENV_NAME=${FRMDB_ENV_NAME}"
export FRMDB_ENV_NAME
export BASEDIR=`dirname $0`

function _cleanup {
    /usr/bin/killall -q kubectl || true
    /usr/bin/killall -q node || true
    docker ps|grep "${FRMDB_ENV_NAME}-stress" |cut -d' ' -f1|xargs docker rm -f || true
    docker ps|grep "${FRMDB_ENV_NAME}-pg" |cut -d' ' -f1|xargs docker rm -f || true
}

function build_images_and_deploy {
    set -x
    
    NAMESPACE=$1
    if [ -z "$NAMESPACE" ]; then echo "pls provide NAMESPACE"; exit 1; fi
    SKAFFOLD_PROFILE=$2
    if [ -z "$SKAFFOLD_PROFILE" ]; then echo "pls provide SKAFFOLD_PROFILE"; exit 2; fi

    bash $BASEDIR/prepare-env.sh "$NAMESPACE"
    bash $BASEDIR/../scripts/prepare-env.sh "$NAMESPACE"
    skaffold -n $NAMESPACE run -p $SKAFFOLD_PROFILE

    # while ! kubectl -n $NAMESPACE get pods | grep 'db-.*Running'; do sleep 1; done
    # POD=`kubectl -n $NAMESPACE get pod -l service=db -o jsonpath='{.items[0].metadata.name}'`
    # nc -z localhost 5432 || kubectl -n $NAMESPACE port-forward $POD 5432:5432 &
    # while ! nc -z localhost 5432; do sleep 1; done
    # npm run e2e:data

    while ! kubectl -n $NAMESPACE get pods | grep 'db-.*Running'; do sleep 2; done
    while ! kubectl -n $NAMESPACE get pods | grep 'be-.*Running'; do sleep 2; done
    while ! curl -L "http://$NAMESPACE.formuladb.io/formuladb-api/hotel-booking/schema" | grep 'RoomType'; do 
        echo "== be not started yet ==================================================="
        kubectl -n "$NAMESPACE" logs service/be | head -100
        sleep 10; 
    done
}

function build_images_and_deploy_dev {
    build_images_and_deploy "$FRMDB_ENV_NAME" ci
}

function test_postgres {
    # POD=`kubectl -n $FRMDB_ENV_NAME get pod -l service=db -o jsonpath='{.items[0].metadata.name}'`
    # nc -z localhost 5432 || kubectl -n $FRMDB_ENV_NAME port-forward $POD 5432:5432 &
    docker ps|grep "${FRMDB_ENV_NAME}-pg" |cut -d' ' -f1|xargs docker rm -f || true
    while nc -z localhost 5434; do echo "port 5434 is busy, waiting..."; docker ps; sleep 2; done
    docker run --name "${FRMDB_ENV_NAME}-pg" -p5434:5432 -e POSTGRES_PASSWORD=postgres postgres:11 &
    while ! nc -z localhost 5434; do sleep 1; done
    docker exec "${FRMDB_ENV_NAME}-pg" sh -c 'until pg_isready -t 1; do echo waiting for database; sleep 2; done;'
    PGPORT=5434 FRMDB_STORAGE=postgres npm test
    docker ps|grep "${FRMDB_ENV_NAME}-pg" |cut -d' ' -f1|xargs docker rm -f
}

function test_stress {
    # npm test -- core/src/frmdb_engine.stress.spec.ts
    # POD=`kubectl -n $FRMDB_ENV_NAME get pod -l service=db -o jsonpath='{.items[0].metadata.name}'`
    # nc -z localhost 5432 || kubectl -n $FRMDB_ENV_NAME port-forward $POD 5432:5432 &
    docker ps|grep "${FRMDB_ENV_NAME}-stress" |cut -d' ' -f1|xargs docker rm -f || true
    while nc -z localhost 5435; do echo "port 5435 is busy, waiting..."; docker ps; sleep 2; done
    docker run --name "${FRMDB_ENV_NAME}-stress" -p5435:5432 -e POSTGRES_PASSWORD=postgres postgres:11 &
    while ! nc -z localhost 5435; do sleep 1; done
    docker exec "${FRMDB_ENV_NAME}-stress" sh -c 'until pg_isready -t 1; do echo waiting for database; sleep 2; done;'
    PGPORT=5435 FRMDB_STORAGE=postgres npm test -- core/src/frmdb_engine.stress.spec.ts
    docker ps|grep "${FRMDB_ENV_NAME}-stress" |cut -d' ' -f1|xargs docker rm -f
}

function test_e2e {
    set -x

    if [ ! -d "formuladb-e2e" ]; then
        chmod og-rwx ssh
        chmod og-r ssh/*
        chmod uog-wx ssh/*
        pwd
        export GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -i $PWD/ssh/frmdb.id_rsa"
        if [[ "`git ls-remote --heads git@gitlab.com:metawiz/formuladb-e2e.git \"${FRMDB_ENV_NAME}\"| wc -l`" -gt 0 ]]; then
            git clone --branch ${FRMDB_ENV_NAME} --single-branch --depth 1 git@gitlab.com:metawiz/formuladb-e2e.git
        else
            git clone --branch master --single-branch --depth 1 git@gitlab.com:metawiz/formuladb-e2e.git
        fi

        cd formuladb-e2e
        npm install
        npm run compile
    else
        cd formuladb-e2e
    fi

    FRMDB_ENV_NAME=$1
    if [ -z "FRMDB_ENV_NAME" ]; then echo "pls provide FRMDB_ENV_NAME"; exit 1; fi
    URL=$2
    if [ -z "URL" ]; then echo "pls provide URL"; exit 2; fi
    SUCCESS_RATE=$3

    # POD=`kubectl -n $FRMDB_ENV_NAME get pod -l service=be -o jsonpath='{.items[0].metadata.name}'`
    # nc -z localhost 8084 || kubectl -n $FRMDB_ENV_NAME port-forward $POD 8084:3000 &
    while ! curl $URL/formuladb-api/hotel-booking/schema | grep 'RoomType'; do sleep 2; done

    npm run test-headless -- -- --specs \
        "tsc-out/docs/1-Intro/6-editor-tables-list.e2e.js,tsc-out/docs/0-GetStarted/7-list-of-pages.e2e.js"
}

function e2e_dev_env {
    set -x

    if ! curl http://$FRMDB_ENV_NAME.formuladb.io/formuladb-api/formuladb-io/schema | grep 'SampleApp'; then
        echo "== ERROR: be not started yet ! "
        kubectl -n "$FRMDB_ENV_NAME" logs service/be
    fi

    test_e2e "$FRMDB_ENV_NAME" "http://$FRMDB_ENV_NAME.formuladb.io" 20
}

function build_images_and_deploy_staging {
    build_images_and_deploy staging client
}

function e2e_staging {
    while ! curl -s https://staging.formuladb.io/formuladb-api/formuladb-io/schema | grep 'SampleApp'; do sleep 2; done
    # how to upgrade test data without deleting existing user data?
    test_e2e staging "https://staging.formuladb.io" 100
}

function build_images_and_deploy_production {
    build_images_and_deploy production production
}

function e2e_production {
    while ! curl -s https://staging.formuladb.io/formuladb-api/formuladb-io/schema | grep 'SampleApp'; do sleep 2; done
    #WARNING: make sure only safe tests
    echo test_e2e production "https://formuladb.io" 100
}

function cleanup {
    set -x
    docker system prune -af
    docker ps|grep "${FRMDB_ENV_NAME}" |cut -d' ' -f1|xargs docker rm -f
    find /home/gitlab-runner/cache/ -type f -mmin +60 -delete
    # cleanup registry: BE development images in febe project
    bash ./ci/cleanup-docker-registry.sh mfDqKQ6zwhZaszaNpUys 4245551 398919 7
    namespacesToDelete=`kubectl get namespaces|egrep '[0-9a-f]{40} .*Active.*  [0-9][0-9]*[0-9]d$'|egrep -o "n[0-9a-f]{40}" || true`
    if [[ -n "$namespacesToDelete" ]]; then kubectl delete namespace $namespacesToDelete; fi
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
