import { BaseObj } from '../base_obj';
export class Property {
    name:string;
    type:string;
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
