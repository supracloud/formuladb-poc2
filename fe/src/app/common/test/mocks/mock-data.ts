/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { Entity } from '../../domain/metadata/entity';
import { InventoryData } from './inventory-data';


export class MockData {

    allData = InventoryData;

    constructor(private entitiesMap: _.Dictionary<Entity>) {
    }

    public getAllForPath(path: string) {
        let ret: any[] = [];
        for (let obj of this.allData) {
            if (obj._id.indexOf(path) == 0) ret.push(obj);
        }
        return ret;
    }

    public getAll() {
        return this.allData;
    }

}
