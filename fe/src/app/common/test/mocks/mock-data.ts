/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { Entity } from '../../domain/metadata/entity';
import { InventoryData } from './inventory-data';
import { MusicBookingData } from './musicbooking-data';
import { DataObj } from '../../domain/metadata/data_obj';
import { FormsData } from './forms-data';


export class MockData {

    allData: DataObj[] = InventoryData
        .concat(MusicBookingData)
        .concat(FormsData);

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
