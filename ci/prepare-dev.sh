set -xe

# for puppeteer
# sudo apt-get install libxss1

bash ci/prepare-env.sh
if [ ! -d 'tsc-out' ]; then
    npm run compile
    npm run bundle -- --watch --mode development
fi

perl -p -i -e 's!path: .*#TDB_PWD_ENV_DIR!path: '${PWD/\/mnt/}'/git #TDB_PWD_ENV_DIR!' k8s/overlays/development/patches/be-deployment.yaml
