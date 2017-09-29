import { Injectable } from '@angular/core';

import { Subject }    from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscribable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

// import { mockData } from '../mocks/mock-data';
// import { MockMetadata } from '../mocks/mock-metadata';

import { BaseObj } from './domain/base_obj';
import { Form } from './domain/uimetadata/form';
import { Table } from './domain/uimetadata/table';
import { DataObj } from './domain/metadata/data_obj';
import { Entity } from './domain/metadata/entity';

import { TableColumn } from './domain/uimetadata/table';

export type MwzFilter<T> = {_id: string};

export interface MwzTopic<VAL extends BaseObj> {
    setFilter(filter: MwzFilter<VAL>);
    observable(): Observable<VAL>;
    set(id: string, value: VAL);
    destroy();
}

export class MockTopic<VAL extends BaseObj> implements MwzTopic<VAL> {
    private subject: Subject<VAL> = new Subject();

    public constructor(private filter: MwzFilter<VAL>, private mockDB: Map<string, any>) {
    }

    setFilter(filter: MwzFilter<VAL>) {
        this.filter = filter;
    }
    observable(): Observable<VAL> {
        return this.subject.filter(v => this.matchFilter(v));
    }

    set(id: string, value: VAL) {
        console.log("MwzTopic.set ", id, value);
        setTimeout(_ => {
            this.mockDB.set(id, value);
            this.subject.next(value);
        }, Math.random() * 250);
    }

    destroy() {
        console.log("MwzTopic " + this.filter + " destroyed");
    }
    
    private matchFilter(obj: any): boolean {
        return null == this.filter? true : obj._id === this.filter._id;
    }
}

@Injectable()
export class BackendService {

    private mockBakendDB: Map<string, any> = new Map();

    constructor() {
    }

    public setPath(path: string) {
        
    }
    
    getMetadataCatalog() {
        let ret = [];
        this.mockBakendDB.forEach((v) => {
            if (v.mwzType == 'Entity_') ret.push(v);
        });
        return Promise.resolve(ret);
    }

    private getDefaultForm(entity: Entity): Form {
        let form = new Form();
        form = { nodeName: 'mwz-gridster', mwzType: "Form_" };
        form.childNodes = entity.properties.map((prop, idx) => ({
            nodeName: 'mwz-gridster-row',
            childNodes: [{
                nodeName: 'mwz-gridster-col',
                childNodes: [{
                    nodeName: 'mwz-input',
                    attributes: { formControlName: prop.name }
                }]
            }]
        }));
        return form;
    }

    private getDefaultTable(entity: Entity): Table {
        let table = new Table();
        table.columns = entity.properties.map((prop, idx) => new TableColumn(prop.name, prop.type));
        return table;
    }
}
