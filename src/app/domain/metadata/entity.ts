import { BaseObj } from '../base_obj';

export class Entity extends BaseObj {
    properties: Property[];
    module?: true;

    normalize?() {
        this.properties.forEach((prop, idx) => {
            prop.index = idx;
        });
    }
 
    /**
     * Convert path
     * @param dirPath directory-like path, e.g. /Inventory/Product
     * @return entity like path, e.g. Inventory__Product 
     */
    static fromDirPath(dirPath: string): string {
        return dirPath.replace(/^\//, '').replace(/\//g, '__');
    }

    /**
     * 
     * @param prop get the
     * @returns null for simple properties, entity path for tables and entities (e.g. Inventory__Product)
     */
    static getPropertyPath(prop: Property): string {
        return Entity.fromDirPath(Property.getDirPath(prop));
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
     * For tables and entities return the dirPath for the associated entity
     * @param prop property
     * @returns null for simple properties, entity path for tables and entities (e.g. /Inventory/Product)
     */
    static getDirPath(prop: Property): string {
        let ret = null;

        if (Property.isEntity(prop) || Property.isTable(prop)) {
            let m = prop.type.match(/^(?:TABLE|Entity)\((.*)\)/);
            ret = m[1];
        }

        return ret;
    }
}
