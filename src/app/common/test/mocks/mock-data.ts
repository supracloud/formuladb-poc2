import * as _ from 'lodash';
import * as metadata from './mock-metadata';
import { Entity, EntityProperty, PropertyTypeN, ReferencedEntity, propertiesWithNamesOf, getEntityIdFromDeepPath, EntityPropertiesWithNames } from '../../domain/metadata/entity'
import { DataObj } from "../../domain/metadata/data_obj";
import { queryObjectWithDeepPath, SubObj } from '../../domain/base_obj';

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
        return Array.from(this.mockDB.get(path).values());
    }

    public get(path: string, id: string): DataObj {
        return this.mockDB.get(path).get(id);
    }

    mockEntities(entity: Entity, entitiesIndexes: number[]) {
        return entitiesIndexes.map(i => this.mockEntity(entity, i));
    }

    getRefDataObj(path: string, ref: ReferencedEntity, refIdx: number): SubObj {
        let db: Map<string, DataObj> = this.mockDB.get(getEntityIdFromDeepPath(ref.deepPath));
        if (null == db) throw new Error("Dependent entity " + ref.deepPath + " not mocked yet for " + path);
        let values = Array.from(db.values());
        if (values.length <= refIdx) throw new Error("Dependent entity " + ref.deepPath + " for " + path + " has fewer values " + values.length + " than expected " + refIdx);
        let refObj = values[refIdx];
        let ret = queryObjectWithDeepPath(refObj, ref.deepPath.replace('/@', '/0'), ref.copiedProperties);
        ret = (ret instanceof Array) ? ret[0] : ret;
        ret._id = 'UUID-' + ret.ref_;
        return ret;
    }

    mockEntity(entity: Entity, entityIdx: number): DataObj {
        let db: Map<string, DataObj> = this.mockDB.get(entity._id);
        if (null == db) {
            db = new Map();
            this.mockDB.set(entity._id, db);
        }
        this.mockDB.set(entity._id, db);
        let ret = { type_: entity._id, _id: `UUID-${entity._id.replace(/^\//,'').replace(/\//g, '-')}:${entityIdx}` };

        this.mockObject(entity._id, propertiesWithNamesOf(entity), ret, entityIdx);

        db.set(ret._id, ret);
        this.allData.push(ret);
        return ret;
    }

    mockObject(path: string, properties: EntityPropertiesWithNames, ret: SubObj, entityIdx: number): SubObj {
        properties.forEach((p, index) => {
            let subId = entityIdx * 100 + index;

            if (p.name == "_id") {
                //already set above
            } else if (p.name == "_rev") {
                //do nothing
            } else if (p.name == "type_") {
                //do nothing
            } else if (p.prop.propType_ == PropertyTypeN.NUMBER) {
                ret[p.name] = subId;
            } else if (p.prop.propType_ == PropertyTypeN.STRING) {
                ret[p.name] = p.name + subId;
            } else if (p.prop.propType_ == PropertyTypeN.TEXT) {
                ret[p.name] = p.name + "_" + p.name + "_" + p.name + "_" + p.name + "_" + p.name + "_" + subId;
            } else if (p.prop.propType_ == PropertyTypeN.DATETIME) {
                ret[p.name] = new Date();
            } else if (p.prop.propType_ == PropertyTypeN.EXTEND_ENTITY) {
                let o = this.mockObject(path, propertiesWithNamesOf(p.prop), {}, subId);
                o._id = `UUID-${path.replace(/^\//,'').replace(/\//g, '-')}-t-${subId}`;
                ret[p.name] = o;
            } else if (p.prop.propType_ == PropertyTypeN.REFERENCE_ENTITY) {
                let refIdx = subId % 3;
                let refDeepPath = p.prop.entity.deepPath;
                ret[p.name] = this.getRefDataObj(path, p.prop.entity, refIdx);
            } else if (p.prop.propType_ == PropertyTypeN.TABLE) {
                let table = [];
                for (var i = 0; i < 3; i++) {
                    let j = subId * 10 + i;
                    let o = this.mockObject(path, propertiesWithNamesOf(p.prop), {}, j);
                    o._id = `UUID-${path.replace(/^\//,'').replace(/\//g, '-')}-t-${j}`;
                    table.push(o);
                }
                ret[p.name] = table;
            }
        });

        return ret;
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
