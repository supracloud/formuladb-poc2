import { BaseObj } from '../base_obj';
export class Property {
    name:string;
    type:string;
    allowNull?:boolean;
    copiedProperties?: string[];
    isLargeTable?: boolean;
    default?: any;
    formula?: any;
    gridRow?: number;
    index?: number;

    static isEntity(prop: Property) {
        return prop.type.indexOf('ENTITY(') == 0;
    }
    static isTable(prop: Property) {
        return prop.type.indexOf('TABLE(') == 0;
    }
}
