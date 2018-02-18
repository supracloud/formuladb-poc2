import * as _ from 'lodash';

import { NonReservedPropNamesOf, ReservedPropNamesOf } from "../../domain/base_obj";
import { Entity, Pn, isEntityProperty, extendEntityProperties, queryEntityWithDeepPath, EntityProperties, EntityProperty, getEntityIdFromDeepPath } from '../../domain/metadata/entity'

import * as InventoryMetadata from "./inventory-metadata";
import * as GeneralMetadata from "./general-metadata";
import * as FormsMetadata from "./forms-metadata";
import * as ReportsMetadata from "./reports-metadata";
import * as FinancialMetadata from "./financial-metadata";

export * from "./inventory-metadata";
export * from "./general-metadata";
export * from "./forms-metadata";
export * from "./reports-metadata";
export * from "./financial-metadata";

export class MockMetadata {

  public constructor() {

    this.entities.forEach(meta => {
      this.entitiesMap.set(meta._id, meta);
    });

    this.applyInheritance();
  }

  private applyInheritance() {
    this.entities.forEach(entity => {
      _.toPairs(entity).forEach(([propName, prop]) => {
        if (!isEntityProperty(prop)) return;
        if (((prop.propType_ === Pn.SUB_ENTITY && prop.isExtend) || prop.propType_ === Pn.TABLE) && prop.deepPath != null) {
          let referencedEntity = this.entitiesMap.get(getEntityIdFromDeepPath(prop.deepPath));
          if (referencedEntity == null) throw new Error("Cannot find entity for " + prop.deepPath);
          extendEntityProperties(prop, queryEntityWithDeepPath(referencedEntity, prop.deepPath));
        }
      })
    });
  }

  //just for static type checking
  private checkedEntityProperties = [
    GeneralMetadata.General as PickEntityProperties<typeof GeneralMetadata.General>,
    GeneralMetadata.General__Actor as PickEntityProperties<typeof GeneralMetadata.General__Actor>,
    GeneralMetadata.General__Currency as PickEntityProperties<typeof GeneralMetadata.General__Currency>,
    GeneralMetadata.General__Person as PickEntityProperties<typeof GeneralMetadata.General__Person>,
    GeneralMetadata.General__User as PickEntityProperties<typeof GeneralMetadata.General__User>,
    InventoryMetadata.Inventory as PickEntityProperties<typeof InventoryMetadata.Inventory>,
    GeneralMetadata.General__Client as PickEntityProperties<typeof GeneralMetadata.General__Client>,
    InventoryMetadata.Inventory__Order as PickEntityProperties<typeof InventoryMetadata.Inventory__Order>,
    InventoryMetadata.Inventory__Receipt as PickEntityProperties<typeof InventoryMetadata.Inventory__Receipt>,
    InventoryMetadata.Inventory__Product as PickEntityProperties<typeof InventoryMetadata.Inventory__Product>,
    InventoryMetadata.Inventory__ProductUnit as PickEntityProperties<typeof InventoryMetadata.Inventory__ProductUnit>,
    FinancialMetadata.Financial as PickEntityProperties<typeof FinancialMetadata.Financial>,
    FinancialMetadata.Financial__Account as PickEntityProperties<typeof FinancialMetadata.Financial__Account>,
    FinancialMetadata.Financial__Transaction as PickEntityProperties<typeof FinancialMetadata.Financial__Transaction>,
    FormsMetadata.Forms as PickEntityProperties<typeof FormsMetadata.Forms>,
    FormsMetadata.Forms__ServiceForm as PickEntityProperties<typeof FormsMetadata.Forms__ServiceForm>,
    ReportsMetadata.Reports as PickEntityProperties<typeof ReportsMetadata.Reports>,
    ReportsMetadata.Reports__DetailedCentralizerReport as PickEntityProperties<typeof ReportsMetadata.Reports__DetailedCentralizerReport>,
    ReportsMetadata.Reports__GenericReport as PickEntityProperties<typeof ReportsMetadata.Reports__GenericReport>,
    ReportsMetadata.Reports__ServiceCentralizerReport as PickEntityProperties<typeof ReportsMetadata.Reports__ServiceCentralizerReport>,
  ];

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
    FormsMetadata.Forms__ServiceForm as Entity,
    ReportsMetadata.Reports as Entity,
    ReportsMetadata.Reports__DetailedCentralizerReport as Entity,
    ReportsMetadata.Reports__GenericReport as Entity,
    ReportsMetadata.Reports__ServiceCentralizerReport as Entity,
  ];

  public entitiesMap = new Map<string, Entity>();
}

type PickEntityProperties<T> = {
  [P in NonReservedPropNamesOf<T>]: EntityProperty;
}
