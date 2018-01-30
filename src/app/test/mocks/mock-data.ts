import * as _ from 'lodash';
import * as metadata from './mock-metadata';
import { Entity, EntityProperty, PropertyTypeN } from '../../domain/metadata/entity'

import { DataObj } from "../../domain/metadata/data_obj";

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

  getRefDataObj(path: string, refPath: string, refIdx: number): DataObj {
    let db: Map<string, DataObj> = this.mockDB.get(refPath);
    console.log(db);
    if (null == db) throw new Error("Dependent entity " + refPath + " not mocked yet for " + path);
    let values = Array.from(db.values());
    if (values.length <= refIdx) throw new Error("Dependent entity " + refPath + " for " + path + " has fewer values " + values.length + " than expected " + refIdx);
    return values[refIdx];
  }

  mockEntity(entity: Entity, entityIdx: number): DataObj {
      let db: Map<string, DataObj> = this.mockDB.get(entity._id);
      if (null == db) {
        db = new Map();
        this.mockDB.set(entity._id, db);
      }
      this.mockDB.set(entity._id, db);
      let ret = { mwzType: entity._id, _id: `${entity._id}:123400${entityIdx}` };

      this.mockObject(entity._id, entity.properties, ret);

      db.set(ret._id, ret);
      this.allData.push(ret);
      return ret;
  }

  mockObject(path: string, properties: EntityProperty[], ret: {}): {} {
    properties.forEach((p, index) => {
      if (p.name == "_id") {
        //already set above
      } else if (p.name == "_rev") {
        //do nothing
      } else if (p.name == "mwzType") {
        //do nothing
      } else if (p.type == PropertyTypeN.NUMBER) {
        ret[p.name] = Math.random() * 100;
      } else if (p.type == PropertyTypeN.STRING) {
        ret[p.name] = p.name + Math.ceil(Math.random() * 100000);
      } else if (p.type == PropertyTypeN.TEXT) {
        ret[p.name] = p.name + "_" + p.name + "_" + Math.random() * 10000;
      } else if (p.type == PropertyTypeN.DATETIME) {
        ret[p.name] = new Date();
      } else if (p.type == PropertyTypeN.REFERENCE_ENTITY) {
        let refIdx = Math.round(Math.random() * 4);
        let refPath = p.entity.path;
        ret[p.name] = _.pick(this.getRefDataObj(path, refPath, refIdx), (p.entity.copiedProperties || []).concat(['_id', 'mwzType']));
      } else if (p.type == PropertyTypeN.TABLE) {
        if (p.entity != null) {
          let ref = this.entitiesMap.get(p.entity.path);
          ret[p.name] = this.mockEntities(ref, [this.getRandomId(), this.getRandomId(), this.getRandomId(), this.getRandomId()]);
        } else {
          let table = [];
          for (var i = 0; i < 5; i++) {
            table.push(this.mockObject(path, p.properties, {}));
          }
          ret[p.name] = table;
        }
      }
    });

    return ret;
  }

  mockName(): string {
    return adjectives[Math.floor(Math.random() * adjectives.length)] + " " + nouns[Math.floor(Math.random() * nouns.length)];
  }

  mockData() {
    console.log("mockData called");
    this.mockEntities(metadata.MockMetadata.General__Actor, [1, 2, 3, 4, 5]);
    this.mockEntities(metadata.MockMetadata.General__Currency, [1, 2, 3, 4, 5]);
    this.mockEntities(metadata.MockMetadata.General__Person, [1, 2, 3, 4, 5]);
    this.mockEntities(metadata.MockMetadata.General__User, [1, 2, 3, 4, 5]);
    this.mockEntities(metadata.MockMetadata.General__Client, [1, 2, 3, 4, 5]);
    this.mockEntities(metadata.Inventory__Product, [1, 2, 3, 4, 5]);
    this.mockEntities(metadata.Inventory__ProductUnit, [1, 2, 3, 4, 5]);
    this.mockEntities(metadata.Inventory__InventoryProduct, [1, 2, 3, 4, 5]);
    this.mockEntities(metadata.Inventory__OrderItem, [1, 2, 3, 4, 5]);
    this.mockEntities(metadata.Inventory__ReceiptItem, [1, 2, 3, 4, 5]);
    this.mockEntities(metadata.MockMetadata.Forms__Order, [1, 2, 3, 4, 5]);
    this.mockEntities(metadata.MockMetadata.Forms__Receipt, [1, 2, 3, 4, 5]);
    this.mockEntities(metadata.MockMetadata.Forms__ServiceForm, [1, 2, 3, 4, 5]);
    this.mockEntities(metadata.MockMetadata.Reports__DetailedCentralizerReport, [1, 2, 3, 4, 5]);
    this.mockEntities(metadata.MockMetadata.Reports__GenericReport, [1, 2, 3, 4, 5]);
    this.mockEntities(metadata.MockMetadata.Reports__ServiceCentralizerReport, [1, 2, 3, 4, 5]);
  }

}
