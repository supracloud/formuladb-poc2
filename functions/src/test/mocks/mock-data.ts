/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { Entity } from "@domain/metadata/entity";
import { InventoryData } from './inventory-data';
import { DataObj } from '@domain/metadata/data_obj';
import { GeneralData } from './general-data';
import { StaticPagesData } from '../../default_pages/website-data';
import { BookingData } from './booking-data';
import { DefaultData } from '@domain/metadata/default-data';


export class MockData {

    allData: DataObj[] = (GeneralData as any)
        .concat(DefaultData)
        .concat(StaticPagesData)
        .concat(BookingData)
        // .concat(MusicBookingData)
        // .concat(FormsData)
        // .concat(ReportsData)
        .concat(InventoryData)
    ;

    constructor(public entitiesMap: _.Dictionary<Entity>) {
    }

    public get(path: string, id: string): DataObj {
        return this.allData[id];
    }

    public getAllForPath(path: string) {
        const ret: any[] = [];
        for (const obj of this.allData) {
            if (obj._id.indexOf(path) === 0) { ret.push(obj); }
        }
        return ret;
    }

    public getAll() {
        return this.allData;
    }

}
