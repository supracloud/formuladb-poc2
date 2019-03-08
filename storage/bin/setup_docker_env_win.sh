export DOCKER_HOST_NAME_FOR_CI=127.0.0.1
export DOCKER_HOST=tcp://127.0.0.1:2376
export DOCKER_TLS_VERIFY=""
export DOCKER_CERT_PATH=""
export COMPOSE_CONVERT_WINDOWS_PATHS=1

create-docker-env() {

    (
    set -x

    export MSYS_NO_PATHCONV=1
    export MSYS2_ARG_CONV_EXCL="*"
     
    if ! docker-machine.exe ls | grep docker1; then 
        
        echo "The following steps assume you have installed:
            - https://www.virtualbox.org/wiki/Downloads
            - https://docs.docker.com/toolbox/toolbox_install_windows/
         VBoxManage and docker* commands must be in your path.
        "
        
        docker-machine create --virtualbox-cpu-count "2" --virtualbox-memory "12000" --virtualbox-disk-size "60000" docker1
        eval $(docker-machine.exe env docker1 --shell bash)
        docker-machine ssh docker1 sudo sysctl -w vm.max_map_count=262144
        docker-machine ssh docker1 "if grep vm.max_map_count /etc/sysctl.conf; then sudo sed -i 's/vm.max_map_count=.*/vm.max_map_count=262144/' /etc/sysctl.conf; else echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf; fi"
		
        docker-machine ssh docker1 sudo mkdir /var/docker_volumes
        docker-machine ssh docker1 sudo chmod a+rwx /var/docker_volumes

        echo '{ "insecure-registries":["nexus.computaris.net:4436"] }' | docker-machine ssh "docker1" sudo tee /etc/docker/daemon.json
        
        VBoxManage controlvm "docker1" natpf1 "docker,tcp,,2376,,2376"
        VBoxManage controlvm "docker1" natpf1 "frmdb,tcp,,8084,,8084"
        VBoxManage controlvm "docker1" natpf1 "postgres,tcp,,5432,,5432"
        VBoxManage controlvm "docker1" natpf1 "postgres2,tcp,,5433,,5433"

        docker-machine stop docker1
        VBoxManage sharedfolder add "docker1" --name "d" --hostpath "d:/" --automount
        VBoxManage modifyvm docker1 --natdnshostresolver1 on
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

psql() {
    docker exec -it febe_db_1 psql -U postgres
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
    SCHEMA_FILE=$1
    PORT=$2
    curl -u foo:bar -XPUT  -H "Content-Type: application/json" -d@${SCHEMA_FILE} http://localhost:${PORT:-8084}/api/bla/schema
}
#putSchema customers/orbico/orbico-metadata.json
putBulk() {
    DATA_FILE=$1
    curl -u foo:bar -XPUT  -H "Content-Type: application/json" -d@${DATA_FILE} http://localhost:8084/api/bla/bulk
}

startFrmdb() {
    FRMDB_RELEASE=`git branch|grep '^\*'|sed -e 's/[*] //g'`
    # TODO: if release is not "master" or x.y.z replace tags for formuladb-fe and formuladb-be with "stopped"
    FRMDB_RELEASE=${FRMDB_RELEASE} docker-compose.exe up --remove-orphans --abort-on-container-exit
}

ssh-ci() {
    ssh -i ./ssh/frmdb.id_rsa root@46.101.228.142
}