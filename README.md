# Febe

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.4.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

# Couchdb setting up test data

Install docker toolbox: https://www.docker.com/products/docker-toolbox

docker-machine.exe create docker2

eval $(docker-machine.exe env docker2 --shell bash)

docker build -t mycouchdb .

MSYS_NO_PATHCONV=1 docker run --privileged -d --name cdb -p 5984:5984 mycouchdb


docker exec -it cdb tc qdisc change dev eth0 root netem delay 150ms
RTNETLINK answers: No such file or directory... WTF!!!!
        
        ignore this: /wondershaper.sh -a eth0 -d 256 -u 256

VBoxManage controlvm "docker2" natpf1 "couchdb,tcp,,5984,,5984"

Then follow:
http://docs.couchdb.org/en/master/install/setup.html#single-node-setup

Then Create 2 new databases called 'mwzdata' and 'mwzevents'

./node_modules/.bin/tsc # compile the test data loader
node dist/out-tsc/src/app/test/mocks/loadTestData.js

ng serve # & the usual stuff