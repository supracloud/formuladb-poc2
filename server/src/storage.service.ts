import * as PouchDB from 'pouchdb';//this does not work with webpack, use this when running on nodejs
PouchDB.debug.enable('*');

import { PersistenceService } from "../../src/app/persistence.service";

export class StorageService extends PersistenceService {

    private remoteDataDBUrl = 'http://localhost:5984/mwzdata';
    public dataDB;
    public eventsDB;
    public notifsDB;

    constructor() {
        super();
        this.dataDB = new PouchDB("http://localhost:5984/mwzdata");
        this.eventsDB = new PouchDB("http://localhost:5984/mwzevents");
        this.notifsDB = new PouchDB("http://localhost:5984/mwznotifs");
    }
}
