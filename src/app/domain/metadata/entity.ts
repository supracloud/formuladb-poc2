import { BaseObj } from '../base_obj';
import { Property } from './property';
export class Entity extends BaseObj {
    path:string;
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