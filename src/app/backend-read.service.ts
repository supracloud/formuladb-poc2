import { Injectable } from '@angular/core';

import { Subject }    from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscribable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import { from } from 'rxjs/observable/from';

import { BaseObj } from './domain/base_obj';
import { Form } from './domain/uimetadata/form';
import { Table } from './domain/uimetadata/table';
import { DataObj } from './domain/metadata/data_obj';
import { Entity } from './domain/metadata/entity';

import { TableColumn } from './domain/uimetadata/table';

import { MockMetadata } from "./test/mocks/mock-metadata";

export type MwzFilter<T> = {_id: string};

@Injectable()
export class BackendReadService {

    private mockBakendDB: Map<string, any> = new Map();
    private mockMetadata = new MockMetadata();
    private table$ = new Subject<Table>();

    constructor() {
    }

    public syncTable(path: string): Observable<Table> {
        this.table$.next(BackendReadService.getDefaultTable(this.mockMetadata.entitiesMap.get(path)));
        return this.table$;
    }
    
    getMetadataCatalog() {
        let ret = [];
        this.mockBakendDB.forEach((v) => {
            if (v.mwzType == 'Entity_') ret.push(v);
        });
        return Promise.resolve(ret);
    }

    public static getDefaultForm(entity: Entity): Form {
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

    public static getDefaultTable(entity: Entity): Table {
        if (null == entity) return null;
        
        let table = new Table();
        table.columns = entity.properties.map((prop, idx) => new TableColumn(prop.name, prop.type));
        return table;
    }
}
