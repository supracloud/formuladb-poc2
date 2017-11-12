import { BaseObj } from '../base_obj';

/**
 * the _id of the Entity is the path, e.g. Forms__ServiceForm
 */
export class Entity extends BaseObj {
    mwzType = 'Entity_';
    properties: Property[];
    module?: true;

    normalize?() {
        this.properties.forEach((prop, idx) => {
            prop.index = idx;
        });
    }

}

export enum PropertyKind { 
    SIMPLE,
    ENTITY,
    TABLE,
    FORMULA,
}

export class Property {
    name: string;
    type: string;
    // kind: PropertyKind = PropertyKind.SIMPLE;
    allowNull?:boolean;
    copiedProperties?: string[];
    properties?: Property[];
    isLargeTable?: boolean;
    default?: any;
    formula?: any;
    index?: number;

    static isEntity(prop: Property) {
        return prop.type.indexOf('ENTITY(') == 0;
    }
    static isTable(prop: Property) {
        return prop.type.indexOf('TABLE(') == 0;
    }

    /**
     * For tables and entities return the path for the associated entity
     * @param prop property
     * @returns null for simple properties, entity path for tables and entities (e.g. Inventory__Product)
     */
    static getPath(prop: Property): string {
        let ret = null;

        if (Property.isEntity(prop) || Property.isTable(prop)) {
            let m = prop.type.match(/^(?:TABLE|Entity)\((\w+)\)/);
            ret = m[1];
        }

        return ret;
    }
}
