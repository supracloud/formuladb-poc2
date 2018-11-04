/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import { DataObj } from "../../domain/metadata/data_obj";
import { Entity } from '../../domain/metadata/entity';
import { FAKER_MOCK_DATA } from './faker-mock-data';


export class MockData {

    constructor (private entitiesMap: _.Dictionary<Entity>) {
    }

    public getAll() {
        return FAKER_MOCK_DATA;
    }

}
