/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import * as metadata from './mock-metadata';
import { Entity, EntityProperty, Pn, isSubEntityProperty, isSubTableProperty } from '../../domain/metadata/entity'
import { DataObj, parseDataObjId } from "../../domain/metadata/data_obj";
import { SubObj } from '../../domain/base_obj';
import { isForm } from '../../domain/uimetadata/form';
import { isTable } from '../../domain/uimetadata/table';

const nouns: string[] = ["Lama", "Basket", "Freckle", "Taco", "Suspect", "Ball", "Moustache", "Semantic", "Charlie", "Bouquet"];
const adjectives: string[] = ["Chic", "Cracked", "Tender", "Tourquoise", "Vengeful", "Cranberry", "Shy", "Liquid", "Whining"]

const mockData_General___Actor = [
    {_id: "General___Actor~~1", code: "c-General___Actor100", username: "username101", name: "NGeneral___Actor102", role: "role103", password: "password104", details: "details105", type: "type106", parent_code: "parent_code107", param1: "param1108", state: "state109"},
];
const mockData_General___Currency = [
    {_id: "General___Currency~~1", "rate1": 101,"rate2": 102,"rate3": 103,"rate4": 104,"rate5": 105},
];
const mockData_General___Person = [
    {_id: "General___Person~~1"},
];
const mockData_General___User = [
    {_id: "General___User~~1"},
];
const mockData_General___Client = [
    {_id: "General___Client~~1"},
];
const mockData_Inventory___Product = [
    {_id: "Inventory___Product~~1", code: "p1", barcode: "11111111", name: "Product1", description: "Product 1 Description lorem ipsum bla bla"},
];
const mockData_Inventory___Product___Location = [
    {_id: "Inventory___Product___Location~~1___1", locationCode: "Warehouse1", category: "C1", price: 12.5,received_stock__: 15, ordered_stock__: 14, available_stock__: 1},
];
const mockData_Inventory___ProductUnit = [
    {_id: "Inventory___ProductUnit~~1"},
];
const mockData_Inventory___Order = [
    {_id: "Inventory___Order~~1", sales_agent: "John Doe", creation_date: "2018-09-27"},
];
const mockData_Inventory___Order___Item = [
    { _id: "Inventory___Order___Item~~1___1", Inventory___Product___Location$product: {_id: "Inventory___Product___Location~~1___1"}, quantity: 10},
    { _id: "Inventory___Order___Item~~1___2", Inventory___Product___Location$product: {_id: "Inventory___Product___Location~~1___1"}, quantity: 4},
];
const mockData_Inventory___Receipt = [
    {_id: "Inventory___Receipt~~1"},
];
const mockData_Inventory___Receipt___Item = [
    { _id: "Inventory___Receipt___Item~~1___1", Inventory___Product___Location$product: {_id: "Inventory___Product___Location~~1___1"}, quantity: 10},
    { _id: "Inventory___Receipt___Item~~1___2", Inventory___Product___Location$product: {_id: "Inventory___Product___Location~~1___1"}, quantity: 5},
];

const mockData_Forms___ServiceForm = [
    {_id: "Forms___ServiceForm~~1"},
];
const mockData_Reports___DetailedCentralizerReport = [
    {_id: "Reports___DetailedCentralizerReport~~1"},
];
const mockData_Reports___ServiceCentralizerReport = [
    {_id: "Reports___ServiceCentralizerReport~~1"},
];

export class MockData {

    private mockDB: Map<String, Map<string, DataObj>> = new Map();
    private allData: DataObj[] = [];
    readonly GENERATE_DATA = true;

    public constructor(private entitiesMap: _.Dictionary<Entity>) {
        // this.mockData();
        this.setData();
    }

    public getAll() {
        return this.allData;
    }

    public getAllForPath(path: string): DataObj[] {
        return Array.from(this.mockDB.get(path)!.values());
    }

    public get(path: string, id: string): DataObj {
        return this.mockDB.get(path)!.get(id)!;
    }

    mockEntities(entity: Entity, entitiesIndexes: number[]) {
        return entitiesIndexes.map(i => this.mockEntity(entity, i));
    }

    getRefDataObj(path: string, referencedEntityName: string, snapshotCurrentValueOfProperties: string[], refIdx: number): SubObj {
        let db: Map<string, DataObj> = this.mockDB.get(referencedEntityName)!;
        if (null == db) throw new Error("Dependent entity " + referencedEntityName + " not mocked yet for " + path);
        let values = Array.from(db.values());
        if (values.length <= refIdx) throw new Error("Dependent entity " + referencedEntityName + " for " + path + " has fewer values " + values.length + " than expected " + refIdx);
        let refObj = values[refIdx];
        let ret = refObj;
        ret = (ret instanceof Array) ? ret[0] : ret;
        ret._id = path + '~~UUID-' + refIdx;
        return ret;
    }

    private dbForEntity(entityId: string): Map<string, DataObj> {
        let db: Map<string, DataObj> = this.mockDB.get(entityId)!;
        if (null == db) {
            db = new Map();
            this.mockDB.set(entityId, db);
        }
        return db;
    }

    setEntityObjs(dataObjs: DataObj[]) {
        let entityName = parseDataObjId(dataObjs[0]._id).entityName;
        let db: Map<string, DataObj> = this.dbForEntity(entityName)!;
        for (let obj of dataObjs) {
            db.set(obj._id, obj);
            this.allData.push(obj);
        }
    }

    mockEntity(entity: Entity, entityIdx: number): DataObj {
        let db: Map<string, DataObj> = this.dbForEntity(entity._id);
        let ret = { _id: entity._id + `~~UUID-${entity._id}-${entityIdx}` };

        this.mockObject(entity._id, _.values(entity.props), ret, entityIdx);

        db.set(ret._id, ret);
        this.allData.push(ret);
        return ret;
    }

    mockObject(path: string, properties: EntityProperty[], ret: SubObj, entityIdx: number): SubObj {
        properties.forEach((p, index) => {
            let subId = entityIdx * 100 + index;

            if (p.name == "_id") {
                //already set above
            } else if (p.name == "_rev") {
                //do nothing
            } else if (p.name == "code") {
                ret[p.name] =  'c-' + path.replace(/.*\//, '') + subId;
            } else if (p.name == "name") {
                ret[p.name] =  'N' + path.replace(/.*\//, '') + subId;
            } else if (p.propType_ == Pn.NUMBER) {
                ret[p.name] = subId;
            } else if (p.propType_ == Pn.STRING) {
                ret[p.name] = p.name + subId;
            } else if (p.propType_ == Pn.TEXT) {
                ret[p.name] = p.name + "_" + p.name + "_" + p.name + "_" + p.name + "_" + p.name + "_" + subId;
            } else if (p.propType_ == Pn.DATETIME) {
                ret[p.name] = new Date();
            } else if (p.propType_ == Pn.BELONGS_TO) {
                let refIdx = subId % 3;
                let refDeepPath = p.referencedEntityName;
                ret[p.name] = this.getRefDataObj(path, p.referencedEntityName, p.snapshotCurrentValueOfProperties, refIdx);
            } else if (isSubEntityProperty(p)) {
                let o = this.mockObject(path, _.values(p.props), {}, subId);
                o._id = `${path}~~UUID-${path}-t-${subId}`;
                ret[p.name] = o;
            } else if (isSubTableProperty(p)) {
                let table: SubObj[] = [];
                for (var i = 0; i < 3; i++) {
                    let j = subId * 10 + i;
                    let o = this.mockObject(path, _.values(p.props), {}, j);
                    o._id = `${path}~~UUID-${path}-t-${j}`;
                    table.push(o);
                }
                ret[p.name] = table;
            }
        });

        return ret;
    }

    mockData() {
        this.mockEntities(metadata.General___Actor, [1, 2, 3]);
        this.mockEntities(metadata.General___Currency, [1, 2, 3]);
        this.mockEntities(metadata.General___Person, [1, 2, 3]);
        this.mockEntities(metadata.General___User, [1, 2, 3]);
        this.mockEntities(metadata.General___Client, [1, 2, 3]);
        this.mockEntities(metadata.Inventory___Product, [1, 2, 3]);
        this.mockEntities(metadata.Inventory___ProductUnit, [1, 2, 3]);
        this.mockEntities(metadata.Inventory___Order, [1, 2, 3]);
        this.mockEntities(metadata.Inventory___Receipt, [1, 2, 3]);
        this.mockEntities(metadata.Forms___ServiceForm, [1, 2, 3]);
        this.mockEntities(metadata.Reports___DetailedCentralizerReport, [1, 2, 3]);
        this.mockEntities(metadata.Reports___ServiceCentralizerReport, [1, 2, 3]);
    }

    setData() {
        this.setEntityObjs(mockData_General___Actor);
        this.setEntityObjs(mockData_General___Currency);
        this.setEntityObjs(mockData_General___Person);
        this.setEntityObjs(mockData_General___User);
        this.setEntityObjs(mockData_General___Client);
        this.setEntityObjs(mockData_Inventory___Product);
        this.setEntityObjs(mockData_Inventory___Product___Location);
        this.setEntityObjs(mockData_Inventory___ProductUnit);
        this.setEntityObjs(mockData_Inventory___Order);
        this.setEntityObjs(mockData_Inventory___Order___Item);
        this.setEntityObjs(mockData_Inventory___Receipt);
        this.setEntityObjs(mockData_Inventory___Receipt___Item);
        this.setEntityObjs(mockData_Forms___ServiceForm);
        this.setEntityObjs(mockData_Reports___DetailedCentralizerReport);
        this.setEntityObjs(mockData_Reports___ServiceCentralizerReport);
    }
}
