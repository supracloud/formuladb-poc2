import { Injectable } from '@angular/core';

import { Subject }    from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscribable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/from';
import { from } from 'rxjs/observable/from';

import { BaseObj } from './domain/base_obj';
import { Form } from './domain/uimetadata/form';
import { Table } from './domain/uimetadata/table';
import { DataObj } from './domain/metadata/data_obj';
import { ChangeObj } from "./domain/change_obj";
import { Entity } from './domain/metadata/entity';

import { TableColumn } from './domain/uimetadata/table';

import { MockMetadata } from "./test/mocks/mock-metadata";
import { MockData } from "./test/mocks/mock-data";

export type MwzFilter<T> = {_id: string};

@Injectable()
export class BackendReadService {

    public mockData: MockData = new MockData();
    private mockMetadata = new MockMetadata();

    private currentUrl: { path: string, id: string } = { path: null, id: null };
    public table$ = new ReplaySubject<Table|ChangeObj<DataObj>[]>(2);
    public form$ = new ReplaySubject<Form|DataObj>(2);
    public tableForm$ = this.table$.merge(this.form$);
    
    constructor() {
    }

    public setCurrentPathAndId(path: string, id: string) {
        if (path === this.currentUrl.path && id === this.currentUrl.id) return;

        if (path !== this.currentUrl.path) {
            this.currentUrl.path = path;
            this.table$.next(getDefaultTable(this.mockMetadata.entitiesMap.get(path)));
            this.table$.next(this.mockData.getAll(path).map(o => new ChangeObj(o)));
            this.form$.next(getDefaultForm(this.mockMetadata.entitiesMap.get(path)));
        }

        if (id != this.currentUrl.id) {
            this.form$.next(this.mockData.get(path, id));
        }
        
        // setTimeout(() => {
        //     this.table$.next(getDefaultTable(this.mockMetadata.entitiesMap.get(path)));
        //     setTimeout(() => {
        //         this.table$.next(this.mockData.getAll(path).map(o => new ChangeObj(o)));
        //     }, 50);
        // }, 50);
    }
    
}

export function getDefaultForm(entity: Entity): Form {
    let form = new Form();
    form = { nodeName: 'form-grid', mwzType: "Form_" };
    form.childNodes = entity.properties.map((prop, idx) => ({
        nodeName: 'form-grid-row',
        childNodes: [{
            nodeName: 'form-grid-col',
            childNodes: [{
                nodeName: 'form-input',
                formControlName: prop.name
            }]
        }]
    }));
    return form;
}

export function getDefaultTable(entity: Entity): Table {
    if (null == entity) return null;
    
    let table = new Table();
    table.mwzType = 'Table_';
    table.columns = entity.properties.map((prop, idx) => new TableColumn(prop.name, prop.type));
    return table;
}
