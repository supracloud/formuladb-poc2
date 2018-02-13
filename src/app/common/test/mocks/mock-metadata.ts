import * as _ from 'lodash';

import { Entity, PropertyTypeN } from '../../domain/metadata/entity'

import * as InventoryMetadata from "./inventory-metadata";
import * as GeneralMetadata from "./general-metadata";
import * as FormsMetadata from "./forms-metadata";
import * as ReportsMetadata from "./reports-metadata";
import * as FinancialMetadata from "./financial-metadata";

import { extendEntityProperties, queryEntityPropertiesWithDeepPath, getEntityIdFromDeepPath } from "../../domain.utils";

export * from "./inventory-metadata";
export * from "./general-metadata";
export * from "./forms-metadata";
export * from "./reports-metadata";
export * from "./financial-metadata";

export class MockMetadata {

  public constructor() {
    this.entities.forEach(meta => {
      meta.properties.type_ = { type: PropertyTypeN.STRING };
      meta.properties._id = { type: PropertyTypeN.STRING };
      meta.properties._rev = {type: PropertyTypeN.STRING};
    });

    this.entities.forEach(meta => {
      this.entitiesMap.set(meta._id, meta);
    });
  }

  private applyInheritance() {
    this.entities.forEach(entity => {
      _.toPairs(entity.properties).forEach(([propName, prop]) => {
        if ((prop.type === PropertyTypeN.EXTEND_ENTITY || prop.type === PropertyTypeN.TABLE) && prop.entity != null) {
          let referencedEntity = this.entitiesMap.get(getEntityIdFromDeepPath(prop.entity.deepPath));
          extendEntityProperties(prop.properties, queryEntityPropertiesWithDeepPath(referencedEntity.properties, prop.entity.deepPath));
        }
      })
    });
  }

  public entities: Entity[] = [
    GeneralMetadata.General as Entity,
    GeneralMetadata.General__Actor as Entity,
    GeneralMetadata.General__Currency as Entity,
    GeneralMetadata.General__Person as Entity,
    GeneralMetadata.General__User as Entity,
    InventoryMetadata.Inventory as Entity,
    GeneralMetadata.General__Client as Entity,
    InventoryMetadata.Inventory__Order as Entity,
    InventoryMetadata.Inventory__Receipt as Entity,
    InventoryMetadata.Inventory__Product as Entity,
    InventoryMetadata.Inventory__ProductUnit as Entity,
    FinancialMetadata.Financial as Entity,
    FinancialMetadata.Financial__Account as Entity,
    FinancialMetadata.Financial__Transaction as Entity,
    FormsMetadata.Forms as Entity,
    FormsMetadata.Forms__Receipt as Entity,
    FormsMetadata.Forms__Order as Entity,
    FormsMetadata.Forms__ServiceForm as Entity,
    ReportsMetadata.Reports as Entity,
    ReportsMetadata.Reports__DetailedCentralizerReport as Entity,
    ReportsMetadata.Reports__GenericReport as Entity,
    ReportsMetadata.Reports__ServiceCentralizerReport as Entity,
  ];

  public entitiesMap = new Map<string, Entity>();
}
