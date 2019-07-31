export DOCKER_HOST_NAME_FOR_CI=127.0.0.1
export DOCKER_HOST=tcp://127.0.0.1:2376
export DOCKER_TLS_VERIFY=""
export DOCKER_CERT_PATH=""
export COMPOSE_CONVERT_WINDOWS_PATHS=1

export BASEDIR=/d/code/metawiz/febe
export FRMDB_RELEASE=${1:not_set_FRMDB_RELEASE}
export FRMDB_DEPLOYMENT_DIR=${2:EXAMPLES}
export PS1="(${FRMDB_DEPLOYMENT_DIR}) ${PS1}"
if [ `pwd -W 2>/dev/null` ]
then
    export GCLOUD_BASEDIR=`pwd -W`/gcloud/
else
    export GCLOUD_BASEDIR=`pwd`/gcloud/
fi
create-docker-env() {

    (
    set -x

    export MSYS_NO_PATHCONV=1
    export MSYS2_ARG_CONV_EXCL="*"
     
    if ! docker-machine.exe ls | grep docker1; then 
        
        echo "The following steps assume you have installed:
            - https://www.virtualbox.org/wiki/Downloads
            - https://docs.docker.com/toolbox/toolbox_install_windows/
         'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe' and docker* commands must be in your path.
        "
        
        docker-machine create --virtualbox-cpu-count "2" --virtualbox-memory "12000" --virtualbox-disk-size "60000" docker1
        eval $(docker-machine.exe env docker1 --shell bash)
        docker-machine ssh docker1 sudo sysctl -w vm.max_map_count=262144
        docker-machine ssh docker1 "if grep vm.max_map_count /etc/sysctl.conf; then sudo sed -i 's/vm.max_map_count=.*/vm.max_map_count=262144/' /etc/sysctl.conf; else echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf; fi"
		
        docker-machine ssh docker1 sudo mkdir /var/docker_volumes
        docker-machine ssh docker1 sudo chmod a+rwx /var/docker_volumes

        echo '{ "insecure-registries":["nexus.computaris.net:4436"] }' | docker-machine ssh "docker1" sudo tee /etc/docker/daemon.json
        
        'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe' controlvm "docker1" natpf1 "docker,tcp,,2376,,2376"
        'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe' controlvm "docker1" natpf1 "frmdb,tcp,,8084,,8084"
        'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe' controlvm "docker1" natpf1 "maps,tcp,,8085,,8085"
        'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe' controlvm "docker1" natpf1 "frmdb2,tcp,,8086,,8086"
        'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe' controlvm "docker1" natpf1 "maps2,tcp,,8088,,8088"
        'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe' controlvm "docker1" natpf1 "postgres,tcp,,5432,,5432"
        'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe' controlvm "docker1" natpf1 "postgres2,tcp,,5433,,5433"
        'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe' controlvm "docker1" natpf1 "minio,tcp,,9000,,9000"
        'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe' controlvm "docker1" natpf1 "orbico-nginx,tcp,,8990,,8990"
        'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe' controlvm "docker1" natpf1 "be-debug,tcp,,9231,,9231"
        'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe' controlvm "docker1" natpf1 "be-debug2,tcp,,5858,,5858"

        docker-machine stop docker1
        'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe' sharedfolder add "docker1" --name "d" --hostpath "d:/" --automount
        'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe' modifyvm docker1 --natdnshostresolver1 on
        docker-machine start docker1

        # disable TLS
        docker-machine ssh docker1 sudo sed -i 's/DOCKER_TLS=.*/DOCKER_TLS=no/' /var/lib/boot2docker/profile
        docker-machine ssh docker1 sudo /etc/init.d/docker restart

        docker-machine ssh docker1 sudo mkdir /var/docker_volumes
        docker-machine ssh docker1 sudo chmod a+rwx /var/docker_volumes

    else
         echo "machine already created"
         if docker-machine.exe ls | grep 'docker1.*Stopped'; then
             docker-machine start docker1
         fi
    fi
    )

    export DOCKER_HOST=tcp://127.0.0.1:2376
    export DOCKER_TLS_VERIFY=""
    export DOCKER_CERT_PATH=""
    export COMPOSE_CONVERT_WINDOWS_PATHS=1
}

pglogs() {
    docker logs -f febe_db_1
}
pg() {
    docker exec -it febe_db_1 bash
}
copy2pg() {
    docker cp $1 febe_db_1:/`basename $1`
}
putSchema() {
    APP_NAME=$1
    SCHEMA_FILE=$2
    PORT=$3
    curl -XPUT  -H "Content-Type: application/json" -d@${SCHEMA_FILE} http://localhost:${PORT:-3000}/formuladb-api/${APP_NAME}/schema
}
putApp() {
    APP_NAME=$1
    APP_FILE=$2
    PORT=$3
    curl -XPUT  -H "Content-Type: application/json" -d@${APP_FILE} http://localhost:${PORT:-3000}/formuladb-api/${APP_NAME}
}
putTable() {
    APP_NAME=$1
    TABLE_FILE=$2
    PORT=$3
    curl -XPUT  -H "Content-Type: application/json" -d@${TABLE_FILE} http://localhost:${PORT:-3000}/formuladb-api/${APP_NAME}/table
}
putForm() {
    APP_NAME=$1
    FORM_FILE=$2
    PORT=$3
    curl -XPUT  -H "Content-Type: application/json" -d@${FORM_FILE} http://localhost:${PORT:-3000}/formuladb-api/${APP_NAME}/form
}
putTableData() {
    APP_NAME=$1
    FORM_FILE=$2
    PORT=$3
    curl -XPUT  -H "Content-Type: application/json" -d@${FORM_FILE} http://localhost:${PORT:-3000}/formuladb-api/${APP_NAME}/form
}

## dump json example:
#  (echo '\t on'; echo '\pset format unaligned'; echo "select json_agg(r) from (select * from tmolreport('2019-04-01')) r;") | sudo -i -u postgres psql dacris

#curl -XPOST  -H "Content-Type: application/json" -d '{"username":"Fredrick51","password":"pass123!"}' http://localhost:${PORT:-3000}/formuladb-api/login
#curl -XPOST  -H "Content-Type: application/json" -d '{"username":"Fredrick51","password":"pass123!"}' http://localhost:3000/formuladb-api/bla/schema

#putSchema customers/orbico/orbico-metadata.json
putBulk() {
    APP_NAME=$1
    DATA_FILE=$2
    PORT=$3
    curl -XPUT  -H "Content-Type: application/json" -d@${DATA_FILE} http://localhost:${PORT:-3000}/formuladb-api/${APP_NAME}/bulk
}

rsync-deploy() {
    PORT=$1
    DST=$3

    rsync -avz --exclude node_modules --exclude .git --exclude .gitignore -e "ssh -p $PORT" ${BASEDIR}/../${FRMDB_DEPLOYMENT_DIR} ${DST}/
    rsync -avz ${BASEDIR}/docker-compose.yml -e "ssh -p $PORT" ${SRC_DIR} ${DST}/febe/
}
#rsync-deploy 4179 ../customer-dacris dacris@mail.dacris.ro:/opt/data/dacris/LIVE/formuladb

startFrmdb() {
    FRMDB_RELEASE=`git branch|grep '^\*'|sed -e 's/[*] //g'`
    # TODO: if release is not "master" or x.y.z replace tags for formuladb-fe and formuladb-be with "stopped"
    FRMDB_RELEASE=${FRMDB_RELEASE} docker-compose.exe up --remove-orphans --abort-on-container-exit
}

ssh-ci() {
    ssh -i ./ssh/frmdb.id_rsa root@34.73.93.144
}

ssh-demo() {
    ssh -i ./ssh/frmdb.id_rsa root@formuladb.online
}

upload-asset() {
    node -e "const {Storage} = require('@google-cloud/storage');\
             const storage = new Storage({keyFilename: '"$GCLOUD_BASEDIR"FormulaDB-storage-full.json'});\
             storage.bucket('formuladb-static-assets').upload('"$1"', {destination: '"$1"'}, function(err, file) {\
               if (!err) {\
                 console.log(file.name)\
               } else {\
                 console.log('error ', err.message)\
               }\
             })"
}

upload-all() {
    find vvvebjs/ -type f|egrep -v '\.git|./demo/|\.scss$|\.php$|\.map$|bootstrap.js' | while read i; do
        upload-asset "$i"
    done    
}
