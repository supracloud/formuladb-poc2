IMAGE_SUFIX=$1
DO_PUSH=$2

TAG=`git branch|grep '^\*'|sed -e 's/[*] //g'`
# TODO build docker image only if the TAG is master of x.y.z

docker build -t formuladb-${IMAGE_SUFIX} .
if [ -n "$DO_PUSH" ]; then
    docker tag formuladb-${IMAGE_SUFIX} registry.formuladb.io/formuladb/febe/formuladb-${IMAGE_SUFIX}:0.0.1
    docker push registry.formuladb.io/formuladb/febe/formuladb-${IMAGE_SUFIX}:0.0.1
fi
