Install docker toolbox: https://docs.docker.com/toolbox/toolbox_install_windows/
The run the following commands from Git Bash:

```bash
docker-machine.exe create docker1
eval $(docker-machine.exe env docker1 --shell bash)
VBoxManage controlvm "docker1" natpf1 "couchdb,tcp,,5984,,5984"
VBoxManage controlvm "docker1" natpf1 "couchdb,tcp,,8989,,8989"
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

```plantuml
A->B: asdasd
```