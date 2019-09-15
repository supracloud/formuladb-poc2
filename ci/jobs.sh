#!/bin/bash
set -Ee

trap _cleanup ERR
trap _cleanup EXIT

function _cleanup {
    /usr/bin/killall -q kubectl || true
    /usr/bin/killall -q node || true
}

function build_images_and_deploy_dev {
    sh tools/deploy-k3s.sh
    export KUBECONFIG=`k3d get-kubeconfig`
    skaffold run -p dev
}

function test_postgres {
    export KUBECONFIG=`k3d get-kubeconfig`
    POD=`kubectl get pod -l service=db -o jsonpath='{.items[0].metadata.name}'`
    nc -z localhost 5432 || kubectl port-forward $POD 5432:5432 &
    while ! nc -z localhost 5432; do sleep 1; done
    FRMDB_STORAGE=postgres npm test
}

function test_stress {
    npm test -- core/src/frmdb_engine.stress.spec.ts
    export KUBECONFIG=`k3d get-kubeconfig`
    POD=`kubectl get pod -l service=db -o jsonpath='{.items[0].metadata.name}'`
    nc -z localhost 5432 || kubectl port-forward $POD 5432:5432 &
    while ! nc -z localhost 5432; do sleep 1; done
    FRMDB_STORAGE=postgres npm test -- core/src/frmdb_engine.stress.spec.ts
}

function e2e_dev_env {
    export KUBECONFIG=`k3d get-kubeconfig`
    POD=`kubectl get pod -l service=lb -o jsonpath='{.items[0].metadata.name}'`
    nc -z localhost 8085 || kubectl port-forward $POD 8085:80 &
    bash serve.sh &
    TARGET=headless protractor --baseUrl='http://localhost:8081' e2e/protractor.conf.js
#    - skaffold delete
}

function publish_static_assets {
    git clone https://gitlab-ci-token:${CI_JOB_TOKEN}@gitlab.com/frmdb-apps/ci-tools.git
    cd ci-tools
    npm install
    source tools.sh
    cd ..
    export NODE_PATH=`pwd`/ci-tools/node_modules
    # publish elastic APM RUM
    curl -L -O https://github.com/elastic/apm-agent-rum-js/releases/latest/download/elastic-apm-rum.umd.min.js
    upload-assets elastic-apm-rum.umd.min.js
    # publish vvvebj on GCloud
    upload-assets `find vvvebjs -type f -print`
    # publish FE on GCloud
    mkdir -p dist/fe
    cp fe/js/*js dist-fe/frmdb-fe.js dist-fe/frmdb-data-grid.js dist-fe/frmdb-editor.js dist/fe
    cp -ar fe/img dist/fe/
    cd dist
    upload-assets `find -type f -printf '%P\n'`
}

function deploy_staging {
    export KUBECONFIG=k8s/demo-kube-config.conf
    skaffold run -p staging
    POD=`kubectl get pod -l service=db -o jsonpath='{.items[0].metadata.name}'`
    nc -z localhost 5433 || kubectl port-forward $POD 5433:5432 &
    while ! nc -z localhost 5433; do sleep 1; done
    PGPORT=5433 npm run e2e:data
}

function e2e_demo_env {
    TARGET=headless protractor --baseUrl='https://demo.formuladb.io' e2e/protractor.conf.js
}

function deploy_production {
    export KUBECONFIG=k8s/production-kube-config.conf
    skaffold run
    POD=`kubectl get pod -l service=db -o jsonpath='{.items[0].metadata.name}'`
    nc -z localhost 5433 || kubectl port-forward $POD 5433:5432 &
    while ! nc -z localhost 5433; do sleep 1; done
    PGPORT=5433 npm run e2e:data
}

function e2e_production_env {
    TARGET=headless protractor --baseUrl='https://formuladb.io' e2e/protractor.conf.js
}

function cleanup {
    docker system prune -af
    find /home/gitlab-runner/cache/ -type f -mmin +60 -delete
    # cleanup registry: BE development images in febe project
    bash ./ci/cleanup-docker-registry.sh mfDqKQ6zwhZaszaNpUys 4245551 398919 7
}

eval $1
