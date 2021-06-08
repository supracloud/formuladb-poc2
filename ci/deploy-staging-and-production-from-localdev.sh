set -ex

export BASEDIR="${PWD}/`dirname $0`"

deploy-prodenv-from-localdev() {
    ENVNAME=$1
    bash $BASEDIR/deploy-env-from-master.sh $ENVNAME
    bash $BASEDIR/deploy-be-from-localdev.sh "$ENVNAME"
}

deploy-prodenv-from-localdev staging
# deploy-prodenv-from-localdev production
