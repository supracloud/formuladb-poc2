import * as metadata from './mock-metadata';
import { Entity } from '../../domain/metadata/entity'

import { DataObj } from "../../domain/metadata/data_obj";

const nouns: string[] = ["Lama", "Basket", "Freckle", "Taco", "Suspect", "Ball", "Moustache", "Semantic", "Charlie", "Bouquet"];
const adjectives: string[] = ["Chic", "Cracked", "Tender", "Tourquoise", "Vengeful", "Cranberry", "Shy", "Liquid", "Whining"]

export class MockData {

  private mockDB: Map<String, Map<string, DataObj>> = new Map();

  public constructor() {
    this.mockData();
  }

  public getAll(path: string): DataObj[] {
    return Array.from(this.mockDB.get(path).values());
  }

  public get(path: string, id: string): DataObj {
    return this.mockDB.get(path).get(id);
  }
  
  mockEntity(entity: Entity, nbEntities: number) {
    let db: Map<string, DataObj> = new Map();
    this.mockDB.set(entity.path, db);
    for (let i: number = 0; i < nbEntities; i++) {
      let ret = { mwzType: entity.path, _id: `123400${i}` };
      entity.properties.forEach((p, index) => {
        p.grid_row = index;
        if (p.name == "_id") {
          //already set above
        } else if (p.name == "_rev") {
          //do nothing
        } else if (p.name == "mwzType") {
          //do nothing
        } else if (p.type == "integer") {
          ret[p.name] = Math.random() * 100;
        } else if (p.type == "decimal") {
          ret[p.name] = Math.random() * 100;
        } else if (p.type == "float") {
          ret[p.name] = Math.random() * 112.45;
        } else if (p.type == "string") {
          ret[p.name] = p.name + Math.random() * 10000;
        } else if (p.type == "text") {
          ret[p.name] = p.name + "_" + p.name + "_" + Math.random() * 10000;
        } else if (p.type == "datetime") {
          ret[p.name] = new Date();
        } else if (p.type.match(/^TABLE\(|^ENTITY\(/)) {
          console.error("references not currently mocked: TODO");
          ret[p.name] = null;
        }
      });
      db.set(ret._id, ret);
    }
  }

  mockName(): string {
    return adjectives[Math.floor(Math.random() * adjectives.length)] + " " + nouns[Math.floor(Math.random() * nouns.length)];
  }

  mockData() {
    console.log("mockData called");
    this.mockEntity(metadata.MockMetadata.General__Actor, 5);
    this.mockEntity(metadata.MockMetadata.General__Currency, 5);
    this.mockEntity(metadata.MockMetadata.General__GenericUser, 5);
    this.mockEntity(metadata.MockMetadata.General__Person, 5);
    this.mockEntity(metadata.MockMetadata.General__User, 5);
    this.mockEntity(metadata.MockMetadata.Inventory__Client, 5);
    this.mockEntity(metadata.MockMetadata.Inventory__InventoryProduct, 5);
    this.mockEntity(metadata.MockMetadata.Inventory__ProductListItem, 5);
    this.mockEntity(metadata.MockMetadata.Inventory__Product, 5);
    this.mockEntity(metadata.MockMetadata.Inventory__ProductUnitCategory, 5);
    this.mockEntity(metadata.MockMetadata.Inventory__ProductUnit, 5);
    this.mockEntity(metadata.MockMetadata.Inventory__Supplier, 5);
    this.mockEntity(metadata.MockMetadata.TestApplication__Acquisition, 5);
    this.mockEntity(metadata.MockMetadata.TestApplication__DetailedCentralizerReport, 5);
    this.mockEntity(metadata.MockMetadata.TestApplication__GenericReport, 5);
    this.mockEntity(metadata.MockMetadata.TestApplication__Order, 5);
    this.mockEntity(metadata.MockMetadata.TestApplication__ProductForm, 5);
    this.mockEntity(metadata.MockMetadata.TestApplication__ServiceCentralizerReport, 5);
    this.mockEntity(metadata.MockMetadata.TestApplication__ServiceForm, 5);
    this.mockEntity(metadata.MockMetadata.TestApplication__ServiceFormUnit, 5);
  }

}
