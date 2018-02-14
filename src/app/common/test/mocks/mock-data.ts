import * as _ from 'lodash';
import * as metadata from './mock-metadata';
import { Entity, EntityProperty, PropertyTypeN, EntityProperties, ReferencedEntity } from '../../domain/metadata/entity'
import { getEntityIdFromDeepPath, getCopiedPropertiesFromReferencedObject } from "../../domain.utils";
import { DataObj } from "../../domain/metadata/data_obj";
import { getEntityPropertiesWithNames, EntityPropertiesWithNames } from "../../domain.utils";

const nouns: string[] = ["Lama", "Basket", "Freckle", "Taco", "Suspect", "Ball", "Moustache", "Semantic", "Charlie", "Bouquet"];
const adjectives: string[] = ["Chic", "Cracked", "Tender", "Tourquoise", "Vengeful", "Cranberry", "Shy", "Liquid", "Whining"]

export class MockData {

    private mockDB: Map<String, Map<string, DataObj>> = new Map();
    private allData: DataObj[] = [];

    public constructor(private entitiesMap: Map<string, Entity>) {
        this.mockData();
    }

    public getAll() {
        return this.allData;
    }

    public getAllForPath(path: string): DataObj[] {
        console.log("########", path, Array.from(this.mockDB.get(path).values()));
        return Array.from(this.mockDB.get(path).values());
    }

    public get(path: string, id: string): DataObj {
        return this.mockDB.get(path).get(id);
    }

    private getRandomId(): number {
        return Math.trunc(Math.random() * 10000);
    }

    mockEntities(entity: Entity, entitiesIndexes: number[]) {
        return entitiesIndexes.map(i => this.mockEntity(entity, i));
    }

    getRefDataObj(path: string, ref: ReferencedEntity, refIdx: number): any {
        let db: Map<string, DataObj> = this.mockDB.get(getEntityIdFromDeepPath(ref.deepPath));
        if (null == db) throw new Error("Dependent entity " + ref.deepPath + " not mocked yet for " + path);
        let values = Array.from(db.values());
        if (values.length <= refIdx) throw new Error("Dependent entity " + ref.deepPath + " for " + path + " has fewer values " + values.length + " than expected " + refIdx);
        let refObj = values[refIdx];
        let ret = getCopiedPropertiesFromReferencedObject(refObj, ref);
        return (ret instanceof Array) ? ret[0] : ret;
    }

    mockEntity(entity: Entity, entityIdx: number): DataObj {
        let db: Map<string, DataObj> = this.mockDB.get(entity._id);
        if (null == db) {
            db = new Map();
            this.mockDB.set(entity._id, db);
        }
        this.mockDB.set(entity._id, db);
        let ret = { type_: entity._id, _id: `${entity._id.replace(/\//g, '-')}:123400${entityIdx}` };

        this.mockObject(entity._id, getEntityPropertiesWithNames(entity.properties), ret);

        db.set(ret._id, ret);
        this.allData.push(ret);
        return ret;
    }

    mockObject(path: string, properties: EntityPropertiesWithNames, ret: {}): {} {
        properties.forEach((p, index) => {
            if (p.name == "_id") {
                //already set above
            } else if (p.name == "_rev") {
                //do nothing
            } else if (p.name == "type_") {
                //do nothing
            } else if (p.prop.type == PropertyTypeN.NUMBER) {
                ret[p.name] = Math.random() * 100;
            } else if (p.prop.type == PropertyTypeN.STRING) {
                ret[p.name] = p.name + Math.ceil(Math.random() * 100000);
            } else if (p.prop.type == PropertyTypeN.TEXT) {
                ret[p.name] = p.name + "_" + p.name + "_" + Math.random() * 10000;
            } else if (p.prop.type == PropertyTypeN.DATETIME) {
                ret[p.name] = new Date();
            } else if (p.prop.type == PropertyTypeN.EXTEND_ENTITY) {
                let refIdx = Math.round(Math.random() * 4);
                ret[p.name] = this.getRefDataObj(path, p.prop.entity, refIdx);
            } else if (p.prop.type == PropertyTypeN.REFERENCE_ENTITY) {
                let refIdx = Math.round(Math.random() * 4);
                let refDeepPath = p.prop.entity.deepPath;
                ret[p.name] = this.getRefDataObj(path, p.prop.entity, refIdx);
            } else if (p.prop.type == PropertyTypeN.TABLE) {
                let table = [];
                for (var i = 0; i < 5; i++) {
                    table.push(this.mockObject(path, getEntityPropertiesWithNames(p.prop.properties), {}));
                }
                ret[p.name] = table;
            }
        });

        return ret;
    }

    mockName(): string {
        return adjectives[Math.floor(Math.random() * adjectives.length)] + " " + nouns[Math.floor(Math.random() * nouns.length)];
    }

    mockData() {
        console.log("mockData called");
        this.mockEntities(metadata.General__Actor as Entity, [1, 2, 3, 4, 5]);
        this.mockEntities(metadata.General__Currency as Entity, [1, 2, 3, 4, 5]);
        this.mockEntities(metadata.General__Person as Entity, [1, 2, 3, 4, 5]);
        this.mockEntities(metadata.General__User as Entity, [1, 2, 3, 4, 5]);
        this.mockEntities(metadata.General__Client as Entity, [1, 2, 3, 4, 5]);
        this.mockEntities(metadata.Inventory__Product as Entity, [1, 2, 3, 4, 5]);
        this.mockEntities(metadata.Inventory__ProductUnit as Entity, [1, 2, 3, 4, 5]);
        this.mockEntities(metadata.Inventory__Order as Entity, [1, 2, 3, 4, 5]);
        this.mockEntities(metadata.Inventory__Receipt as Entity, [1, 2, 3, 4, 5]);
        this.mockEntities(metadata.Forms__ServiceForm as Entity, [1, 2, 3, 4, 5]);
        this.mockEntities(metadata.Reports__DetailedCentralizerReport as Entity, [1, 2, 3, 4, 5]);
        this.mockEntities(metadata.Reports__GenericReport as Entity, [1, 2, 3, 4, 5]);
        this.mockEntities(metadata.Reports__ServiceCentralizerReport as Entity, [1, 2, 3, 4, 5]);
    }

}
