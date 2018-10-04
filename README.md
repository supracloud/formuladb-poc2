# Febe

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.4.3.

[![Coverage report](https://gitlab.com/metawiz/febe/badges/master/coverage.svg)](https://metawiz.gitlab.io/febe/)

## 1. Development

### 1.2 Running 

```bash
# Terminal 1. start angular app
./node_modules/.bin/ng serve --proxy-config proxy.config.json
# Terminal 2. start backend
cd server && npm run serve
# Terminal 3. start unit tests
./node_modules/.bin/ng test -w
# Terminal 4. start unit tests
cd server && npm test -- -w --watch-extensions ts
# Terminal 5. start e2e tests
npm run e2e:watch
```

### 1.3 Test gitlab ci locally

```bash
rsync.exe -auv --exclude node_modules --exclude .git febe febe.bak
cd febe.bak
MSYS_NO_PATHCONV=1 docker run -it -v $PWD:/febe --name node node:latest sh
cd /febe/server
npm install
npm run e2e_serve
```

### 1.4 Setting up CouchDB and test data (not used anymore, using in-memory pouchdb-server)

Install docker toolbox: https://docs.docker.com/toolbox/toolbox_install_windows/
The run the following commands from Git Bash:

```bash
docker-machine.exe create docker1
eval $(docker-machine.exe env docker1 --shell bash)
VBoxManage controlvm "docker1" natpf1 "couchdb,tcp,,5984,,5984"
docker run -d --name cdb -p 5984:5984 couchdb
curl -X PUT http://127.0.0.1:5984/_users
curl -X PUT http://127.0.0.1:5984/_replicator
curl -X PUT http://127.0.0.1:5984/_global_changes
curl -X PUT http://127.0.0.1:5984/mwzhistory
curl -X PUT http://127.0.0.1:5984/mwztransactions

npm install -g add-cors-to-couchdb
add-cors-to-couchdb
```

Then load test data:

```bash
./node_modules/.bin/tsc # compile the test data loader
node dist/out-tsc/src/app/test/mocks/loadTestData.js
```

```bash
curl -X DELETE http://127.0.0.1:5984/mwzhistory
curl -X PUT http://127.0.0.1:5984/mwzhistory
node dist/out-tsc/src/app/test/mocks/loadTestData.js >log 2>&1
grep -i error log
```

#### traffic shaping (IGNORE, NOT WORKING)

```bash
docker-machine.exe create docker1
eval $(docker-machine.exe env docker1 --shell bash)
cd docker
docker build -t mycouchdb .
MSYS_NO_PATHCONV=1 docker run --privileged -d --name cdb -p 5984:5984 mycouchdb


IGNORE NETWORK SHAPING FOR NOW...it does not work
docker exec -it cdb tc qdisc change dev eth0 root netem delay 150ms
RTNETLINK answers: No such file or directory... WTF!!!! ignore for now, but we should really test with high latency and low throughput network links, developing and testing at loopback network speed is asking for trouble !!!!

/wondershaper.sh -a eth0 -d 256 -u 256 #also does not work WTF
# we should use trickle for user-space traffic shaping
```

## 2. Production

TODO

