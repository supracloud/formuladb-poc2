#!/bin/bash
set -Ee

trap _cleanup ERR
trap _cleanup EXIT

ORGANIZ_NAME="t$CI_COMMIT_SHA"
if [ -z "$ORGANIZ_NAME" ]; then 
    ORGANIZ_NAME="t`git rev-parse HEAD`"
fi
echo "ORGANIZ_NAME=${ORGANIZ_NAME}"
export ORGANIZ_NAME
export KUBECONFIG=k8s/production-kube-config.conf
export BASEDIR=`dirname $0`

function _cleanup {
    /usr/bin/killall -q kubectl || true
    /usr/bin/killall -q node || true
}

function build_images_and_deploy {
    NAMESPACE=$1
    if [ -z "$NAMESPACE" ]; then echo "pls provide NAMESPACE"; exit 1; fi
    SKAFFOLD_PROFILE=$2
    if [ -z "$SKAFFOLD_PROFILE" ]; then echo "pls provide SKAFFOLD_PROFILE"; exit 2; fi

    bash $BASEDIR/prepare-organization.sh "$NAMESPACE" "$SKAFFOLD_PROFILE"
    skaffold -n $NAMESPACE run -p $SKAFFOLD_PROFILE
    while ! kubectl -n $NAMESPACE get pods | grep 'be-'; do sleep 1; done
    while ! kubectl -n $NAMESPACE get pods | grep 'db-.*Running'; do sleep 1; done
    POD=`kubectl -n $NAMESPACE get pod -l service=db -o jsonpath='{.items[0].metadata.name}'`
    nc -z localhost 5432 || kubectl -n $NAMESPACE port-forward $POD 5432:5432 &
    while ! nc -z localhost 5432; do sleep 1; done
    npm run e2e:data
}

function build_images_and_deploy_dev {
    build_images_and_deploy "$ORGANIZ_NAME" dev
}

function test_postgres {
    POD=`kubectl -n $ORGANIZ_NAME get pod -l service=db -o jsonpath='{.items[0].metadata.name}'`
    nc -z localhost 5432 || kubectl -n $ORGANIZ_NAME port-forward $POD 5432:5432 &
    while ! nc -z localhost 5432; do sleep 1; done
    FRMDB_STORAGE=postgres npm test
}

function test_stress {
    npm test -- core/src/frmdb_engine.stress.spec.ts
    POD=`kubectl -n $ORGANIZ_NAME get pod -l service=db -o jsonpath='{.items[0].metadata.name}'`
    nc -z localhost 5432 || kubectl -n $ORGANIZ_NAME port-forward $POD 5432:5432 &
    while ! nc -z localhost 5432; do sleep 1; done
    FRMDB_STORAGE=postgres npm test -- core/src/frmdb_engine.stress.spec.ts
}

function test_e2e {
    ORGANIZ_NAME=$1
    if [ -z "ORGANIZ_NAME" ]; then echo "pls provide ORGANIZ_NAME"; exit 1; fi

    POD=`kubectl -n $ORGANIZ_NAME get pod -l service=be -o jsonpath='{.items[0].metadata.name}'`
    nc -z localhost 8084 || kubectl -n $ORGANIZ_NAME port-forward $POD 8084:8084 &
    npm run webdriver-update
    TARGET=headless npm run test:e2e -- --baseUrl='http://localhost:8084'
}

function e2e_dev_env {
    test_e2e "$ORGANIZ_NAME"
}

function build_images_and_deploy_staging {
    build_images_and_deploy staging staging
}

function e2e_staging {
    test_e2e staging
}

function build_images_and_deploy_production {
    build_images_and_deploy production production
}

function e2e_production {
    test_e2e production #make sure only safe tests
}

function cleanup {
    docker system prune -af
    find /home/gitlab-runner/cache/ -type f -mmin +60 -delete
    # cleanup registry: BE development images in febe project
    bash ./ci/cleanup-docker-registry.sh mfDqKQ6zwhZaszaNpUys 4245551 398919 7
}

eval $1
