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
}