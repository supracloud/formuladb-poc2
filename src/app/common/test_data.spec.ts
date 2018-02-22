import { Entity, Pn, Schema } from "../../../src/app/common/domain/metadata/entity";
import * as _ from "lodash";

export function makeEntity(id: string, e: any): Entity {
    let ret = _.cloneDeep(e);
    ret._id = id;
    ret.type = 'Entity_';
    return ret;
}

export function makeSchema(...entities: Entity[]): Schema {
    let ret = { _id: "FRMDB_SCHEMA" };
    entities.forEach(e => { ret[e._id] = e });
    return ret as Schema;
}

export const SUM_absolute_path = {
    schema: makeSchema(
        makeEntity('/R/A', {
            aType: { propType_: Pn.STRING },
            num: { propType_: Pn.NUMBER },
        }),
        makeEntity('/R/B', {
            bType: { propType_: Pn.STRING },
            sum: { propType_: Pn.FORMULA, formula: `Fn.SUM('/R/A[aType = {{bType}}]/num')` }
        }),
    ),
    execPlan: {
        triggers: [
            ['/R/B/bType', '/R/B[_id = {{_id}}]/type'],
            ['/R/A/aType', '/R/B[bType = {{aType}}]/sum'],
            ['/R/A/num', '/R/B[bType = {{aType}}]/sum'],
        ],
        formulas: {
            '/R/B/sum': {
                observables: '/R/A[aType = {{bType}}]/num',
                map: `Mn.MAP_TEMPLATE('/R/B[bType = {{aType}}]/num')`,
                reduce: `_sum`,
                queryKey: '/R/B[bType = {{bType}}]/num'
            },
        }
    }
};


export const SUM_relative_path = {
    schema: makeSchema(
        makeEntity('/R/A', {
            num: { propType_: Pn.NUMBER },
            $b: { propType_: Pn.BELONGS_TO, deepPath: '/R/B', foreignKey: 'a' },
        }),
        makeEntity('/R/B', {
            '@a': { propType_: Pn.SUB_TABLE, deepPath: '/R/A', foreignKey: 'b' },
            'sum=': { propType_: Pn.FORMULA, formula: `SUM('@a/num')` }
        })
    ),
    execPlan: {
        triggers: [
            ['/R/A/num', '/R/B[_id = {{b.ref_}}]/sum'],
        ],
        formulas: {
            '/R/B/sum': {
                observables: '/R/A[b/ref_ = {{_id}}]/num',
                map: `Mn.MAP_TEMPLATE('/R/B[_id = {{b.ref_}}]/sum')`,
                reduce: '_sum',
                queryKey: '/R/B[_id = {{_id}}]/sum',
            },
        }
    }
};
