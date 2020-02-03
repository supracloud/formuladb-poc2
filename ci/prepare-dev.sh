set -xe

bash ci/prepare-env.sh
if [ ! -d 'tsc-out' ]; then
    npm run compile
    npm run bundle -- --watch --mode development
fi
